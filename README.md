# Talent Management Platform

一个现代化的人才管理平台，使用 TypeScript + React + Node.js + MongoDB 构建。

## 🌟 功能特性

- 📊 人才信息管理
- 🔐 用户权限控制
- 📝 新闻资讯管理
- 🗂 分类管理
- 📤 文件上传管理
- 📱 响应式设计
- 🔍 Swagger API 文档

## 🛠 技术栈

### 前端

- React 18
- TypeScript
- Ant Design
- Redux Toolkit
- TailwindCSS
- React Router DOM

### 后端

- Node.js
- Express
- MongoDB
- Redis
- JWT Authentication
- Swagger UI

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis

### 安装部署

1. 克隆项目

```bash
git clone https://github.com/Lutiancheng1/gotoai.news-backend.git
```

2. 创建环境变量文件

```bash
cd gotoai.news-backend
cp .env.example .env
```

3. 修改环境变量配置

```env
# MongoDB Configuration
MONGO_USERNAME=your_username
MONGO_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

4. 使用 Docker Compose 启动

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📁 项目结构

```
talent-platform/
├── admin/                 # 前端管理系统
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   └── utils/       # 工具函数
│   └── package.json
├── src/                  # 后端服务
│   ├── controllers/     # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── middlewares/    # 中间件
│   └── utils/          # 工具函数
├── docker-compose.yml    # Docker 编排配置
└── package.json
```

## 🔧 开发指南

### 开发环境启动

```bash
# 启动后端服务
npm run dev

# 启动前端开发服务器
cd admin && npm start
```

### 访问地址

- 前端管理系统：http://localhost:3001
- API 文档：http://localhost:5002/api-docs

## 🔒 安全性

- 使用 JWT 进行身份认证
- 密码加密存储
- 文件上传验证
- API 访问限制
- CORS 配置

## 📝 数据备份

数据通过 Docker volumes 持久化存储：

- MongoDB 数据: `mongodb_data`
- Redis 数据: `redis_data`
- 上传文件: `./uploads`

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

[ISC License](LICENSE)
