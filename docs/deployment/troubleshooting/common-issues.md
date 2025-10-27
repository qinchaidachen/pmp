# 常见问题排查指南

## 概述

本文档提供了项目管理平台部署和运行过程中常见问题的排查方法和解决方案，按照问题类型进行分类整理。

## 目录

- [部署问题](#部署问题)
- [性能问题](#性能问题)
- [数据库问题](#数据库问题)
- [网络问题](#网络问题)
- [认证问题](#认证问题)
- [存储问题](#存储问题)
- [监控问题](#监控问题)

## 部署问题

### 1. 构建失败

#### 问题现象
```bash
ERROR: npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: project-management-platform@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! node_modules/react
npm ERR!   peer react@"^18.2.0" from @testing-library/react@13.4.0
```

#### 排查步骤
1. **检查Node.js版本**
```bash
node --version  # 应为 18.x
npm --version   # 应为 8.x+
```

2. **清理缓存和依赖**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

3. **检查依赖冲突**
```bash
npm ls react
npm ls @types/react
```

#### 解决方案
```bash
# 使用pnpm替代npm
npm install -g pnpm
pnpm install --frozen-lockfile

# 或解决依赖冲突
npm install --legacy-peer-deps
```

### 2. Docker构建失败

#### 问题现象
```dockerfile
ERROR: failed to solve: process "/bin/sh -c pnpm install" did not complete successfully: exit code: 1
```

#### 排查步骤
1. **检查Dockerfile语法**
```dockerfile
# 错误示例
RUN pnpm install  # pnpm未安装
```

2. **检查网络连接**
```bash
docker run --rm -it node:18-alpine sh
apk add --no-cache curl
curl -I https://registry.npmjs.org/
```

#### 解决方案
```dockerfile
# 正确示例
FROM node:18-alpine
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

### 3. 环境变量未生效

#### 问题现象
应用启动后读取不到环境变量值

#### 排查步骤
1. **检查环境变量文件**
```bash
# 检查.env文件是否存在且格式正确
cat .env
# 应为 KEY=value 格式，无引号
```

2. **验证变量加载**
```typescript
// 在应用中打印环境变量
console.log('Environment variables:', process.env)
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
```

3. **检查变量名格式**
```bash
# Vite环境变量必须以VITE_开头
VITE_API_BASE_URL=https://api.example.com  # 正确
API_BASE_URL=https://api.example.com       # 错误
```

#### 解决方案
```bash
# .env文件
VITE_APP_TITLE=项目管理平台
VITE_API_BASE_URL=https://api.example.com
NODE_ENV=production

# 重新启动应用
npm run dev
```

## 性能问题

### 1. 应用启动缓慢

#### 问题现象
开发服务器启动时间超过30秒

#### 排查步骤
1. **检查依赖数量**
```bash
npm ls --depth=0
# 查找是否有循环依赖
```

2. **检查TypeScript配置**
```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,        // 跳过库文件检查
    "noEmit": false,             // 生成声明文件
    "incremental": true          // 增量编译
  }
}
```

3. **检查Vite配置**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom']  // 预构建依赖
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog']
        }
      }
    }
  }
})
```

#### 解决方案
```bash
# 优化启动时间
npm run build  # 生产构建通常更快
# 或使用快速模式
vite --mode development
```

### 2. 页面加载缓慢

#### 问题现象
首屏加载时间超过3秒

#### 排查步骤
1. **分析包大小**
```bash
# 使用webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

2. **检查资源加载**
```javascript
// 在浏览器控制台执行
performance.getEntriesByType('navigation').forEach(nav => {
  console.log('DOM Content Loaded:', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart)
  console.log('Load Complete:', nav.loadEventEnd - nav.loadEventStart)
})
```

3. **检查网络请求**
```javascript
// 监控网络请求
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`)
  })
})
observer.observe({ entryTypes: ['resource'] })
```

#### 解决方案
```typescript
// 代码分割
const LazyComponent = lazy(() => import('./Component'))

// 图片懒加载
<img loading="lazy" src="image.jpg" alt="">

// 资源预加载
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. 内存泄漏

#### 问题现象
长时间运行后浏览器或服务器内存使用持续增长

#### 排查步骤
1. **内存快照分析**
```javascript
// Chrome DevTools
// 1. 打开Memory标签
// 2. Take Heap Snapshot
// 3. 分析内存快照
```

2. **检查事件监听器**
```typescript
// 常见内存泄漏模式
useEffect(() => {
  const handler = () => console.log('click')
  window.addEventListener('click', handler)
  
  return () => {
    window.removeEventListener('click', handler)  // 清理函数
  }
}, [])
```

3. **检查定时器**
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // 定时任务
  }, 1000)
  
  return () => {
    clearInterval(timer)  // 清理定时器
  }
}, [])
```

#### 解决方案
```typescript
// 正确清理资源
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data))
  
  return () => {
    controller.abort()  // 取消请求
  }
}, [])

// 避免闭包陷阱
const [data, setData] = useState(null)

useEffect(() => {
  let isCancelled = false
  
  fetchData().then(result => {
    if (!isCancelled) {
      setData(result)
    }
  })
  
  return () => {
    isCancelled = true
  }
}, [])
```

## 数据库问题

### 1. 连接超时

#### 问题现象
```sql
ERROR:  could not connect to server: Connection timed out
FATAL:  no pg_hba.conf entry for host "192.168.1.100"
```

#### 排查步骤
1. **检查网络连接**
```bash
# 测试数据库端口
telnet db-server 5432
# 或使用nc
nc -zv db-server 5432
```

2. **检查pg_hba.conf配置**
```bash
# PostgreSQL配置文件
sudo nano /etc/postgresql/13/main/pg_hba.conf

# 添加允许的IP段
host    all             all             192.168.1.0/24            md5
```

3. **检查防火墙设置**
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow from 192.168.1.0/24 to any port 5432

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --add-rich-rule="rule family='ipv4' source address='192.168.1.0/24' port protocol='tcp' port='5432' accept"
```

#### 解决方案
```bash
# 重启PostgreSQL服务
sudo systemctl restart postgresql

# 测试连接
psql -h db-server -U username -d database
```

### 2. 慢查询问题

#### 问题现象
数据库查询响应时间超过5秒

#### 排查步骤
1. **启用慢查询日志**
```sql
-- 在PostgreSQL中启用慢查询日志
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 记录超过1秒的查询
SELECT pg_reload_conf();
```

2. **分析查询计划**
```sql
-- 使用EXPLAIN ANALYZE分析查询
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = 123;

-- 输出示例：
Seq Scan on projects  (cost=0.00..100.00 rows=10 width=100)
  Filter: (user_id = 123)
  Rows Removed by Filter: 990
```

3. **检查索引使用情况**
```sql
-- 查看索引使用统计
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

#### 解决方案
```sql
-- 添加缺失的索引
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);
CREATE INDEX CONCURRENTLY idx_projects_status ON projects(status);

-- 优化查询
SELECT id, name, status FROM projects 
WHERE user_id = 123 
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;
```

### 3. 死锁问题

#### 问题现象
```sql
ERROR:  deadlock detected
DETAIL:  Process 12345 waits for ShareLock on transaction 67890; blocked by process 54321.
```

#### 排查步骤
1. **查看活动锁**
```sql
-- 查看当前锁信息
SELECT 
  pl.pid,
  pl.usename,
  pl.application_name,
  pl.state,
  pl.query,
  l.locktype,
  l.mode,
  l.granted
FROM pg_stat_activity pl
LEFT JOIN pg_locks l ON pl.pid = l.pid
WHERE pl.state = 'active'
ORDER BY pl.query_start;
```

2. **分析锁等待**
```sql
-- 查看锁等待关系
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

#### 解决方案
```sql
-- 终止阻塞进程
SELECT pg_terminate_backend(blocking_pid);

-- 优化事务顺序
BEGIN;
  -- 始终以相同顺序获取锁
  UPDATE users SET last_login = NOW() WHERE id = 1;
  UPDATE projects SET updated_at = NOW() WHERE user_id = 1;
COMMIT;
```

## 网络问题

### 1. SSL证书问题

#### 问题现象
```bash
curl: (60) SSL certificate problem: self signed certificate
```

#### 排查步骤
1. **检查证书有效性**
```bash
# 检查证书过期时间
openssl x509 -in certificate.crt -text -noout | grep "Not After"

# 测试证书链
openssl verify -CAfile ca-bundle.crt certificate.crt
```

2. **检查证书配置**
```bash
# 测试SSL连接
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

#### 解决方案
```bash
# 续期Let's Encrypt证书
sudo certbot renew

# 强制续期
sudo certbot renew --force-renewal

# 验证证书
sudo certbot certificates
```

### 2. CORS错误

#### 问题现象
```javascript
Access to XMLHttpRequest has been blocked by CORS policy
```

#### 排查步骤
1. **检查请求头**
```javascript
// 前端请求
fetch('/api/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

2. **检查服务器CORS配置**
```typescript
// Node.js/Express CORS配置
import cors from 'cors'

app.use(cors({
  origin: ['https://your-domain.com', 'https://staging.your-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

#### 解决方案
```typescript
// 预检请求处理
app.options('*', cors())  // 处理OPTIONS请求

// 或使用代理
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 3. DNS解析问题

#### 问题现象
```bash
ping: cannot resolve hostname: Name or service not known
```

#### 排查步骤
1. **检查DNS配置**
```bash
# 查看DNS服务器
cat /etc/resolv.conf

# 测试DNS解析
nslookup your-domain.com
dig your-domain.com
```

2. **检查hosts文件**
```bash
# 查看hosts配置
cat /etc/hosts

# 临时添加解析
echo "192.168.1.100 your-domain.com" >> /etc/hosts
```

#### 解决方案
```bash
# 刷新DNS缓存
# Ubuntu/Debian
sudo systemctl restart systemd-resolved

# CentOS/RHEL
sudo systemctl restart NetworkManager

# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns
```

## 认证问题

### 1. JWT Token无效

#### 问题现象
```json
{
  "error": "Invalid token",
  "message": "jwt malformed"
}
```

#### 排查步骤
1. **检查Token格式**
```javascript
// 检查Token结构
const token = localStorage.getItem('token')
console.log('Token:', token)
// 应该是三段式：header.payload.signature
```

2. **验证Token内容**
```javascript
// 解码JWT（仅用于调试）
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Payload:', payload)
```

3. **检查密钥配置**
```typescript
// 服务器端验证
import jwt from 'jsonwebtoken'

const token = req.headers.authorization?.replace('Bearer ', '')
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!)
  console.log('Decoded:', decoded)
} catch (error) {
  console.error('JWT verification failed:', error.message)
}
```

#### 解决方案
```typescript
// 重新生成Token
const newToken = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
)

// 前端更新Token
localStorage.setItem('token', newToken)

// 或使用刷新Token机制
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.REFRESH_TOKEN_SECRET!,
  { expiresIn: '7d' }
)
```

### 2. 会话过期

#### 问题现象
用户操作时提示"会话已过期，请重新登录"

#### 排查步骤
1. **检查会话配置**
```typescript
// 检查会话超时设置
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000  // 24小时
  }
}))
```

2. **检查Redis连接**
```typescript
// Redis会话存储
import connectRedis from 'connect-redis'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}))
```

#### 解决方案
```typescript
// 自动续期会话
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    // 续期会话
    req.session.touch()
  }
  next()
})

// 前端处理会话过期
const responseInterceptor = axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 清除本地认证信息
      localStorage.removeItem('token')
      // 跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 存储问题

### 1. 磁盘空间不足

#### 问题现象
```bash
No space left on device
```

#### 排查步骤
1. **检查磁盘使用情况**
```bash
# 查看磁盘使用率
df -h
du -sh /*

# 查看大文件
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null
```

2. **清理临时文件**
```bash
# 清理系统临时文件
sudo apt autoremove
sudo apt autoclean
sudo journalctl --vacuum-time=7d

# 清理Docker文件
docker system prune -a
```

#### 解决方案
```bash
# 扩展磁盘空间
sudo fdisk /dev/sda
sudo resize2fs /dev/sda1

# 或添加新的磁盘
sudo fdisk /dev/sdb
sudo mkfs.ext4 /dev/sdb1
sudo mount /dev/sdb1 /data
```

### 2. 文件上传失败

#### 问题现象
```javascript
Error: EACCES: permission denied, open '/uploads/file.jpg'
```

#### 排查步骤
1. **检查目录权限**
```bash
# 查看目录权限
ls -la /uploads/

# 检查用户权限
whoami
groups
```

2. **检查Nginx配置**
```nginx
# Nginx上传配置
client_max_body_size 10M;
client_body_timeout 60s;
client_header_timeout 60s;
```

#### 解决方案
```bash
# 设置正确权限
sudo chown -R www-data:www-data /uploads/
sudo chmod -R 755 /uploads/

# 或修改上传目录
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
```

## 监控问题

### 1. Prometheus指标缺失

#### 问题现象
Grafana仪表板显示"No data"

#### 排查步骤
1. **检查Prometheus配置**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'project-management'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

2. **检查应用指标端点**
```bash
# 测试指标端点
curl http://localhost:3001/metrics

# 查看Prometheus目标状态
curl http://localhost:9090/api/v1/targets
```

#### 解决方案
```typescript
// 确保应用暴露指标端点
import express from 'express'
import { metricsEndpoint } from './utils/metrics'

const app = express()
app.get('/metrics', metricsEndpoint)
app.listen(3001)
```

### 2. 告警规则不生效

#### 问题现象
告警应该触发但没有收到通知

#### 排查步骤
1. **检查告警规则**
```bash
# 验证告警规则语法
promtool check rules alert_rules.yml

# 查看告警状态
curl http://localhost:9090/api/v1/alerts
```

2. **检查AlertManager配置**
```yaml
# alertmanager.yml
route:
  receiver: 'web.hook'
receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'
```

#### 解决方案
```bash
# 重载AlertManager配置
curl -X POST http://localhost:9093/-/reload

# 查看AlertManager状态
curl http://localhost:9093/api/v1/status
```

## 调试工具

### 1. 日志调试

#### 结构化日志
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
})

// 使用日志记录调试信息
logger.debug('用户操作', { 
  userId: user.id, 
  action: 'login', 
  timestamp: new Date().toISOString() 
})
```

### 2. 网络调试

#### HTTP请求调试
```bash
# 使用curl调试
curl -v -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  https://api.example.com/users

# 使用httpie（更友好的工具）
http GET https://api.example.com/users \
  Authorization:"Bearer $TOKEN" \
  Content-Type:application/json
```

#### WebSocket调试
```javascript
// 浏览器控制台
const socket = new WebSocket('ws://localhost:3001/ws')
socket.onopen = () => console.log('Connected')
socket.onmessage = (event) => console.log('Message:', event.data)
socket.onerror = (error) => console.error('Error:', error)
```

### 3. 数据库调试

#### PostgreSQL调试
```sql
-- 查看当前连接
SELECT * FROM pg_stat_activity;

-- 查看锁信息
SELECT * FROM pg_locks;

-- 查看慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 查看表大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 应急处理流程

### 1. 问题识别
1. **接收告警**
2. **初步判断严重程度**
3. **确定影响范围**

### 2. 快速响应
1. **启动应急流程**
2. **通知相关人员**
3. **开始问题诊断**

### 3. 问题解决
1. **实施临时修复**
2. **验证修复效果**
3. **监控稳定性**

### 4. 事后总结
1. **问题根因分析**
2. **改进措施制定**
3. **文档更新**

## 预防措施

### 1. 监控覆盖
- 关键指标监控
- 业务指标监控
- 日志监控

### 2. 容量规划
- 定期性能评估
- 容量趋势分析
- 扩容计划制定

### 3. 备份策略
- 定期数据备份
- 备份恢复测试
- 灾难恢复预案

### 4. 文档维护
- 运维文档更新
- 故障处理记录
- 知识库维护

## 联系信息

### 技术支持
- **邮箱**: tech-support@company.com
- **Slack**: #tech-support
- **电话**: +86-xxx-xxxx-xxxx

### 紧急联系
- **值班工程师**: +86-xxx-xxxx-xxxx
- **技术负责人**: +86-xxx-xxxx-xxxx
- **运维经理**: +86-xxx-xxxx-xxxx