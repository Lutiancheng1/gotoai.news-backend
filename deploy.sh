#!/bin/bash

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "端口 $port 已被占用，请先释放该端口"
        exit 1
    fi
}

# 检查必要端口
check_port 3001
check_port 5002

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