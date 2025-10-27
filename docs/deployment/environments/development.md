# 开发环境配置指南

## 概述

开发环境配置用于本地开发，提供快速迭代和调试功能。

## 环境要求

- Node.js 18+ 
- pnpm 8+
- Git
- VS Code（推荐）

## 快速启动

### 1. 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd project-management-platform

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 2. 环境变量配置

创建 `.env.development` 文件：

```bash
# 应用配置
VITE_APP_TITLE=项目管理平台 (开发环境)
VITE_APP_VERSION=1.0.0-dev
NODE_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# 开发工具
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_SOURCE_MAP=true

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
VITE_ENABLE_MOCK_API=true

# 本地存储
VITE_LOCAL_STORAGE_PREFIX=dev_

# 调试配置
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 开发工具配置

### VS Code推荐插件

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### ESLint配置

项目已配置ESLint，在开发过程中会自动检查代码质量：

```bash
# 运行ESLint检查
pnpm lint

# 自动修复可修复的问题
pnpm lint:fix
```

### Prettier配置

代码格式化配置：

```bash
# 格式化代码
pnpm format

# 检查代码格式
pnpm format:check
```

## 开发工作流

### 1. 代码提交

使用Git hooks确保代码质量：

```bash
# 安装husky（如果尚未安装）
pnpm husky install

# 提交代码
git add .
git commit -m "feat: 添加新功能"
```

### 2. 热重载

开发服务器支持热重载，修改代码后会自动刷新页面。

### 3. 调试

#### 浏览器调试
- 打开Chrome DevTools
- 使用React Developer Tools扩展

#### VS Code调试
配置 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 开发服务器配置

### Vite配置

项目使用Vite作为构建工具，配置文件 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

## 本地数据库

### SQLite配置（开发用）

```bash
# 安装SQLite
npm install sqlite3

# 创建数据库文件
touch dev.db
```

### 模拟数据

项目包含模拟数据生成器：

```bash
# 生成模拟数据
pnpm run generate-mock-data
```

## 性能优化

### 开发环境优化

1. **代码分割**
   - 使用动态导入减少初始加载时间
   - 按路由分割代码

2. **缓存策略**
   - 浏览器缓存
   - Service Worker缓存（可选）

3. **开发工具**
   - React Developer Tools
   - Redux DevTools
   - Vite Bundle Analyzer

## 常见问题

### 1. 端口冲突

如果5173端口被占用，Vite会自动选择下一个可用端口。

### 2. 依赖安装失败

```bash
# 清理node_modules和pnpm-lock.yaml
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 3. TypeScript错误

```bash
# 检查TypeScript配置
pnpm tsc --noEmit

# 修复类型错误
pnpm run type-check
```

### 4. 构建失败

```bash
# 清理构建缓存
rm -rf dist
rm -rf node_modules/.vite

# 重新构建
pnpm build
```

## 开发最佳实践

1. **代码组织**
   - 组件放在 `src/components/`
   - 页面放在 `src/pages/`
   - 工具函数放在 `src/utils/`
   - 类型定义放在 `src/types/`

2. **状态管理**
   - 使用Zustand进行状态管理
   - 复杂状态使用Redux Toolkit

3. **样式管理**
   - 使用Tailwind CSS
   - 组件样式使用CSS Modules
   - 全局样式放在 `src/styles/`

4. **API调用**
   - 使用Axios进行HTTP请求
   - 实现请求拦截器和响应拦截器
   - 添加错误处理和重试机制

5. **测试**
   - 单元测试使用Vitest
   - 组件测试使用Testing Library
   - E2E测试使用Playwright

## 下一步

完成开发环境配置后，可以：
- 查看[测试环境配置](./testing.md)了解测试环境设置
- 查看[生产环境配置](./production.md)了解生产部署
- 查看[Docker部署方案](../docker/docker-compose.yml)了解容器化部署