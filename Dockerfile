# Development stage
FROM node:18-alpine AS development
WORKDIR /app
# Không set NODE_ENV=development ở đây để tránh ảnh hưởng việc cài devDependencies nếu có logic khác
# Mặc định npm install sẽ cài tất cả

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install TOÀN BỘ dependencies (bao gồm cả devDependencies để chạy build)
# Lưu ý: Không set ENV NODE_ENV=production ở dòng này
RUN npm ci

# 3. Copy source code
COPY . .

# 4. Build ứng dụng (Babel sẽ biên dịch src -> dist)
RUN npm run build

# 5. Sau khi build xong, xóa devDependencies để giảm nhẹ image
RUN npm prune --production

# 6. Thiết lập biến môi trường runtime
ENV NODE_ENV=production

# 7. Expose port
EXPOSE 5000

# 8. Start server
CMD ["npm", "run", "start:prod"]