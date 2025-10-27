# 🚀 快速开始

## 3 步开始使用

### 1️⃣ 安装

```bash
npm install developer-task-board
```

### 2️⃣ 导入

```tsx
import { TaskBoard } from 'developer-task-board';
import 'developer-task-board/style.css';
```

### 3️⃣ 使用

```tsx
<TaskBoard
  config={{
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
  }}
  tasks={[
    {
      id: 't1',
      title: '任务1',
      memberId: 'm1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-03'),
      status: 'inProgress',
    },
  ]}
  members={[
    { id: 'm1', name: '张三', role: '开发' },
  ]}
/>
```

## 完整示例

```tsx
import { useState } from 'react';
import { TaskBoard } from 'developer-task-board';
import 'developer-task-board/style.css';
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
    },
  ];

  const config: BoardConfig = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
  };

  return <TaskBoard config={config} tasks={tasks} members={members} />;
}
```

## 下一步

- 📖 查看 [完整文档](./README.md)
- 🎯 查看 [快速参考](./QUICK_REFERENCE.md)
- 💡 查看 [使用示例](./USAGE_AS_PACKAGE.md)
- 🔧 查看 [构建指南](./BUILD.md)

## 本地开发

### 克隆项目

```bash
git clone https://github.com/yourusername/developer-task-board.git
cd developer-task-board
npm install
```

### 运行 Demo

```bash
npm run dev
```

### 构建包

```bash
npm run build
```

### 本地测试

```bash
npm pack
npm install /path/to/developer-task-board-1.1.0.tgz
```

## 需要帮助？

- 📚 [完整文档](./README.md)
- 🐛 [报告问题](https://github.com/yourusername/developer-task-board/issues)
- 💬 [讨论区](https://github.com/yourusername/developer-task-board/discussions)
