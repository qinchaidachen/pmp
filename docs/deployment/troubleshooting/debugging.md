# 调试指南

## 概述

本文档提供了项目管理平台的详细调试方法和工具使用指南，帮助开发者和运维人员快速定位和解决系统问题。

## 调试环境准备

### 1. 开发环境调试

#### VS Code调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "args": ["--mode", "development"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Node.js API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server/index.js",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "*"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--reporter=verbose"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

#### 浏览器调试

```typescript
// src/utils/debug.ts
export class Debugger {
  static enable() {
    if (process.env.NODE_ENV === 'development') {
      // 启用详细日志
      window.localStorage.setItem('debug', 'true')
      
      // 启用React DevTools
      if (typeof window !== 'undefined') {
        console.log('React DevTools available')
      }
      
      // 启用Redux DevTools
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        console.log('Redux DevTools connected')
      }
    }
  }
  
  static log(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development' || window.localStorage.getItem('debug') === 'true') {
      console.log(`[DEBUG] ${message}`, data)
    }
  }
  
  static error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error)
  }
  
  static performance(name: string, fn: () => void | Promise<void>) {
    const start = performance.now()
    
    const finish = () => {
      const end = performance.now()
      console.log(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`)
    }
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(finish)
    } else {
      finish()
      return result
    }
  }
}
```

### 2. 后端调试

#### Express.js调试

```typescript
// src/server/debug.ts
import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'debug.log' })
  ]
})

// 请求调试中间件
export function debugMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  // 记录请求开始
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  // 拦截响应
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - start
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: data?.length || 0
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}

// 错误调试中间件
export function errorDebugMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  })
  
  next(err)
}
```

#### 数据库调试

```typescript
// src/utils/db-debug.ts
import { Pool } from 'pg'

export class DatabaseDebugger {
  constructor(private pool: Pool) {
    this.setupDebugging()
  }
  
  private setupDebugging() {
    // 监听连接池事件
    this.pool.on('connect', (client) => {
      console.log('New database client connected')
    })
    
    this.pool.on('error', (err) => {
      console.error('Database pool error:', err)
    })
    
    this.pool.on('remove', (client) => {
      console.log('Database client removed from pool')
    })
  }
  
  async debugQuery(query: string, params?: any[]) {
    const start = Date.now()
    
    try {
      console.log('Executing query:', query)
      console.log('With params:', params)
      
      const result = await this.pool.query(query, params)
      
      const duration = Date.now() - start
      console.log(`Query completed in ${duration}ms`)
      console.log('Rows affected:', result.rowCount)
      console.log('Result:', result.rows)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`Query failed after ${duration}ms:`, error)
      throw error
    }
  }
  
  async getConnectionInfo() {
    const client = await this.pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          version(),
          current_database(),
          current_user,
          inet_server_addr() as server_ip,
          inet_server_port() as server_port
      `)
      
      console.log('Database connection info:', result.rows[0])
      return result.rows[0]
    } finally {
      client.release()
    }
  }
  
  async getActiveConnections() {
    const result = await this.pool.query(`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        state,
        query_start,
        query
      FROM pg_stat_activity
      WHERE state = 'active'
    `)
    
    console.log('Active connections:', result.rows)
    return result.rows
  }
}
```

## 前端调试

### 1. React调试

#### 组件调试

```typescript
// src/components/DebugComponent.tsx
import React, { useState, useEffect } from 'react'

interface DebugComponentProps {
  data: any
  onError?: (error: Error) => void
}

export function DebugComponent({ data, onError }: DebugComponentProps) {
  const [debugInfo, setDebugInfo] = useState({
    renderCount: 0,
    props: {},
    state: {},
    effects: [] as string[]
  })
  
  const [renderCount, setRenderCount] = useState(0)
  
  // 调试渲染次数
  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })
  
  // 调试Props变化
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      props: data,
      renderCount: renderCount
    }))
    
    console.log('Component props updated:', data)
  }, [data, renderCount])
  
  // 调试错误
  useEffect(() => {
    try {
      // 模拟可能出错的操作
      if (data?.shouldError) {
        throw new Error('Debug: Simulated error')
      }
    } catch (error) {
      console.error('Component error:', error)
      onError?.(error as Error)
    }
  }, [data, onError])
  
  // 开发环境显示调试信息
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="debug-component">
        <div className="debug-info">
          <h4>Debug Info</h4>
          <p>Render Count: {debugInfo.renderCount}</p>
          <p>Props: {JSON.stringify(debugInfo.props, null, 2)}</p>
          <p>State: {JSON.stringify(debugInfo.state, null, 2)}</p>
        </div>
        {/* 实际组件内容 */}
        <div>{/* Component content */}</div>
      </div>
    )
  }
  
  return <div>{/* Component content */}</div>
}
```

#### 状态管理调试

```typescript
// src/stores/debug-store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface DebugStore {
  actions: {
    addAction: (action: string) => void
    clearActions: () => void
  }
  actionHistory: string[]
}

export const useDebugStore = create<DebugStore>()(
  subscribeWithSelector(
    immer((set) => ({
      actionHistory: [],
      actions: {
        addAction: (action: string) => {
          set((state) => {
            state.actionHistory.push(`${new Date().toISOString()}: ${action}`)
          })
          console.log('Action dispatched:', action)
        },
        clearActions: () => {
          set((state) => {
            state.actionHistory = []
          })
        }
      }
    }))
  )
)

// Redux调试工具（如果使用Redux）
import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'

const logger = createLogger({
  duration: true,
  timestamp: true,
  colors: {
    title: () => '#139BFE',
    prevState: () => '#A9A9A9',
    action: () => '#03A9F4',
    nextState: () => '#4CAF50',
    error: () => '#F44336',
  },
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(logger),
})

// 监听所有action
store.subscribe(() => {
  const action = store.getState()
  console.log('State updated:', action)
})
```

### 2. 网络请求调试

#### Axios调试

```typescript
// src/utils/axios-debug.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// 创建调试用的axios实例
const debugAxios = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器
debugAxios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Headers:', config.headers)
    console.log('Data:', config.data)
    console.log('Params:', config.params)
    console.groupEnd()
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
debugAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)
    console.log('Data:', response.data)
    console.groupEnd()
    
    return response
  },
  (error: AxiosError) => {
    console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
    console.error('Error:', error.message)
    console.error('Response:', error.response)
    console.error('Config:', error.config)
    console.groupEnd()
    
    return Promise.reject(error)
  }
)

// 网络状态监控
export function setupNetworkDebugging() {
  // 监控在线状态
  window.addEventListener('online', () => {
    console.log('🌐 Network: Online')
  })
  
  window.addEventListener('offline', () => {
    console.log('📡 Network: Offline')
  })
  
  // 监控请求性能
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
        console.log(`⏱️  Network: ${entry.name} - ${entry.duration.toFixed(2)}ms`)
      }
    })
  })
  
  observer.observe({ entryTypes: ['resource'] })
}
```

#### WebSocket调试

```typescript
// src/utils/websocket-debug.ts
export class WebSocketDebugger {
  private ws: WebSocket | null = null
  private messageCount = 0
  private startTime = 0
  
  connect(url: string) {
    this.ws = new WebSocket(url)
    this.startTime = Date.now()
    
    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected')
    }
    
    this.ws.onmessage = (event) => {
      this.messageCount++
      const latency = Date.now() - this.startTime
      console.log(`📨 WebSocket message #${this.messageCount} (latency: ${latency}ms):`, event.data)
    }
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
    
    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('📤 WebSocket sending:', data)
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('⚠️  WebSocket not connected')
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  getStats() {
    return {
      messageCount: this.messageCount,
      connectionTime: Date.now() - this.startTime,
      readyState: this.ws?.readyState
    }
  }
}
```

## 后端调试

### 1. API调试

#### Express路由调试

```typescript
// src/server/routes-debug.ts
import { Router, Request, Response } from 'express'
import { DatabaseDebugger } from '../utils/db-debug'

const router = Router()
const dbDebugger = new DatabaseDebugger(pool)

// 调试路由
router.get('/debug/info', async (req: Request, res: Response) => {
  try {
    const info = await dbDebugger.getConnectionInfo()
    const connections = await dbDebugger.getActiveConnections()
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: info,
      activeConnections: connections,
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 调试SQL查询
router.get('/debug/sql', async (req: Request, res: Response) => {
  const { query, params } = req.query
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' })
  }
  
  try {
    const result = await dbDebugger.debugQuery(
      query as string, 
      params ? JSON.parse(params as string) : undefined
    )
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 性能测试端点
router.get('/debug/performance', async (req: Request, res: Response) => {
  const iterations = parseInt(req.query.iterations as string) || 100
  
  const results = []
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now()
    await dbDebugger.debugQuery('SELECT NOW()')
    const duration = Date.now() - start
    results.push(duration)
  }
  
  const avg = results.reduce((a, b) => a + b) / results.length
  const min = Math.min(...results)
  const max = Math.max(...results)
  
  res.json({
    iterations,
    average: avg,
    min,
    max,
    results
  })
})

export default router
```

### 2. 认证调试

#### JWT调试工具

```typescript
// src/utils/jwt-debug.ts
import jwt from 'jsonwebtoken'

export class JWTDebugger {
  static decodeToken(token: string) {
    try {
      const decoded = jwt.decode(token, { complete: true })
      console.log('JWT decoded:', decoded)
      return decoded
    } catch (error) {
      console.error('JWT decode error:', error)
      return null
    }
  }
  
  static verifyToken(token: string, secret: string) {
    try {
      const decoded = jwt.verify(token, secret)
      console.log('JWT verified:', decoded)
      return decoded
    } catch (error) {
      console.error('JWT verify error:', error)
      return null
    }
  }
  
  static generateTestToken(payload: any, secret: string, expiresIn = '1h') {
    const token = jwt.sign(payload, secret, { expiresIn })
    console.log('Test token generated:', token)
    return token
  }
  
  static checkTokenExpiry(token: string) {
    try {
      const decoded = jwt.decode(token) as any
      if (decoded?.exp) {
        const expiryDate = new Date(decoded.exp * 1000)
        const now = new Date()
        const isExpired = now > expiryDate
        
        console.log('Token expiry check:', {
          expiresAt: expiryDate.toISOString(),
          isExpired,
          timeUntilExpiry: expiryDate.getTime() - now.getTime()
        })
        
        return { isExpired, expiryDate }
      }
    } catch (error) {
      console.error('Token expiry check error:', error)
    }
    
    return { isExpired: true, expiryDate: null }
  }
}
```

### 3. 缓存调试

#### Redis调试

```typescript
// src/utils/redis-debug.ts
import Redis from 'ioredis'

export class RedisDebugger {
  constructor(private redis: Redis) {
    this.setupDebugging()
  }
  
  private setupDebugging() {
    this.redis.monitor((err, monitor) => {
      if (err) return
      
      monitor.on('monitor', (time, args, source, database) => {
        console.log(`Redis [${time}]: ${args.join(' ')}`)
      })
    })
  }
  
  async getAllKeys(pattern = '*') {
    const keys = await this.redis.keys(pattern)
    console.log(`Redis keys matching ${pattern}:`, keys)
    return keys
  }
  
  async getKeyInfo(key: string) {
    const type = await this.redis.type(key)
    const ttl = await this.redis.ttl(key)
    const value = await this.redis.get(key)
    
    const info = {
      key,
      type,
      ttl,
      value: type === 'hash' || type === 'list' ? JSON.parse(value || '{}') : value
    }
    
    console.log('Redis key info:', info)
    return info
  }
  
  async getMemoryUsage() {
    const info = await this.redis.info('memory')
    console.log('Redis memory usage:', info)
    return info
  }
  
  async getStats() {
    const info = await this.redis.info()
    console.log('Redis stats:', info)
    return info
  }
  
  async clearPattern(pattern: string) {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
      console.log(`Cleared ${keys.length} keys matching ${pattern}`)
    }
    return keys.length
  }
}
```

## 性能调试

### 1. 内存调试

#### 内存泄漏检测

```typescript
// src/utils/memory-debug.ts
export class MemoryDebugger {
  private snapshots: HeapSnapshot[] = []
  
  takeSnapshot(label: string) {
    if (!(window as any).performance?.memory) {
      console.warn('Memory API not available')
      return
    }
    
    const snapshot = {
      label,
      timestamp: Date.now(),
      used: (window as any).performance.memory.usedJSHeapSize,
      total: (window as any).performance.memory.totalJSHeapSize,
      limit: (window as any).performance.memory.jsHeapSizeLimit
    }
    
    this.snapshots.push(snapshot)
    console.log('Memory snapshot:', snapshot)
    
    return snapshot
  }
  
  compareSnapshots(fromIndex: number, toIndex: number) {
    if (this.snapshots.length < 2) {
      console.warn('Not enough snapshots for comparison')
      return
    }
    
    const from = this.snapshots[fromIndex]
    const to = this.snapshots[toIndex]
    
    const diff = {
      timeDiff: to.timestamp - from.timestamp,
      usedDiff: to.used - from.used,
      totalDiff: to.total - from.total,
      usedGrowth: ((to.used - from.used) / from.used * 100).toFixed(2) + '%'
    }
    
    console.log('Memory comparison:', { from, to, diff })
    return diff
  }
  
  detectLeaks() {
    if (this.snapshots.length < 3) {
      console.warn('Need at least 3 snapshots to detect leaks')
      return
    }
    
    const recent = this.snapshots.slice(-3)
    const growth = recent[2].used - recent[0].used
    
    if (growth > 1024 * 1024 * 10) { // 10MB增长
      console.warn('Potential memory leak detected:', {
        growth: `${(growth / 1024 / 1024).toFixed(2)}MB`,
        snapshots: recent
      })
      return true
    }
    
    return false
  }
  
  startMonitoring(interval = 5000) {
    const intervalId = setInterval(() => {
      this.takeSnapshot(`auto-${Date.now()}`)
      
      if (this.detectLeaks()) {
        console.error('Memory leak detected! Stopping monitoring.')
        clearInterval(intervalId)
      }
    }, interval)
    
    console.log('Memory monitoring started')
    return intervalId
  }
}
```

### 2. 性能分析

#### 函数性能分析

```typescript
// src/utils/performance-debug.ts
export class PerformanceProfiler {
  private profiles: Map<string, ProfileData> = new Map()
  
  start(label: string) {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()
    
    return {
      end: () => {
        const endTime = performance.now()
        const endMemory = this.getMemoryUsage()
        
        const profile: ProfileData = {
          label,
          duration: endTime - startTime,
          memoryStart: startMemory,
          memoryEnd: endMemory,
          memoryDiff: endMemory - startMemory,
          timestamp: Date.now()
        }
        
        this.profiles.set(label, profile)
        console.log(`Performance profile [${label}]:`, profile)
        
        return profile
      }
    }
  }
  
  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0
  }
  
  getAllProfiles() {
    return Array.from(this.profiles.values())
  }
  
  getSlowestOperations(limit = 10) {
    return this.getAllProfiles()
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }
  
  getAverageDuration(label: string) {
    const profiles = Array.from(this.profiles.values())
      .filter(p => p.label === label)
    
    if (profiles.length === 0) return 0
    
    const total = profiles.reduce((sum, p) => sum + p.duration, 0)
    return total / profiles.length
  }
  
  clearProfiles() {
    this.profiles.clear()
    console.log('Performance profiles cleared')
  }
}

interface ProfileData {
  label: string
  duration: number
  memoryStart: number
  memoryEnd: number
  memoryDiff: number
  timestamp: number
}
```

### 3. 异步操作调试

#### Promise调试

```typescript
// src/utils/promise-debug.ts
export class PromiseDebugger {
  static debugPromise<T>(label: string, promise: Promise<T>): Promise<T> {
    const startTime = Date.now()
    
    console.log(`Promise [${label}] started`)
    
    return promise
      .then((result) => {
        const duration = Date.now() - startTime
        console.log(`Promise [${label}] resolved in ${duration}ms:`, result)
        return result
      })
      .catch((error) => {
        const duration = Date.now() - startTime
        console.error(`Promise [${label}] rejected after ${duration}ms:`, error)
        throw error
      })
  }
  
  static async debugAll<T>(label: string, promises: Promise<T>[]): Promise<T[]> {
    const startTime = Date.now()
    
    console.log(`Promise.all [${label}] started with ${promises.length} promises`)
    
    try {
      const results = await Promise.all(promises)
      const duration = Date.now() - startTime
      console.log(`Promise.all [${label}] resolved in ${duration}ms:`, results)
      return results
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Promise.all [${label}] rejected after ${duration}ms:`, error)
      throw error
    }
  }
  
  static async debugRace<T>(label: string, promises: Promise<T>[]): Promise<T> {
    const startTime = Date.now()
    
    console.log(`Promise.race [${label}] started with ${promises.length} promises`)
    
    try {
      const result = await Promise.race(promises)
      const duration = Date.now() - startTime
      console.log(`Promise.race [${label}] resolved in ${duration}ms:`, result)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Promise.race [${label}] rejected after ${duration}ms:`, error)
      throw error
    }
  }
  
  static createTrackedPromise<T>(label: string, executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void): Promise<T> {
    const promise = new Promise<T>(executor)
    return this.debugPromise(label, promise)
  }
}
```

## 调试工具集成

### 1. VS Code扩展推荐

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-npm-script",
    "christian-kohler.npm-intellisense",
    "ms-vscode.vscode-chrome-debug",
    "ms-vscode.debugger-for-chrome",
    "ms-vscode.vscode-firefox-debug",
    "humao.rest-client",
    "ms-vscode.vscode-mysql",
    "mtxr.sqltools",
    "ms-vscode.vscode-docker",
    "ms-azuretools.vscode-docker",
    "ms-vscode-remote.remote-containers",
    "eamodio.gitlens",
    "ms-vscode.vscode-git-base"
  ]
}
```

### 2. 浏览器扩展

```javascript
// 在浏览器控制台中运行的调试工具
window.debugTools = {
  // 网络调试
  network: {
    logRequests: () => {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
            console.log('Network:', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            })
          }
        })
      })
      observer.observe({ entryTypes: ['resource'] })
    },
    
    clearCache: () => {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
    }
  },
  
  // 存储调试
  storage: {
    getAll: () => {
      const data = {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
      }
      console.log('Storage:', data)
      return data
    },
    
    clearAll: () => {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
    }
  },
  
  // 性能调试
  performance: {
    getMetrics: () => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')
      
      return {
        navigation,
        paint,
        memory: performance.memory,
        timing: performance.timing
      }
    },
    
    measureFunction: (name, fn) => {
      const start = performance.now()
      const result = fn()
      const end = performance.now()
      console.log(`Function ${name} took ${end - start}ms`)
      return result
    }
  }
}
```

### 3. 调试脚本

```bash
#!/bin/bash
# scripts/debug.sh

echo "=== 项目管理平台调试工具 ==="

case "$1" in
  "logs")
    echo "显示应用日志..."
    tail -f logs/app.log
    ;;
  "errors")
    echo "显示错误日志..."
    tail -f logs/error.log | grep ERROR
    ;;
  "database")
    echo "数据库连接状态..."
    psql -h localhost -U postgres -d project_management -c "SELECT version();"
    ;;
  "redis")
    echo "Redis连接状态..."
    redis-cli ping
    redis-cli info memory
    ;;
  "performance")
    echo "系统性能..."
    top -bn1 | head -20
    free -h
    df -h
    ;;
  "network")
    echo "网络连接..."
    netstat -tulpn | grep :3000
    netstat -tulpn | grep :5432
    ;;
  "docker")
    echo "Docker容器状态..."
    docker ps -a
    docker logs project-management-api --tail 50
    ;;
  "health")
    echo "健康检查..."
    curl -f http://localhost:3000/health || echo "API服务不可用"
    curl -f http://localhost:8080/ || echo "Web服务不可用"
    ;;
  *)
    echo "用法: $0 {logs|errors|database|redis|performance|network|docker|health}"
    echo ""
    echo "可用命令:"
    echo "  logs       - 显示应用日志"
    echo "  errors     - 显示错误日志"
    echo "  database   - 检查数据库连接"
    echo "  redis      - 检查Redis连接"
    echo "  performance- 显示系统性能"
    echo "  network    - 显示网络连接"
    echo "  docker     - 显示Docker状态"
    echo "  health     - 健康检查"
    ;;
esac
```

## 调试最佳实践

### 1. 调试原则

1. **最小化调试范围**
   - 逐步缩小问题范围
   - 使用二分法定位问题

2. **记录调试过程**
   - 保存调试日志
   - 记录解决方案

3. **自动化调试**
   - 使用调试脚本
   - 自动化测试

### 2. 调试环境隔离

```typescript
// src/config/debug.ts
export const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  verbose: process.env.DEBUG === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  features: {
    apiLogging: true,
    databaseLogging: true,
    performanceLogging: true,
    errorReporting: true
  },
  
  endpoints: {
    debug: '/api/debug',
    health: '/health',
    metrics: '/metrics'
  }
}
```

### 3. 调试信息保护

```typescript
// 生产环境移除调试信息
export function removeDebugInfo<T>(obj: T): T {
  if (process.env.NODE_ENV === 'production') {
    const cleaned = { ...obj }
    delete (cleaned as any).debugInfo
    delete (cleaned as any).internalData
    return cleaned
  }
  return obj
}

// 敏感信息过滤
export function sanitizeForLog(data: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'key']
  const sanitized = JSON.parse(JSON.stringify(data))
  
  function sanitizeObject(obj: any) {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]'
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key])
        }
      }
    }
  }
  
  sanitizeObject(sanitized)
  return sanitized
}
```

## 调试清单

### 开发阶段
- [ ] 配置调试环境
- [ ] 设置断点和日志
- [ ] 测试边界条件
- [ ] 验证错误处理

### 测试阶段
- [ ] 运行单元测试
- [ ] 执行集成测试
- [ ] 进行端到端测试
- [ ] 性能测试

### 生产阶段
- [ ] 配置监控告警
- [ ] 设置日志收集
- [ ] 准备故障响应
- [ ] 建立调试流程

## 总结

有效的调试是保证系统质量的关键。通过合理使用调试工具、建立调试流程和遵循最佳实践，可以快速定位和解决系统问题，提升开发效率和系统稳定性。