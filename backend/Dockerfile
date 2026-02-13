FROM node:22-bookworm-slim

# Install AWS CLI and other dependencies
RUN apt-get update && apt-get install -y \
    awscli \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Environment variables
ENV PORT=5000
ENV AWS_PROFILE=hibernate

EXPOSE 5000

# Start backend
CMD ["node", "server.mjs"]
