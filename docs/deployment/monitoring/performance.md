# 性能优化指南

## 概述

本文档提供了项目管理平台的性能优化策略和最佳实践，涵盖前端、后端、数据库、缓存、CDN等多个层面的优化方案。

## 前端性能优化

### 1. 代码分割和懒加载

#### 路由级别的代码分割

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 懒加载路由组件
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
const Users = lazy(() => import('./pages/Users'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

#### 组件级别的懒加载

```typescript
// src/components/HeavyComponent.tsx
import { lazy, Suspense } from 'react'

// 使用React.lazy进行组件懒加载
const Chart = lazy(() => import('./Chart'))
const DataTable = lazy(() => import('./DataTable'))

function HeavyComponent() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  )
}
```

### 2. 资源优化

#### 图片优化

```typescript
// src/components/OptimizedImage.tsx
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  // 生成不同尺寸的响应式图片
  const generateSrcSet = (src: string) => {
    const ext = src.split('.').pop()
    const base = src.replace(`.${ext}`, '')
    return `${base}-320.${ext} 320w, ${base}-640.${ext} 640w, ${base}-1280.${ext} 1280w`
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 320px) 320px, (max-width: 640px) 640px, 1280px"
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        loading="lazy"
      />
    </div>
  )
}
```

#### 字体优化

```css
/* src/styles/fonts.css */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-400.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-600.woff2') format('woff2');
}

/* 预加载关键字体 */
.preload-fonts {
  font-display: swap;
}
```

### 3. 缓存策略

#### Service Worker缓存

```typescript
// public/sw.js
const CACHE_NAME = 'project-management-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 返回缓存或从网络获取
        return response || fetch(event.request)
      })
  )
})
```

#### 浏览器缓存策略

```typescript
// src/utils/cache.ts
export class CacheManager {
  private static CACHE_PREFIX = 'pm_cache_'
  private static DEFAULT_TTL = 5 * 60 * 1000 // 5分钟

  static set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item))
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(this.CACHE_PREFIX + key)
    if (!itemStr) return null

    try {
      const item = JSON.parse(itemStr)
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key)
        return null
      }
      return item.value
    } catch {
      this.delete(key)
      return null
    }
  }

  static delete(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key)
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
}
```

### 4. 性能监控

#### Web Vitals监控

```typescript
// src/utils/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

class PerformanceMonitor {
  private static sendToAnalytics(metric: any) {
    // 发送到分析服务
    console.log('Performance Metric:', metric)
    
    // 发送到自定义分析服务
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      })
    }
  }

  static init() {
    getCLS(this.sendToAnalytics)
    getFID(this.sendToAnalytics)
    getFCP(this.sendToAnalytics)
    getLCP(this.sendToAnalytics)
    getTTFB(this.sendToAnalytics)
  }

  static measureUserTiming(name: string, startMark: string, endMark: string) {
    performance.mark(startMark)
    
    // 测量操作完成后
    performance.mark(endMark)
    performance.measure(name, startMark, endMark)
    
    const measure = performance.getEntriesByName(name)[0]
    this.sendToAnalytics({
      name: 'custom_timing',
      value: measure.duration,
      id: name
    })
  }
}

export default PerformanceMonitor
```

## 后端性能优化

### 1. 数据库优化

#### 查询优化

```sql
-- 添加索引
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);
CREATE INDEX CONCURRENTLY idx_projects_status ON projects(status);
CREATE INDEX CONCURRENTLY idx_projects_created_at ON projects(created_at);

-- 复合索引
CREATE INDEX CONCURRENTLY idx_projects_user_status ON projects(user_id, status);

-- 分区表（按日期分区）
CREATE TABLE projects_2024 PARTITION OF projects
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 物化视图（预计算复杂查询）
CREATE MATERIALIZED VIEW project_stats AS
SELECT 
  user_id,
  COUNT(*) as project_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration
FROM projects
GROUP BY user_id;

-- 定期刷新物化视图
CREATE OR REPLACE FUNCTION refresh_project_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_stats;
END;
$$ LANGUAGE plpgsql;
```

#### 连接池配置

```typescript
// src/config/database.ts
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 监听连接池事件
pool.on('connect', (client) => {
  console.log('新的数据库连接已建立')
})

pool.on('error', (err) => {
  console.error('数据库连接池错误:', err)
})

export default pool
```

### 2. 缓存策略

#### Redis缓存

```typescript
// src/utils/redis-cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class RedisCache {
  private static DEFAULT_TTL = 3600 // 1小时

  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Redis SET error:', error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Redis DEL error:', error)
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis DEL pattern error:', error)
    }
  }

  // 缓存装饰器
  static cache(keyGenerator: (...args: any[]) => string, ttl: number = this.DEFAULT_TTL) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const cacheKey = keyGenerator(...args)
        const cached = await this.get(cacheKey)
        
        if (cached !== null) {
          return cached
        }

        const result = await method.apply(this, args)
        await this.set(cacheKey, result, ttl)
        return result
      }
    }
  }
}
```

### 3. API优化

#### 请求限流

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'

const redisClient = new Redis(process.env.REDIS_URL!)

export const createRateLimiter = (options: {
  windowMs: number
  max: number
  keyGenerator?: (req: any) => string
  message?: string
}) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    }),
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    message: options.message || '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false,
  })
}

// 不同接口的限流配置
export const rateLimiters = {
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最多100个请求
  }),
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5, // 登录接口更严格
  }),
  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10, // 上传文件限制
  }),
}
```

#### 数据压缩

```typescript
// src/middleware/compression.ts
import compression from 'compression'

export const compressionMiddleware = compression({
  filter: (req, res) => {
    // 不压缩图片和其他二进制文件
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  threshold: 1024, // 只压缩大于1KB的响应
  level: 6, // 压缩级别
})
```

## 监控和告警

### 1. 应用性能监控

#### 自定义指标收集

```typescript
// src/utils/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client'

// 创建指标
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
})

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
})

export const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
  labelNames: ['state'],
})

// 中间件收集HTTP指标
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    })
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
      },
      duration
    )
  })
  
  next()
}

// 导出指标端点
export const metricsEndpoint = async (req: any, res: any) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
}
```

#### 健康检查

```typescript
// src/utils/healthCheck.ts
import pool from '../config/database'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class HealthChecker {
  static async checkDatabase(): Promise<boolean> {
    try {
      const client = await pool.connect()
      await client.query('SELECT 1')
      client.release()
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  static async checkRedis(): Promise<boolean> {
    try {
      await redis.ping()
      return true
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }

  static async checkMemory(): Promise<{ status: string; usage: number }> {
    const usage = process.memoryUsage()
    const heapUsedMB = usage.heapUsed / 1024 / 1024
    const heapTotalMB = usage.heapTotal / 1024 / 1024
    const usagePercent = (heapUsedMB / heapTotalMB) * 100

    return {
      status: usagePercent > 90 ? 'critical' : usagePercent > 75 ? 'warning' : 'healthy',
      usage: Math.round(usagePercent)
    }
  }

  static async getOverallHealth() {
    const [db, redis, memory] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
    ])

    const isHealthy = db && redis && memory.status !== 'critical'

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: db ? 'healthy' : 'unhealthy',
        redis: redis ? 'healthy' : 'unhealthy',
        memory: memory.status,
        memoryUsage: `${memory.usage}%`
      }
    }
  }
}
```

### 2. 日志优化

#### 结构化日志

```typescript
// src/utils/logger.ts
import winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
  },
  index: 'project-management-logs'
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'project-management',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    esTransport,
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ],
})

// 性能日志装饰器
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    const methodName = `${target.constructor.name}.${propertyName}`
    
    try {
      const result = await method.apply(this, args)
      const duration = Date.now() - start
      
      logger.info('Method performance', {
        method: methodName,
        duration,
        status: 'success'
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      logger.error('Method performance', {
        method: methodName,
        duration,
        status: 'error',
        error: error.message
      })
      
      throw error
    }
  }
}
```

## 性能测试

### 1. 负载测试

```javascript
// tests/load/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

export let errorRate = new Rate('errors')

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // 2分钟内逐渐增加到100用户
    { duration: '5m', target: 100 }, // 保持100用户5分钟
    { duration: '2m', target: 200 }, // 逐渐增加到200用户
    { duration: '5m', target: 200 }, // 保持200用户5分钟
    { duration: '2m', target: 0 },   // 逐渐减少到0用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求应在500ms内完成
    http_req_failed: ['rate<0.01'],   // 错误率应低于1%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  // 测试登录
  let loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'test123'
  })
  
  check(loginResponse, {
    'login successful': (r) => r.status === 200,
  }) || errorRate.add(1)

  if (loginResponse.status === 200) {
    const token = loginResponse.json('token')
    
    // 测试获取项目列表
    let projectsResponse = http.get(`${BASE_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    check(projectsResponse, {
      'projects fetched successfully': (r) => r.status === 200,
    }) || errorRate.add(1)

    // 测试创建项目
    let createResponse = http.post(`${BASE_URL}/api/projects`, {
      name: `Load Test Project ${Date.now()}`,
      description: 'Performance testing'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    check(createResponse, {
      'project created successfully': (r) => r.status === 201,
    }) || errorRate.add(1)
  }

  sleep(1)
}
```

### 2. 性能基准测试

```typescript
// tests/performance/benchmark.ts
import { performance } from 'perf_hooks'

export class PerformanceBenchmark {
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    console.log(`${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }

  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }

  static async runBatch<T>(
    name: string,
    fn: () => Promise<T>,
    iterations: number
  ): Promise<{ avg: number; min: number; max: number }> {
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn()
      const end = performance.now()
      times.push(end - start)
    }
    
    const avg = times.reduce((a, b) => a + b) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)
    
    console.log(`${name} (${iterations} iterations):`)
    console.log(`  Average: ${avg.toFixed(2)}ms`)
    console.log(`  Min: ${min.toFixed(2)}ms`)
    console.log(`  Max: ${max.toFixed(2)}ms`)
    
    return { avg, min, max }
  }
}
```

## 最佳实践

### 1. 前端性能最佳实践

1. **减少HTTP请求**
   - 合并CSS和JavaScript文件
   - 使用CSS Sprites合并小图片
   - 启用HTTP/2多路复用

2. **优化关键渲染路径**
   - 关键CSS内联
   - 异步加载非关键资源
   - 预加载关键资源

3. **减少包体积**
   - Tree shaking
   - 代码分割
   - 按需加载依赖

### 2. 后端性能最佳实践

1. **数据库优化**
   - 合理使用索引
   - 避免N+1查询
   - 使用连接池

2. **缓存策略**
   - 多层缓存架构
   - 缓存失效策略
   - 缓存预热

3. **异步处理**
   - 消息队列
   - 异步任务处理
   - 事件驱动架构

### 3. 监控和告警

1. **关键指标监控**
   - 响应时间
   - 错误率
   - 资源使用率

2. **告警策略**
   - 多级告警
   - 告警收敛
   - 值班轮换

## 性能优化检查清单

### 开发阶段
- [ ] 代码分割和懒加载
- [ ] 图片优化和压缩
- [ ] 字体优化
- [ ] 缓存策略实现
- [ ] 性能监控集成

### 测试阶段
- [ ] 性能基准测试
- [ ] 负载测试
- [ ] 内存泄漏检测
- [ ] 数据库性能测试

### 部署阶段
- [ ] CDN配置
- [ ] Gzip压缩
- [ ] 缓存头设置
- [ ] 监控告警配置

### 运维阶段
- [ ] 性能监控
- [ ] 定期性能评估
- [ ] 容量规划
- [ ] 性能优化迭代