#!/bin/bash

# 确保脚本在错误时停止
set -e

# 1. 拉取最新代码
git pull

# 2. 构建并启动服务
docker-compose down
docker-compose up -d --build

# 3. 等待服务启动
echo "等待服务启动..."
sleep 10

# 4. 检查服务状态
docker-compose ps

# 5. 显示日志
docker-compose logs -f 