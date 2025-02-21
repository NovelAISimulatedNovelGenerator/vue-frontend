# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install --save-dev @types/node

COPY . .

# 直接构建，跳过类型检查
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD [ "http-server", "dist", "-p", "8080" ]
