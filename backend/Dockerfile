# Production Dockerfile for Campus Event Backend
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose default backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
