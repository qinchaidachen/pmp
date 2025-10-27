# Developer Task Board 组件使用指南

## 🎯 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { UnifiedTaskBoard } from './components/TaskBoard';

function MyComponent() {
  return (
    <UnifiedTaskBoard
      onTaskClick={(task) => console.log('Task clicked:', task)}
      onTaskCreate={(memberId, date) => console.log('Create task:', memberId, date)}
      editable={true}
      defaultView="gantt"
    />
  );
}
```

### 2. 甘特图专用组件

```tsx
import React from 'react';
import { GanttTaskBoard } from './components/TaskBoard';

function GanttView() {
  return (
    <GanttTaskBoard
      config={{
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        showWeekends: true,
      }}
      onTaskClick={handleTaskClick}
      onTaskCreate={handleTaskCreate}
      editable={true}
    />
  );
}
```

### 3. 演示组件

```tsx
import React from 'react';
import DeveloperTaskBoardDemo from './examples/DeveloperTaskBoardDemo';

function Demo() {
  return <DeveloperTaskBoardDemo />;
}
```

## 📋 组件说明

### UnifiedTaskBoard
统一任务看板，支持表格式和甘特图两种视图。

**Props:**
- `onTaskClick?: (task: Task) => void` - 任务点击回调
- `onTaskCreate?: (memberId: string, date: Date) => void` - 创建任务回调
- `editable?: boolean` - 是否可编辑
- `defaultView?: 'table' | 'gantt'` - 默认视图

### GanttTaskBoard
甘特图任务看板组件。

**Props:**
- `config?: { startDate?: Date, endDate?: Date, showWeekends?: boolean, editable?: boolean }` - 配置选项
- `onTaskClick?: (task: Task) => void` - 任务点击回调
- `onTaskCreate?: (memberId: string, date: Date) => void` - 创建任务回调
- `editable?: boolean` - 是否可编辑

## 🎨 样式定制

### 导入样式
```tsx
import 'developer-task-board/style.css';
```

### 自定义样式
```css
/* 自定义甘特图样式 */
.gantt-task-board {
  --primary-color: #1890ff;
  --border-color: #d9d9d9;
  --background-color: #ffffff;
}

/* 自定义任务卡片样式 */
.task-card {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 🔧 数据格式

### Task 接口
```typescript
interface Task {
  id: string;
  title: string;
  memberId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'inProgress' | 'review' | 'completed' | 'blocked';
  description?: string;
  priority?: string;
  storyPoints?: number;
  actualPersonDays?: number;
}
```

### Member 接口
```typescript
interface Member {
  id: string;
  name: string;
  role: string;
}
```

### BoardConfig 接口
```typescript
interface BoardConfig {
  startDate: Date;
  endDate: Date;
  showWeekends?: boolean;
  editable?: boolean;
}
```

## 📱 响应式支持

组件自动适配不同屏幕尺寸：

- **桌面端** (>1024px): 完整功能展示
- **平板端** (768px-1024px): 优化布局
- **移动端** (<768px): 简化界面，触摸优化

## ⚡ 性能优化

### 1. 大量数据处理
```tsx
// 使用React.memo优化渲染
const OptimizedGanttBoard = React.memo(GanttTaskBoard);

// 分页加载大量任务
const [currentPage, setCurrentPage] = useState(1);
const tasksPerPage = 50;
const paginatedTasks = tasks.slice(
  (currentPage - 1) * tasksPerPage,
  currentPage * tasksPerPage
);
```

### 2. 状态管理优化
```tsx
// 使用useMemo缓存计算结果
const ganttTasks = useMemo(() => {
  return tasks.map(task => ({
    // ... 转换逻辑
  }));
}, [tasks]);
```

## 🐛 常见问题

### Q: 样式不生效？
A: 确保正确导入样式文件：
```tsx
import 'developer-task-board/style.css';
```

### Q: 任务状态不更新？
A: 检查状态映射是否正确：
```tsx
const statusMap = {
  'pending': TaskStatus.PENDING,
  'inProgress': TaskStatus.IN_PROGRESS,
  // ...
};
```

### Q: 移动端显示异常？
A: 检查响应式断点设置，组件会自动适配移动端。

### Q: 性能问题？
A: 考虑使用虚拟滚动或分页加载大量数据。

## 🔄 版本更新

### v1.1.0 (当前版本)
- ✅ 基础甘特图功能
- ✅ Redux状态集成
- ✅ 响应式设计
- ✅ 统一看板容器

### 计划功能
- [ ] 虚拟滚动支持
- [ ] 任务依赖关系
- [ ] 里程碑标记
- [ ] 导出功能

## 📚 相关资源

- [组件文档](./user_input_files/GET_STARTED.md)
- [集成报告](./DEVELOPER_TASK_BOARD_INTEGRATION.md)
- [示例代码](./src/examples/)
- [测试组件](./src/test-integration.tsx)

## 🤝 贡献指南

如需贡献代码或报告问题，请：

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

---

**更新时间**: 2025-10-27  
**版本**: v1.1.0  
**兼容性**: React 18+, TypeScript, Ant Design 5+