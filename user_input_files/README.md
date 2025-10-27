# Developer Task Board

一个用于可视化展示团队成员任务分配的 React 组件库。

![Task Board Preview](https://via.placeholder.com/800x400?text=Task+Board+Preview)

## ✨ 特性

- 📅 **时间轴视图** - 按周分组显示日期，清晰展示任务时间线 (需求 1.3, 4.1-4.4)
- 🗓️ **日期筛选** - 支持日历选择器动态筛选时间段，查看不同时期的资源排期
- 👥 **成员管理** - 按岗位展示团队成员，一目了然 (需求 1.1, 1.2)
- 📊 **跨日任务** - 自动计算和显示跨越多天的任务 (需求 2.1-2.4)
- 🎨 **状态颜色** - 5 种预设颜色方案，支持自定义 (需求 3.1-3.4)
- ✏️ **编辑模式** - 支持直接在看板上编辑任务 (需求 7.3, 7.4)
- 📱 **响应式设计** - 适配桌面和移动设备 (需求 5.1-5.4)
- 🔍 **数据验证** - 自动验证输入数据，提供错误提示 (需求 6.4)
- ♿ **可访问性** - 支持键盘导航和屏幕阅读器
- 🚀 **高性能** - 优化的渲染性能，支持大量数据
- ⚡ **虚拟滚动** - 支持 100+ 成员、1000+ 任务的大数据场景 (需求 6.3)

## 📦 安装

```bash
npm install developer-task-board
```

或使用 yarn:

```bash
yarn add developer-task-board
```

## 🚀 快速开始

```tsx
import React from 'react';
import { TaskBoard } from 'developer-task-board';
import type { Task, Member, BoardConfig } from 'developer-task-board';

function App() {
  const members: Member[] = [
    { id: 'm1', name: '张三', role: '前端工程师' },
    { id: 'm2', name: '李四', role: '后端工程师' },
  ];

  const tasks: Task[] = [
    {
      id: 't1',
      title: '登录页面开发',
      memberId: 'm1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-03'),
      status: 'inProgress',
      description: '实现用户登录界面',
    },
    {
      id: 't2',
      title: 'API 接口开发',
      memberId: 'm2',
      startDate: new Date('2024-01-02'),
      endDate: new Date('2024-01-05'),
      status: 'pending',
      description: '开发后端 API',
    },
  ];

  const config: BoardConfig = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    weekStartDay: 1, // 周一开始
  };

  return (
    <TaskBoard
      config={config}
      tasks={tasks}
      members={members}
      onTaskClick={(task) => console.log('Clicked:', task)}
    />
  );
}

export default App;
```

## 📖 文档

### 核心概念

**TaskBoard** 组件以表格形式展示任务分配：
- **横轴**: 日期时间轴，按周分组
- **纵轴**: 团队成员列表
- **单元格**: 显示具体任务，支持跨日显示

### 主要 Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `config` | `BoardConfig` | ✓ | 看板配置 |
| `tasks` | `Task[]` | ✓ | 任务列表 |
| `members` | `Member[]` | ✓ | 成员列表 |
| `onTaskClick` | `(task: Task) => void` | ✗ | 任务点击回调 |
| `onTaskUpdate` | `(task: Task) => void` | ✗ | 任务更新回调 |
| `onCellClick` | `(member: Member, date: Date) => void` | ✗ | 空单元格点击回调 |

### 配置选项

```typescript
interface BoardConfig {
  startDate: Date;           // 起始日期
  endDate: Date;             // 结束日期
  weekStartDay?: 0 | 1;      // 周起始日 (0=周日, 1=周一)
  editable?: boolean;        // 是否可编辑
  colorScheme?: ColorScheme; // 自定义颜色
  showWeekends?: boolean;    // 是否显示周末
  onDateRangeChange?: (startDate: Date, endDate: Date) => void; // 日期范围变化回调
}
```

### 任务状态

支持 5 种任务状态，每种状态有对应的颜色：

- `pending` - 待开始 (浅黄色)
- `inProgress` - 进行中 (浅蓝色)
- `completed` - 已完成 (浅绿色)
- `blocked` - 阻塞 (浅红色)
- `review` - 评审中 (浅绿黄色)

## 🎯 使用示例

### 基础示例

查看 [examples/basic-example.tsx](./examples/basic-example.tsx) 了解基础用法。

```tsx
import { BasicExample } from './examples/basic-example';

function App() {
  return <BasicExample />;
}
```

### 高级功能示例

查看 [examples/advanced-example.tsx](./examples/advanced-example.tsx) 了解高级功能：
- 编辑模式
- 自定义颜色方案
- 事件回调处理

```tsx
import { AdvancedExample } from './examples/advanced-example';

function App() {
  return <AdvancedExample />;
}
```

### 编辑模式示例

查看 [examples/edit-mode-example.tsx](./examples/edit-mode-example.tsx) 了解编辑模式的详细用法。

### 日期筛选示例

查看 [examples/date-filter-example.tsx](./examples/date-filter-example.tsx) 了解如何使用日期筛选功能：
- 自定义日期范围选择
- 快捷日期选项（本周、本月、未来两周）
- 自动过滤任务数据

```tsx
import { DateFilterExample } from './examples/date-filter-example';

function App() {
  return <DateFilterExample />;
}
```

## 🎨 自定义样式

### 使用自定义颜色方案

```tsx
const customColors = {
  pending: '#FFE082',
  inProgress: '#81D4FA',
  completed: '#A5D6A7',
  blocked: '#EF9A9A',
  review: '#CE93D8',
};

<TaskBoard
  config={{ ...config, colorScheme: customColors }}
  tasks={tasks}
  members={members}
/>
```

### 使用 CSS 类名

```tsx
<TaskBoard
  config={config}
  tasks={tasks}
  members={members}
  className="my-custom-board"
/>
```

```css
.my-custom-board {
  max-height: 600px;
  border-radius: 8px;
}
```

## 🔧 API 参考

完整的 API 文档请查看 [docs/API.md](./docs/API.md)。

### 主要类型

```typescript
// 任务接口
interface Task {
  id: string;
  title: string;
  memberId: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  color?: string;
  description?: string;
}

// 成员接口
interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// 任务状态
type TaskStatus = 'pending' | 'inProgress' | 'completed' | 'blocked' | 'review';
```

## 🛠️ 开发

### 构建项目

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

## 📋 需求覆盖

本组件实现了以下需求：

- ✅ 需求 1: 表格形式展示成员和时间轴 (1.1-1.4)
- ✅ 需求 2: 跨日任务显示 (2.1-2.4)
- ✅ 需求 3: 任务状态颜色 (3.1-3.4)
- ✅ 需求 4: 按周分组显示 (4.1-4.4)
- ✅ 需求 5: 响应式设计 (5.1-5.4)
- ✅ 需求 6: 数据驱动配置 (6.1-6.4)
- ✅ 需求 7: 交互功能 (7.1-7.4)

## 🌐 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关文档

- [API 文档](./docs/API.md) - 完整的 API 参考
- [日期筛选文档](./docs/DATE_FILTER.md) - 日期筛选功能使用指南
- [虚拟滚动文档](./docs/VIRTUAL_SCROLLING.md) - 虚拟滚动使用指南
- [编辑模式文档](./docs/EDIT_MODE.md) - 编辑模式使用指南
- [可访问性文档](./docs/ACCESSIBILITY.md) - 键盘导航和 ARIA 支持
- [基础示例](./examples/basic-example.tsx) - 基础用法示例
- [高级示例](./examples/advanced-example.tsx) - 高级功能示例
- [日期筛选示例](./examples/date-filter-example.tsx) - 日期筛选示例
- [编辑模式示例](./examples/edit-mode-example.tsx) - 编辑模式示例
- [虚拟滚动示例](./examples/virtual-scroll-example.tsx) - 虚拟滚动示例
- [错误边界示例](./examples/error-boundary-example.tsx) - 错误处理示例
- [可访问性示例](./examples/accessibility-example.tsx) - 键盘导航和屏幕阅读器支持

## 💡 常见问题

### 如何隐藏周末？

```tsx
const config: BoardConfig = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  showWeekends: false,
};
```

### 如何启用编辑模式？

```tsx
const config: BoardConfig = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  editable: true,
};

<TaskBoard
  config={config}
  tasks={tasks}
  members={members}
  onTaskUpdate={(task) => {
    // 处理任务更新
    console.log('Updated:', task);
  }}
/>
```

### 如何自定义任务颜色？

```tsx
// 方式 1: 使用自定义颜色方案
const config: BoardConfig = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  colorScheme: {
    pending: '#FFE082',
    inProgress: '#81D4FA',
    completed: '#A5D6A7',
    blocked: '#EF9A9A',
    review: '#CE93D8',
  },
};

// 方式 2: 为单个任务设置颜色
const task: Task = {
  id: 't1',
  title: '特殊任务',
  memberId: 'm1',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-03'),
  status: 'inProgress',
  color: '#FF5722', // 自定义颜色
};
```

### 如何处理大量数据？

对于大数据量场景（100+ 成员、1000+ 任务），推荐使用 `VirtualTaskBoard` 组件：

```tsx
import { VirtualTaskBoard } from 'developer-task-board';

<VirtualTaskBoard
  config={config}
  tasks={tasks}
  members={members}
  containerHeight={600}
  rowHeight={60}
  overscanCount={3}
/>
```

虚拟滚动只渲染可见区域的行，性能提升约 10 倍。详见 [虚拟滚动文档](./docs/VIRTUAL_SCROLLING.md)。

### 如何处理渲染错误？

使用 `TaskBoardErrorBoundary` 组件包裹 TaskBoard，捕获渲染错误并显示友好的错误信息：

```tsx
import { TaskBoard, TaskBoardErrorBoundary } from 'developer-task-board';

<TaskBoardErrorBoundary>
  <TaskBoard
    config={config}
    tasks={tasks}
    members={members}
  />
</TaskBoardErrorBoundary>
```

错误边界会：
- 自动捕获子组件树中的 JavaScript 错误
- 显示友好的错误信息而不是白屏
- 在开发环境下显示详细的错误堆栈
- 提供重新加载按钮恢复应用

你也可以自定义错误 UI：

```tsx
<TaskBoardErrorBoundary
  fallback={(error, errorInfo) => (
    <div>
      <h3>自定义错误提示</h3>
      <p>{error.message}</p>
    </div>
  )}
>
  <TaskBoard {...props} />
</TaskBoardErrorBoundary>
```

查看 [错误边界示例](./examples/error-boundary-example.tsx) 了解更多用法。

## 🎉 致谢

感谢所有贡献者的支持！
