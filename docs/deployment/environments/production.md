# 生产环境配置指南

## 概述

生产环境配置提供高性能、高可用性和安全性的部署方案，适用于生产环境的项目管理平台。

## 生产环境架构

```
生产环境
├── 负载均衡器 (Nginx/ALB)
├── Web服务器集群 (Nginx)
├── 应用服务器集群 (Node.js PM2)
├── 主数据库 (PostgreSQL 主从)
├── 缓存服务器 (Redis Cluster)
├── 文件存储 (S3/OSS)
├── CDN (CloudFlare/AWS CloudFront)
├── 监控服务 (Prometheus + Grafana)
└── 日志收集 (ELK Stack)
```

## 环境要求

### 硬件要求

#### 最小配置
- **Web服务器**: 2核CPU, 4GB RAM, 50GB SSD
- **应用服务器**: 4核CPU, 8GB RAM, 100GB SSD
- **数据库服务器**: 4核CPU, 16GB RAM, 200GB SSD
- **缓存服务器**: 2核CPU, 4GB RAM, 50GB SSD

#### 推荐配置
- **Web服务器**: 4核CPU, 8GB RAM, 100GB SSD
- **应用服务器**: 8核CPU, 16GB RAM, 200GB SSD
- **数据库服务器**: 8核CPU, 32GB RAM, 500GB SSD
- **缓存服务器**: 4核CPU, 8GB RAM, 100GB SSD

### 软件要求

- **操作系统**: Ubuntu 20.04 LTS / CentOS 8+
- **Node.js**: 18.x LTS
- **Nginx**: 1.20+
- **PostgreSQL**: 13+
- **Redis**: 6.2+
- **PM2**: 5.x

## 安全配置

### 1. 防火墙配置

```bash
#!/bin/bash
# scripts/setup-firewall.sh

# 启用UFW
sudo ufw enable

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许应用端口
sudo ufw allow 3000/tcp

# 拒绝其他入站连接
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 查看状态
sudo ufw status verbose
```

### 2. SSL/TLS配置

#### 使用Let's Encrypt

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx SSL配置

```nginx
# /etc/nginx/sites-available/project-management
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头部
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;";

    # 根目录
    root /var/www/project-management/current/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全配置
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(config|env) {
        deny all;
    }
}
```

### 3. 应用安全配置

#### 环境变量

创建 `.env.production` 文件：

```bash
# 应用配置
VITE_APP_TITLE=项目管理平台
VITE_APP_VERSION=1.0.0
NODE_ENV=production

# 安全配置
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-super-secret-session-key-min-32-chars
ENCRYPTION_KEY=your-32-char-encryption-key

# API配置
VITE_API_BASE_URL=https://api.your-domain.com
VITE_API_TIMEOUT=10000

# 数据库配置
DATABASE_URL=postgresql://prod_user:secure_password@db-server:5432/project_management
DATABASE_SSL=true

# 缓存配置
REDIS_URL=redis://cache-server:6379/0
REDIS_PASSWORD=secure_redis_password

# 文件存储
S3_BUCKET=your-production-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_ZONE_ID=your-zone-id
CLOUDFLARE_API_TOKEN=your-api-token

# 监控和日志
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
LOG_LEVEL=warn
SENTRY_ENVIRONMENT=production

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_CSRF_PROTECTION=true
VITE_ENABLE_RATE_LIMITING=true

# 第三方服务
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# 邮件配置
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=项目管理平台 <noreply@your-domain.com>
```

## 数据库配置

### 1. PostgreSQL主从配置

#### 主服务器配置

```bash
# /etc/postgresql/13/main/postgresql.conf
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL配置
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 32
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/13/main/archive/%f'
```

```bash
# /etc/postgresql/13/main/pg_hba.conf
# 允许本地连接
local   all             all                                     trust
# 允许内网连接
host    all             all             10.0.0.0/8            md5
# 允许复制连接
host    replication     all             10.0.0.0/8            md5
```

#### 从服务器配置

```bash
# /etc/postgresql/13/main/postgresql.conf
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
hot_standby = on
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
```

```bash
# 配置从服务器
sudo -u postgres pg_basebackup -h master-ip -D /var/lib/postgresql/13/main/ -U replicator -v -P -W
```

### 2. 数据库迁移脚本

```bash
#!/bin/bash
# scripts/migrate-production.sh

echo "开始数据库迁移..."

# 备份当前数据库
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 运行迁移
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_indexes.sql
psql $DATABASE_URL -f migrations/003_constraints.sql

# 更新统计信息
psql $DATABASE_URL -c "ANALYZE;"

echo "数据库迁移完成"
```

## 缓存配置

### 1. Redis集群配置

```bash
# /etc/redis/redis.conf
port 6379
bind 0.0.0.0
protected-mode no
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### 2. 缓存策略

```typescript
// src/utils/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class CacheManager {
  // 设置缓存
  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value))
  }

  // 获取缓存
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  }

  // 删除缓存
  static async del(key: string): Promise<void> {
    await redis.del(key)
  }

  // 清除模式匹配的缓存
  static async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
```

## 应用部署

### 1. PM2配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'project-management-api',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/project-management-error.log',
    out_file: '/var/log/pm2/project-management-out.log',
    log_file: '/var/log/pm2/project-management-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### 2. 部署脚本

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "开始生产环境部署..."

# 变量定义
APP_NAME="project-management"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
CURRENT_LINK="$APP_DIR/current"
RELEASE_DIR="$APP_DIR/releases/$(date +%Y%m%d_%H%M%S)"

# 创建目录
sudo mkdir -p $APP_DIR/{releases,shared}
sudo mkdir -p $BACKUP_DIR

# 备份当前版本
if [ -L "$CURRENT_LINK" ]; then
    echo "备份当前版本..."
    cp -r $(readlink $CURRENT_LINK) $BACKUP_DIR/$(basename $(readlink $CURRENT_LINK))_backup_$(date +%Y%m%d_%H%M%S)
fi

# 创建新版本目录
echo "创建新版本目录..."
mkdir -p $RELEASE_DIR

# 安装依赖和构建
echo "安装依赖和构建..."
pnpm install --frozen-lockfile
pnpm build

# 复制构建文件
echo "复制构建文件..."
cp -r dist/* $RELEASE_DIR/

# 创建符号链接
echo "更新符号链接..."
cd $APP_DIR
rm -f current
ln -s $(basename $RELEASE_DIR) current

# 设置权限
echo "设置权限..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# 重启应用
echo "重启应用..."
pm2 reload $APP_NAME

# 清理旧版本（保留5个）
echo "清理旧版本..."
cd $APP_DIR/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "部署完成！"
```

### 3. 回滚脚本

```bash
#!/bin/bash
# scripts/rollback-production.sh

set -e

echo "开始回滚..."

APP_NAME="project-management"
APP_DIR="/var/www/$APP_NAME"
CURRENT_LINK="$APP_DIR/current"

# 获取上一个版本
PREVIOUS_RELEASE=$(ls -t $APP_DIR/releases | head -2 | tail -1)

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "没有找到可回滚的版本"
    exit 1
fi

echo "回滚到版本: $PREVIOUS_RELEASE"

# 备份当前版本
cp -r $(readlink $CURRENT_LINK) $APP_DIR/releases/$(basename $(readlink $CURRENT_LINK))_backup_$(date +%Y%m%d_%H%M%S)

# 切换到上一个版本
cd $APP_DIR
rm -f current
ln -s $PREVIOUS_RELEASE current

# 重启应用
pm2 reload $APP_NAME

echo "回滚完成！"
```

## 监控和告警

### 1. 系统监控

#### 安装监控工具

```bash
# 安装Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.3.1.linux-amd64.tar.gz
sudo cp node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin/
sudo useradd -rs /bin/false node_exporter

# 创建systemd服务
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

#### Prometheus配置

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'project_management'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### 2. 应用监控

```typescript
// src/utils/monitoring.ts
import { init } from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'

// Sentry配置
init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})

// 自定义指标
export function trackApiCall(endpoint: string, duration: number, statusCode: number) {
  // 发送自定义指标到监控系统
  console.log(`API_CALL: ${endpoint} ${duration}ms ${statusCode}`)
}

export function trackUserAction(action: string, userId: string) {
  // 跟踪用户行为
  console.log(`USER_ACTION: ${action} ${userId}`)
}
```

### 3. 日志管理

#### ELK Stack配置

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/pm2/*.log
    - /var/log/nginx/*.log
    - /var/log/project-management/*.log
  fields:
    service: project-management
    environment: production
  fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "project-management-%{+yyyy.MM.dd}"

setup.template.name: "project-management"
setup.template.pattern: "project-management-*"
```

## 备份策略

### 1. 数据库备份

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/var/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/project_management_$DATE.sql"

mkdir -p $BACKUP_DIR

# 创建数据库备份
pg_dump $DATABASE_URL > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 上传到云存储（可选）
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/database/

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "数据库备份完成: $BACKUP_FILE.gz"
```

### 2. 文件备份

```bash
#!/bin/bash
# scripts/backup-files.sh

BACKUP_DIR="/var/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/project_management_files_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# 备份上传的文件
tar -czf $BACKUP_FILE /var/www/project-management/shared/uploads

# 上传到云存储
# aws s3 cp $BACKUP_FILE s3://your-backup-bucket/files/

# 清理旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "文件备份完成: $BACKUP_FILE"
```

### 3. 自动备份计划

```bash
# 添加到crontab
# 每天凌晨2点备份数据库
0 2 * * * /var/www/project-management/scripts/backup-database.sh

# 每周日凌晨3点备份文件
0 3 * * 0 /var/www/project-management/scripts/backup-files.sh
```

## 性能优化

### 1. Nginx优化

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # 缓冲区配置
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 2. 应用优化

```typescript
// src/utils/performance.ts
import { performance } from 'perf_hooks'

export class PerformanceMonitor {
  static startTimer(label: string): void {
    performance.mark(`${label}-start`)
  }

  static endTimer(label: string): number {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    return measure.duration
  }

  static logMemoryUsage(): void {
    const usage = process.memoryUsage()
    console.log('Memory Usage:', {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    })
  }
}
```

## 故障恢复

### 1. 健康检查

```bash
#!/bin/bash
# scripts/health-check.sh

APP_URL="https://your-domain.com"
API_URL="https://api.your-domain.com/health"

# 检查Web服务
if ! curl -f -s $APP_URL > /dev/null; then
    echo "Web服务不可用"
    # 发送告警
    # 尝试重启服务
    pm2 restart project-management-api
fi

# 检查API服务
if ! curl -f -s $API_URL > /dev/null; then
    echo "API服务不可用"
    # 发送告警
    # 尝试重启服务
    pm2 restart project-management-api
fi

# 检查数据库连接
if ! pg_isready -h db-server -p 5432; then
    echo "数据库连接失败"
    # 发送告警
fi

# 检查Redis连接
if ! redis-cli -h cache-server ping > /dev/null; then
    echo "Redis连接失败"
    # 发送告警
fi

echo "健康检查完成"
```

### 2. 灾难恢复计划

1. **数据库故障**
   - 自动切换到从库
   - 通知DBA进行修复

2. **应用服务器故障**
   - 负载均衡器自动移除故障节点
   - PM2自动重启应用

3. **整个数据中心故障**
   - 切换到备用数据中心
   - 从备份恢复数据

## 维护计划

### 定期维护任务

1. **每日**
   - 检查系统日志
   - 监控资源使用情况
   - 检查备份状态

2. **每周**
   - 更新系统补丁
   - 清理临时文件
   - 检查SSL证书有效期

3. **每月**
   - 性能优化
   - 安全扫描
   - 灾难恢复测试

4. **每季度**
   - 容量规划
   - 架构评估
   - 安全审计

## 最佳实践

1. **安全**
   - 定期更新系统和依赖
   - 使用强密码和密钥
   - 启用防火墙和SSL
   - 定期安全扫描

2. **性能**
   - 监控关键指标
   - 优化数据库查询
   - 使用缓存策略
   - 实施CDN

3. **可用性**
   - 多节点部署
   - 负载均衡
   - 自动故障转移
   - 定期备份

4. **监控**
   - 全方位监控
   - 及时告警
   - 日志分析
   - 性能追踪

## 下一步

完成生产环境配置后，可以：
- 查看[Docker部署方案](../docker/docker-compose.prod.yml)了解容器化部署
- 查看[CI/CD配置](../cicd/github-actions.yml)了解自动化部署
- 查看[故障排除指南](../troubleshooting/common-issues.md)了解常见问题