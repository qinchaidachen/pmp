# 测试环境配置指南

## 概述

测试环境用于集成测试、端到端测试和性能测试，模拟生产环境的配置。

## 环境要求

- Node.js 18+
- pnpm 8+
- Docker 20.10+
- 测试数据库（PostgreSQL/MySQL）

## 测试环境架构

```
测试环境
├── Web服务器 (Nginx)
├── 应用服务器 (Node.js)
├── 测试数据库 (PostgreSQL)
├── 缓存服务器 (Redis)
├── 文件存储 (本地/云存储)
└── 监控服务
```

## 环境配置

### 1. 环境变量

创建 `.env.testing` 文件：

```bash
# 应用配置
VITE_APP_TITLE=项目管理平台 (测试环境)
VITE_APP_VERSION=1.0.0-test
NODE_ENV=testing

# API配置
VITE_API_BASE_URL=https://test-api.example.com
VITE_API_TIMEOUT=15000

# 数据库配置
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/project_test
REDIS_URL=redis://localhost:6379/1

# 测试配置
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_TEST_DATA=true
VITE_TEST_USER=test@example.com
VITE_TEST_PASSWORD=test123

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# 日志配置
VITE_LOG_LEVEL=info
LOG_LEVEL=info

# 安全配置
VITE_CSRF_ENABLED=true
VITE_CORS_ORIGIN=https://test.example.com

# 第三方服务
VITE_SENTRY_DSN=your-test-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-test-ga-id
```

### 2. 测试数据库设置

#### PostgreSQL配置

```sql
-- 创建测试数据库
CREATE DATABASE project_test;

-- 创建测试用户
CREATE USER test_user WITH PASSWORD 'test_pass';
GRANT ALL PRIVILEGES ON DATABASE project_test TO test_user;

-- 连接测试数据库并创建表
\c project_test;

-- 运行数据库迁移
\i migrations/001_initial_schema.sql
\i migrations/002_test_data.sql
```

#### 数据初始化脚本

```bash
#!/bin/bash
# scripts/init-test-db.sh

echo "初始化测试数据库..."

# 清理现有数据
psql $DATABASE_URL -c "DROP SCHEMA IF EXISTS public CASCADE;"
psql $DATABASE_URL -c "CREATE SCHEMA public;"

# 运行迁移
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_test_data.sql

# 插入测试数据
psql $DATABASE_URL -f test-data/seed.sql

echo "测试数据库初始化完成"
```

### 3. 缓存配置

#### Redis配置

```bash
# Redis配置文件 redis.conf
port 6379
databases 16
save 900 1
save 300 10
save 60 10000
maxmemory 256mb
maxmemory-policy allkeys-lru
```

启动Redis：
```bash
redis-server redis.conf
```

## 测试类型

### 1. 单元测试

使用Vitest进行单元测试：

```bash
# 运行所有单元测试
pnpm test

# 运行特定测试文件
pnpm test src/utils/format.test.ts

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

#### 测试配置

`vitest.config.ts`：
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 2. 集成测试

使用Supertest进行API测试：

```typescript
// tests/integration/auth.test.ts
import request from 'supertest'
import { app } from '../src/app'

describe('Authentication API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    
    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })
})
```

### 3. 端到端测试

使用Playwright进行E2E测试：

```typescript
// tests/e2e/project.spec.ts
import { test, expect } from '@playwright/test'

test('项目创建流程', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'test123')
  await page.click('[data-testid="login-button"]')
  
  await expect(page).toHaveURL('/dashboard')
  
  await page.click('[data-testid="create-project"]')
  await page.fill('[data-testid="project-name"]', '测试项目')
  await page.click('[data-testid="save-project"]')
  
  await expect(page.locator('[data-testid="project-title"]')).toContainText('测试项目')
})
```

运行E2E测试：
```bash
# 安装Playwright
pnpm exec playwright install

# 运行所有E2E测试
pnpm test:e2e

# 运行特定测试
pnpm exec playwright test project.spec.ts

# 调试模式
pnpm exec playwright test --debug
```

### 4. 性能测试

使用Lighthouse进行性能测试：

```javascript
// tests/performance/performance.test.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']})
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  }
  const runnerResult = await lighthouse(url, options)
  const reportHtml = runnerResult.report
  const score = runnerResult.lhr.categories.performance.score * 100
  
  console.log(`Performance score: ${score}`)
  
  await chrome.kill()
  return { score, reportHtml }
}

test('页面性能测试', async () => {
  const { score, reportHtml } = await runLighthouse('http://localhost:5173')
  expect(score).toBeGreaterThan(80)
  
  // 保存报告
  require('fs').writeFileSync('performance-report.html', reportHtml)
})
```

## 自动化测试流程

### GitHub Actions配置

`.github/workflows/test.yml`：
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test_pass
          POSTGRES_USER: test_user
          POSTGRES_DB: project_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run linting
      run: pnpm lint
    
    - name: Run type checking
      run: pnpm type-check
    
    - name: Run unit tests
      run: pnpm test:coverage
      env:
        DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/project_test
    
    - name: Run integration tests
      run: pnpm test:integration
      env:
        DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/project_test
    
    - name: Run E2E tests
      run: pnpm test:e2e
      env:
        BASE_URL: http://localhost:3000
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 测试数据管理

### 1. 测试数据生成

```typescript
// scripts/generate-test-data.ts
import { faker } from '@faker-js/faker'

export function generateTestUsers(count: number = 10) {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer']),
    createdAt: faker.date.past(),
  }))
}

export function generateTestProjects(count: number = 20) {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['active', 'completed', 'archived']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }))
}
```

### 2. 测试数据清理

```bash
#!/bin/bash
# scripts/clean-test-data.sh

echo "清理测试数据..."

# 清理数据库
psql $DATABASE_URL -c "DELETE FROM test_sessions;"
psql $DATABASE_URL -c "DELETE FROM test_logs;"

# 清理缓存
redis-cli -u $REDIS_URL FLUSHDB

# 清理文件存储
rm -rf uploads/test/*

echo "测试数据清理完成"
```

## 监控和日志

### 1. 测试环境监控

```typescript
// src/utils/monitoring.ts
export function trackTestMetrics() {
  // 页面加载时间
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    console.log(`页面加载时间: ${loadTime}ms`)
  })
  
  // API响应时间
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const start = Date.now()
    const response = await originalFetch(...args)
    const duration = Date.now() - start
    console.log(`API请求耗时: ${duration}ms`)
    return response
  }
}
```

### 2. 日志配置

```typescript
// src/utils/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/test-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/test-combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## 部署流程

### 1. 测试环境部署

```bash
#!/bin/bash
# scripts/deploy-test.sh

echo "部署到测试环境..."

# 构建应用
pnpm build

# 运行测试
pnpm test

# 部署到测试服务器
scp -r dist/ test-server:/var/www/project-management-test/

# 重启服务
ssh test-server "cd /var/www/project-management-test && pm2 restart project-management-test"

echo "测试环境部署完成"
```

### 2. 回滚策略

```bash
#!/bin/bash
# scripts/rollback-test.sh

echo "回滚到上一个版本..."

# 获取上一个版本
PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD^)

# 检出上一个版本
git checkout $PREVIOUS_VERSION

# 重新构建和部署
pnpm build
scp -r dist/ test-server:/var/www/project-management-test/
ssh test-server "cd /var/www/project-management-test && pm2 restart project-management-test"

echo "回滚完成"
```

## 常见问题

### 1. 测试数据不一致

**解决方案：**
- 使用数据库事务
- 在每个测试前重置数据
- 使用测试工厂模式

### 2. 测试环境性能问题

**解决方案：**
- 优化数据库查询
- 使用测试专用的轻量级配置
- 定期清理测试数据

### 3. 第三方服务依赖

**解决方案：**
- 使用Mock服务
- 配置测试专用的API密钥
- 实现降级策略

## 最佳实践

1. **测试隔离**
   - 每个测试应该有独立的数据
   - 使用数据库事务确保测试原子性
   - 清理测试数据

2. **测试数据管理**
   - 使用工厂模式生成测试数据
   - 避免硬编码测试数据
   - 定期更新测试数据

3. **性能测试**
   - 定期运行性能测试
   - 设置性能基准
   - 监控性能趋势

4. **持续集成**
   - 所有测试必须通过才能合并
   - 自动化测试报告
   - 快速反馈机制

## 下一步

完成测试环境配置后，可以：
- 查看[生产环境配置](./production.md)了解生产部署
- 查看[Docker部署方案](../docker/docker-compose.yml)了解容器化部署
- 查看[故障排除指南](../troubleshooting/common-issues.md)了解常见问题