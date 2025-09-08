FROM node:18-alpine AS dev
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
