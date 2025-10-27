# 错误边界组件系统

这是一个完整的React错误边界组件系统，提供了全面的错误捕获、处理和监控功能。

## 功能特性

- ✅ **错误边界组件**: 捕获React组件树中的错误
- ✅ **友好错误界面**: 提供用户友好的错误提示和重试机制
- ✅ **全局错误处理**: 统一处理同步和异步错误
- ✅ **错误状态管理**: 集中管理错误状态和历史记录
- ✅ **错误日志记录**: 完整的错误日志记录和导出功能
- ✅ **错误监控面板**: 实时查看和管理错误信息
- ✅ **多级错误边界**: 支持页面级、组件级和全局级错误边界

## 文件结构

```
src/
├── components/
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx      # 主要错误边界组件
│       ├── ErrorFallback.tsx      # 错误提示界面组件
│       ├── ErrorMonitor.tsx       # 错误监控面板
│       ├── ErrorBoundaryExample.tsx # 使用示例
│       └── index.ts               # 导出文件
├── hooks/
│   └── useErrorHandler.ts         # 错误处理Hook
├── stores/
│   └── errorStore.ts              # 错误状态管理
├── utils/
│   └── errorLogger.ts             # 错误日志记录
└── App.tsx                        # 应用入口（已集成）
```

## 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* 你的组件 */}
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 2. 自定义错误界面

```tsx
import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

const CustomErrorFallback = ({ error, retry }) => (
  <div className="error-fallback">
    <h2>出错了</h2>
    <p>{error.message}</p>
    <button onClick={retry}>重试</button>
  </div>
);

function App() {
  return (
    <ErrorBoundary fallback={CustomErrorFallback}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 3. 使用错误处理Hook

```tsx
import React from 'react';
import { useErrorHandler } from './hooks/useErrorHandler';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleClick = () => {
    try {
      // 可能出错的代码
      throw new Error('测试错误');
    } catch (error) {
      handleError(error, {
        level: 'component',
        componentName: 'MyComponent',
      });
    }
  };

  return <button onClick={handleClick}>触发错误</button>;
}
```

### 4. 错误监控面板

```tsx
import React from 'react';
import { ErrorMonitor } from './components/ErrorBoundary';

function AdminPanel() {
  return (
    <div>
      <h1>管理面板</h1>
      <ErrorMonitor />
    </div>
  );
}
```

## 组件说明

### ErrorBoundary

主要的错误边界组件，支持以下props：

```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;           // 子组件
  fallback?: React.ComponentType;      // 自定义错误界面组件
  onError?: (error: Error, info) => void; // 错误回调
  level?: 'page' | 'component' | 'global'; // 错误级别
}
```

### ErrorFallback

默认的错误提示界面组件，提供：

- 友好的错误信息显示
- 重试功能（支持最多3次重试）
- 错误详情展开/收起
- 返回首页功能
- 完整的错误堆栈信息

### ErrorMonitor

错误监控面板，提供：

- 错误统计信息
- 错误列表和过滤
- 错误详情查看
- 错误日志导入/导出
- 错误状态管理

## Hook 说明

### useErrorHandler

主要的错误处理Hook：

```tsx
const {
  handleError,     // 处理错误
  errors,          // 错误列表
  removeError,     // 移除错误
  clearErrors,     // 清除所有错误
} = useErrorHandler();
```

### useErrorHandlerHook

自动设置全局错误处理：

```tsx
function App() {
  useErrorHandlerHook(); // 自动处理全局错误
  // ...
}
```

### useErrorBoundary

错误边界专用Hook：

```tsx
const { captureError } = useErrorBoundary();
```

## 状态管理

### ErrorProvider

错误状态提供者，需要在应用根组件中使用：

```tsx
import { ErrorProvider } from './stores/errorStore';

function App() {
  return (
    <ErrorProvider>
      {/* 你的应用 */}
    </ErrorProvider>
  );
}
```

### useErrorStore

访问错误状态：

```tsx
import { useErrorStore } from './stores/errorStore';

function MyComponent() {
  const { errors, clearErrors } = useErrorStore();
  // ...
}
```

## 日志记录

### errorLogger

全局日志记录器：

```tsx
import { errorLogger, logError, logWarn } from './utils/errorLogger';

// 直接使用logger
errorLogger.log(new Error('错误信息'));

// 使用便捷方法
logError(new Error('错误'));
logWarn('警告信息');
logInfo('信息');
logDebug('调试信息');

// 获取统计信息
const stats = errorLogger.getStats();

// 导出日志
const logs = errorLogger.exportLogs();
```

## 配置选项

### 日志配置

```tsx
import { errorLogger } from './utils/errorLogger';

errorLogger.updateConfig({
  maxEntries: 1000,        // 最大日志条目数
  enableConsole: true,     // 启用控制台输出
  enableStorage: true,     // 启用本地存储
  enableRemote: false,     // 启用远程发送
  remoteEndpoint: '...',   // 远程端点
  filterLevels: ['error', 'warn'], // 日志级别过滤
});
```

## 最佳实践

### 1. 分层错误边界

```tsx
// 全局错误边界
<ErrorBoundary level="global">
  <App />
</ErrorBoundary>

// 页面级错误边界
<ErrorBoundary level="page">
  <Dashboard />
</ErrorBoundary>

// 组件级错误边界
<ErrorBoundary level="component">
  <ComplexComponent />
</ErrorBoundary>
```

### 2. 错误上下文

```tsx
handleError(error, {
  level: 'component',
  componentName: 'UserProfile',
  action: 'fetchUserData',
  userId: '123',
  additionalContext: '...',
});
```

### 3. 错误监控

```tsx
// 在管理界面添加错误监控
<Route path="/admin/errors" component={ErrorMonitor} />
```

## 注意事项

1. **性能考虑**: 错误边界不应过度使用，每个错误边界都会增加一些性能开销
2. **错误恢复**: 合理设置重试次数，避免无限重试
3. **日志管理**: 定期清理旧日志，避免localStorage溢出
4. **用户体验**: 在生产环境中，应提供更友好的错误界面
5. **错误上报**: 可以集成第三方错误监控服务（如Sentry）

## 故障排除

### 常见问题

1. **错误边界不工作**: 检查是否正确包装了组件
2. **样式问题**: 确保已正确引入Ant Design样式
3. **状态丢失**: 检查ErrorProvider是否在正确位置
4. **内存泄漏**: 确保在组件卸载时正确清理事件监听器

### 调试技巧

1. 打开浏览器开发者工具查看控制台输出
2. 使用ErrorMonitor查看错误历史
3. 检查localStorage中的错误日志
4. 使用exportLogs功能导出详细日志

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的错误边界系统
- 错误监控面板
- 日志记录功能
- 状态管理集成