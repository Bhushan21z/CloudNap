FROM node:22-bookworm-slim

WORKDIR /app/frontend

COPY package*.json ./
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

# Install a simple static server to host the build on port 5173
RUN npm install -g serve

EXPOSE 5173

# Serve the dist folder on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
