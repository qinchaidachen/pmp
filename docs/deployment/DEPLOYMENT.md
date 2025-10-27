# 项目管理平台部署指南

## 概述

本指南提供了项目管理平台的完整部署流程，包括开发、测试、生产环境的配置说明，以及Docker部署、CI/CD配置、性能优化和故障排除等内容。

## 目录结构

```
docs/deployment/
├── DEPLOYMENT.md          # 主要部署指南（本文件）
├── environments/          # 环境配置指南
│   ├── development.md     # 开发环境配置
│   ├── testing.md         # 测试环境配置
│   └── production.md      # 生产环境配置
├── docker/               # Docker部署方案
│   ├── Dockerfile         # Docker镜像构建文件
│   ├── docker-compose.yml # Docker Compose配置
│   └── docker-compose.prod.yml # 生产环境Docker配置
├── cicd/                 # CI/CD配置
│   └── github-actions.yml # GitHub Actions配置示例
├── monitoring/           # 监控和性能优化
│   ├── performance.md    # 性能优化建议
│   └── monitoring.md     # 监控配置指南
└── troubleshooting/      # 故障排除
    ├── common-issues.md  # 常见问题
    └── debugging.md      # 调试指南
```

## 快速开始

### 前置要求

- Node.js 18+ 
- pnpm 8+
- Docker 20.10+
- Git

### 本地开发环境部署

1. 克隆项目：
```bash
git clone <repository-url>
cd project-management-platform
```

2. 安装依赖：
```bash
pnpm install
```

3. 启动开发服务器：
```bash
pnpm dev
```

4. 访问应用：
打开浏览器访问 `http://localhost:5173`

### 生产环境部署

详细的生产环境部署步骤请参考：
- [生产环境配置](./environments/production.md)
- [Docker部署方案](./docker/docker-compose.prod.yml)
- [CI/CD配置](./cicd/github-actions.yml)

## 环境变量配置

项目支持以下环境变量：

```bash
# 应用配置
VITE_APP_TITLE=项目管理平台
VITE_APP_VERSION=1.0.0

# API配置
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# 第三方服务
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

## 部署流程

### 1. 代码准备

```bash
# 确保代码是最新的
git pull origin main

# 运行测试
pnpm test

# 构建生产版本
pnpm build
```

### 2. 环境配置

根据目标环境配置相应的环境变量文件：
- 开发环境：`.env.development`
- 测试环境：`.env.testing`
- 生产环境：`.env.production`

### 3. 部署执行

#### 方式一：Docker部署
```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

#### 方式二：传统部署
```bash
# 上传dist目录到服务器
scp -r dist/ user@server:/var/www/project-management/

# 配置nginx
sudo cp nginx.conf /etc/nginx/sites-available/project-management
sudo ln -s /etc/nginx/sites-available/project-management /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 安全配置

### HTTPS配置
- 使用Let's Encrypt获取免费SSL证书
- 配置HSTS头
- 启用安全头部

### 访问控制
- 配置防火墙规则
- 设置IP白名单（如需要）
- 配置认证机制

## 备份策略

### 数据库备份
```bash
# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/database"
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -h localhost -U username -d project_db > $BACKUP_DIR/backup_$DATE.sql

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### 文件备份
- 定期备份上传的文件
- 备份配置文件
- 备份日志文件

## 监控和告警

详细的监控配置请参考：
- [性能优化建议](./monitoring/performance.md)
- [监控配置指南](./monitoring/monitoring.md)

## 故障排除

常见问题和解决方案请参考：
- [常见问题](./troubleshooting/common-issues.md)
- [调试指南](./troubleshooting/debugging.md)

## 支持

如果在部署过程中遇到问题，请：
1. 查看故障排除文档
2. 检查日志文件
3. 联系技术支持团队

## 更新日志

- v1.0.0 - 初始版本部署指南
- 详细更新记录请参考项目CHANGELOG.md