#!/bin/bash

# 检查端口占用
check_port() {
    local port=$1
    
    # 使用 netstat 检查（大多数 Linux 系统默认安装）
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep ":$port " &> /dev/null; then
            echo "端口 $port 已被占用，请先释放该端口"
            exit 1
        fi
    # 使用 lsof 检查（如果可用）
    elif command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t &> /dev/null; then
            echo "端口 $port 已被占用，请先释放该端口"
            exit 1
        fi
    # 使用 ss 检查（现代 Linux 系统）
    elif command -v ss &> /dev/null; then
        if ss -tuln | grep ":$port " &> /dev/null; then
            echo "端口 $port 已被占用，请先释放该端口"
            exit 1
        fi
    else
        echo "警告：未找到端口检查工具，跳过端口检查"
        return 0
    fi
}



# 确保脚本在错误时停止
set -e

# 1. 拉取最新代码
git pull

# 2. 构建并启动服务
docker-compose down

# 检查必要端口
check_port 5002
check_port 6388

mkdir -p uploads
chmod 777 uploads

docker-compose up -d --build

# 3. 等待服务启动
echo "等待服务启动..."
sleep 15

# 4. 检查服务状态
docker-compose ps

echo "检查服务可用性..."
curl -I http://localhost:5002/api-docs || (docker-compose logs backend && echo "后端服务未就绪")

# 5. 显示日志
docker-compose logs -f 
