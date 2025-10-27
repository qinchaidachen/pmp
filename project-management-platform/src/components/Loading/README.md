# Loading 组件使用指南

本项目提供了完整的加载状态和骨架屏解决方案，用于提升用户体验。

## 组件概览

### 1. LoadingSpinner - 加载旋转器
用于显示简单的加载动画。

```tsx
import { LoadingSpinner } from '@/components/Loading';

// 基本用法
<LoadingSpinner />

// 自定义配置
<LoadingSpinner 
  size="lg" 
  color="primary" 
  text="正在加载..." 
  className="my-4"
/>
```

**属性说明：**
- `size`: 'sm' | 'md' | 'lg' | 'xl' - 尺寸
- `color`: 'primary' | 'secondary' | 'white' | 'gray' - 颜色
- `text`: string - 显示文本
- `className`: string - 自定义样式类

### 2. Skeleton - 骨架屏组件
用于数据加载时的占位显示。

```tsx
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, SkeletonChart, SkeletonDashboard } from '@/components/Loading';

// 基本骨架屏
<Skeleton width={200} height={20} />

// 文本骨架屏（多行）
<Skeleton variant="text" lines={3} />

// 预定义组件
<SkeletonCard />
<SkeletonTable rows={5} cols={4} />
<SkeletonList items={3} />
<SkeletonChart />
<SkeletonDashboard />
```

**预定义组件说明：**
- `SkeletonCard`: 卡片骨架屏
- `SkeletonTable`: 表格骨架屏
- `SkeletonList`: 列表骨架屏
- `SkeletonChart`: 图表骨架屏
- `SkeletonDashboard`: 仪表板骨架屏

### 3. LoadingOverlay - 加载覆盖层
用于覆盖整个页面或区域的加载状态。

```tsx
import { LoadingOverlay, LoadingSection } from '@/components/Loading';

// 全屏覆盖层
<LoadingOverlay 
  isVisible={isLoading} 
  text="正在加载..." 
  backdrop={true}
/>

// 局部覆盖层
<LoadingSection 
  isVisible={isLoading} 
  text="加载中..." 
  minHeight="200px"
/>
```

## Redux 状态管理

### Loading Slice
项目提供了专门的loading状态管理。

```tsx
import { useLoading } from '@/hooks/useLoading';

const MyComponent = () => {
  const { 
    globalLoading, 
    setModule, 
    setOperation, 
    getModuleSelector 
  } = useLoading();
  
  // 使用loading状态
  const moduleLoading = useAppSelector(getModuleSelector('tasks'));
};
```

**可用方法：**
- `setGlobal(loading: boolean, message?: string)`: 设置全局加载状态
- `setModule(module: string, loading: boolean)`: 设置模块加载状态
- `setOperation(operation: string, loading: boolean, message?: string)`: 设置操作加载状态
- `clearAll()`: 清除所有加载状态
- `getModuleSelector(module: string)`: 获取模块加载状态选择器

## 使用示例

### 在页面组件中使用

```tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores';
import { useLoading } from '@/hooks/useLoading';
import { LoadingSpinner, SkeletonDashboard, LoadingOverlay } from '@/components/Loading';
import { fetchTasks } from '@/stores/slices/tasksSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  
  // 使用loading hook
  const { setModule, getModuleSelector } = useLoading();
  const dashboardLoading = useAppSelector(getModuleSelector('dashboard'));
  
  useEffect(() => {
    const loadData = async () => {
      setModule('dashboard', true);
      try {
        await dispatch(fetchTasks()).unwrap();
      } finally {
        setModule('dashboard', false);
      }
    };
    loadData();
  }, [dispatch, setModule]);
  
  // 判断是否显示骨架屏
  const showSkeleton = dashboardLoading;
  
  return (
    <div className="dashboard relative">
      <LoadingOverlay isVisible={globalLoading} text="加载中..." />
      
      {showSkeleton ? (
        <SkeletonDashboard />
      ) : (
        // 实际内容
        <div>{/* ... */}</div>
      )}
    </div>
  );
};
```

### 在异步操作中使用

```tsx
import { createAsyncAction } from '@/hooks/useLoading';

const MyComponent = () => {
  const { setOperation } = useLoading();
  
  // 创建带loading状态的异步操作
  const fetchDataWithLoading = createAsyncAction(
    'fetch-data',
    async (params: any) => {
      // 实际的API调用
      const response = await api.fetchData(params);
      return response;
    },
    setOperation
  );
  
  const handleFetch = async () => {
    const result = await fetchDataWithLoading({ id: 1 });
    // 处理结果
  };
  
  return (
    <button onClick={handleFetch}>
      获取数据
    </button>
  );
};
```

## 最佳实践

### 1. 页面级加载状态
- 使用 `SkeletonDashboard` 等预定义组件
- 在Redux中管理loading状态
- 使用 `LoadingOverlay` 处理全局加载

### 2. 组件级加载状态
- 使用 `LoadingSection` 覆盖特定区域
- 使用 `Skeleton` 组件提供视觉反馈
- 保持加载状态的语义化命名

### 3. 操作级加载状态
- 使用 `setOperation` 管理具体操作
- 提供有意义的加载消息
- 在操作完成后及时清理状态

### 4. 性能优化
- 避免不必要的loading状态切换
- 使用 `useMemo` 缓存复杂计算
- 合理使用懒加载和虚拟滚动

## 注意事项

1. **状态一致性**: 确保loading状态与实际数据状态保持一致
2. **用户体验**: 提供有意义的加载消息，避免长时间无响应
3. **错误处理**: 在loading状态中处理可能的错误情况
4. **性能考虑**: 避免过度的loading状态更新，影响渲染性能

## 样式定制

所有组件都支持Tailwind CSS类名定制：

```tsx
<LoadingSpinner 
  className="bg-blue-100 p-4 rounded-lg"
  text="自定义样式"
/>

<Skeleton 
  className="bg-gray-300"
  width="100%"
  height="2rem"
/>
```