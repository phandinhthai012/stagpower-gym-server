# Base stage
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000

# Production image
FROM base AS production
CMD ["npm", "run", "start"]

# Development image (giữ nodemon + hot reload)
FROM node:18-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]