FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 5002
CMD ["npm", "start"] 