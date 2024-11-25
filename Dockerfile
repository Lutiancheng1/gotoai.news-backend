FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install

# 复制源代码和 tsconfig.json
COPY . .

# 编译 TypeScript
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 只复制必要的文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./

# 只安装生产依赖
RUN npm ci --only=production \
    && npm cache clean --force

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 5002
CMD ["node", "dist/app.js"] 