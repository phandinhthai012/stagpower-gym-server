# Development stage
FROM node:18-alpine AS development
WORKDIR /app
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (needs babel from devDependencies)
RUN npm run build

# Remove devDependencies to reduce image size (optional but recommended)
RUN npm prune --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:prod"]
