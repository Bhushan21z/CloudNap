FROM node:22-bookworm-slim

# Install AWS CLI and other dependencies
RUN apt-get update && apt-get install -y \
    awscli \
    wget \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Environment variables
ENV PORT=5000
ENV AWS_PROFILE=hibernate

EXPOSE 5000

# Start backend
CMD ["node", "backend/server.mjs"]
