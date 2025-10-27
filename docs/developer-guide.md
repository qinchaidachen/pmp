# 开发者指南 (Developer Guide)

本文档面向开发人员，介绍项目的代码结构、开发环境搭建、核心组件实现和扩展开发指南。

## 📑 目录

- [开发环境搭建](#开发环境搭建)
- [项目架构](#项目架构)
- [代码结构](#代码结构)
- [核心组件开发](#核心组件开发)
- [状态管理](#状态管理)
- [数据层设计](#数据层设计)
- [样式系统](#样式系统)
- [测试指南](#测试指南)
- [性能优化](#性能优化)
- [扩展开发](#扩展开发)
- [部署指南](#部署指南)
- [代码规范](#代码规范)

## 开发环境搭建

### 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐)
- **Git**: 最新版本
- **VS Code**: 推荐IDE

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd project-management-platform
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:5173`

### 开发工具配置

#### VS Code 扩展推荐

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-react-native",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

#### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

#### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 项目架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Components │ │    Pages    │ │    Hooks    │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│                    Business Logic Layer                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Stores    │ │  Services   │ │   Utils     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│                      Data Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ IndexedDB   │ │   Cache     │ │   Local     │        │
│  │   (Dexie)   │ │   Manager   │ │   Storage   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 技术栈架构

```
Frontend Framework: React 18.3.1
    ↓
Build Tool: Vite 6.0.1
    ↓
Language: TypeScript 5.6.2
    ↓
State Management: Redux Toolkit + React Redux
    ↓
UI Components: Ant Design + Radix UI + TailwindCSS
    ↓
Data Storage: IndexedDB (Dexie)
    ↓
Routing: React Router DOM 6.x
```

## 代码结构

### 目录结构详解

```
src/
├── components/              # 可复用组件
│   ├── Dashboard/          # 仪表板组件
│   │   ├── index.tsx       # 组件入口
│   │   ├── Dashboard.tsx   # 主要组件
│   │   ├── Dashboard.module.css # 样式文件
│   │   └── types.ts        # 类型定义
│   ├── TaskBoard/          # 任务看板组件
│   │   ├── TaskBoard.tsx   # 主组件
│   │   ├── TaskCell.tsx    # 任务单元格
│   │   ├── MemberRow.tsx   # 成员行
│   │   ├── WeekHeader.tsx  # 周标题
│   │   ├── TaskTooltip.tsx # 任务提示
│   │   └── index.ts        # 导出文件
│   ├── TeamManagement/     # 团队管理
│   ├── ResourceBooking/    # 资源预订
│   ├── Leaderboard/        # 排行榜
│   ├── Loading/            # 加载组件
│   ├── Layout/             # 布局组件
│   │   ├── Header.tsx      # 顶部导航
│   │   ├── Sidebar.tsx     # 侧边栏
│   │   ├── Footer.tsx      # 底部
│   │   └── MainLayout.tsx  # 主布局
│   ├── ErrorBoundary/      # 错误边界
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorFallback.tsx
│   │   └── index.ts
│   └── ui/                 # 基础UI组件
│       ├── Button.tsx      # 按钮组件
│       ├── Input.tsx       # 输入框
│       ├── Modal.tsx       # 模态框
│       └── index.ts        # 统一导出
├── pages/                  # 页面组件
│   ├── Dashboard.tsx       # 仪表板页面
│   ├── TaskBoardPage.tsx   # 任务看板页面
│   ├── TeamManagement.tsx  # 团队管理页面
│   ├── ResourceBooking.tsx # 资源预订页面
│   └── index.ts            # 页面路由配置
├── services/               # 数据服务层
│   ├── taskService.ts      # 任务服务
│   ├── memberService.ts    # 成员服务
│   ├── resourceService.ts  # 资源服务
│   ├── database.ts         # 数据库配置
│   └── index.ts            # 服务导出
├── stores/                 # 状态管理
│   ├── index.ts            # Store配置
│   ├── hooks.ts            # Store Hooks
│   └── slices/             # Redux Slices
│       ├── tasksSlice.ts   # 任务状态
│       ├── membersSlice.ts # 成员状态
│       └── uiSlice.ts      # UI状态
├── hooks/                  # 自定义Hooks
│   ├── useTaskBoard.ts     # 任务看板Hook
│   ├── useLocalStorage.ts  # 本地存储Hook
│   ├── useDebounce.ts      # 防抖Hook
│   └── index.ts            # Hooks导出
├── types/                  # TypeScript类型定义
│   ├── task.ts             # 任务类型
│   ├── member.ts           # 成员类型
│   ├── resource.ts         # 资源类型
│   ├── api.ts              # API类型
│   └── index.ts            # 类型导出
├── utils/                  # 工具函数
│   ├── dateUtils.ts        # 日期工具
│   ├── colorUtils.ts       # 颜色工具
│   ├── validation.ts       # 验证工具
│   ├── constants.ts        # 常量定义
│   └── index.ts            # 工具导出
├── styles/                 # 全局样式
│   ├── globals.css         # 全局样式
│   ├── variables.css       # CSS变量
│   └── mixins.css          # 样式混入
└── App.tsx                 # 应用根组件
```

### 命名规范

#### 文件命名

- **组件文件**: PascalCase (如 `TaskBoard.tsx`)
- **工具文件**: camelCase (如 `dateUtils.ts`)
- **常量文件**: UPPER_SNAKE_CASE (如 `API_ENDPOINTS.ts`)
- **类型文件**: camelCase (如 `task.types.ts`)

#### 变量命名

```typescript
// 常量 - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// 变量/函数 - camelCase
const taskList = [];
const getTaskById = (id: string) => {};

// 类/接口 - PascalCase
interface TaskBoardProps {}
class TaskBoardManager {}

// 私有属性 - 前缀下划线
class TaskService {
  private _cache = new Map();
}
```

## 核心组件开发

### 组件设计模式

#### 1. 函数式组件 + Hooks

```typescript
// 推荐的组件模式
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TaskBoardProps } from './types';

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  members,
  config,
  onTaskClick,
  className,
}) => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoized values
  const processedTasks = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      // 处理逻辑
    }));
  }, [tasks]);
  
  // Callbacks
  const handleTaskClick = useCallback((task: Task) => {
    onTaskClick?.(task);
  }, [onTaskClick]);
  
  // Effects
  useEffect(() => {
    // 副作用逻辑
  }, [tasks, members]);
  
  // Render
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  return (
    <div className={className}>
      {/* 组件内容 */}
    </div>
  );
};
```

#### 2. 组件复合模式

```typescript
// 使用React.Children进行组件复合
interface TaskBoardContextType {
  tasks: Task[];
  members: Member[];
  onTaskClick?: (task: Task) => void;
}

const TaskBoardContext = React.createContext<TaskBoardContextType | null>(null);

interface TaskBoardProps {
  tasks: Task[];
  members: Member[];
  onTaskClick?: (task: Task) => void;
  children: React.ReactNode;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  members,
  onTaskClick,
  children,
}) => {
  const contextValue = {
    tasks,
    members,
    onTaskClick,
  };
  
  return (
    <TaskBoardContext.Provider value={contextValue}>
      <div className="task-board">
        {children}
      </div>
    </TaskBoardContext.Provider>
  );
};

// 子组件
export const TaskBoardHeader: React.FC = () => {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('TaskBoardHeader must be used within TaskBoard');
  }
  
  return (
    <thead>
      {/* 表头内容 */}
    </thead>
  );
};

export const TaskBoardBody: React.FC = () => {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('TaskBoardBody must be used within TaskBoard');
  }
  
  return (
    <tbody>
      {/* 表体内容 */}
    </tbody>
  );
};
```

### 任务看板组件实现

#### 核心组件结构

```typescript
// TaskBoard.tsx
import React, { useMemo, useCallback } from 'react';
import { TaskBoardProps } from './types';
import { useTaskBoard } from './hooks/useTaskBoard';
import { TaskBoardHeader } from './TaskBoardHeader';
import { TaskBoardBody } from './TaskBoardBody';
import { TaskBoardFooter } from './TaskBoardFooter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  members,
  config,
  callbacks,
  className,
  style,
  loading,
  error,
}) => {
  // 使用自定义Hook处理业务逻辑
  const {
    processedData,
    layoutConfig,
    handleTaskUpdate,
    handleCellClick,
  } = useTaskBoard({
    tasks,
    members,
    config,
    callbacks,
  });
  
  // 处理加载状态
  if (loading) {
    return (
      <div className="task-board-loading">
        <LoadingSpinner />
      </div>
    );
  }
  
  // 处理错误状态
  if (error) {
    return (
      <div className="task-board-error">
        <ErrorMessage message={error} />
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div 
        className={`task-board ${className || ''}`}
        style={style}
        role="grid"
        aria-label="团队任务看板"
      >
        <TaskBoardHeader 
          config={layoutConfig}
          members={members}
        />
        <TaskBoardBody
          data={processedData}
          config={layoutConfig}
          onTaskUpdate={handleTaskUpdate}
          onCellClick={handleCellClick}
        />
        <TaskBoardFooter config={layoutConfig} />
      </div>
    </ErrorBoundary>
  );
};
```

#### 自定义Hook实现

```typescript
// hooks/useTaskBoard.ts
import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TaskBoardHookProps } from './types';
import { taskActions } from '@/stores/slices/tasksSlice';
import { taskSelectors } from '@/stores/slices/tasksSlice';
import { useLayoutEngine } from '@/hooks/useLayoutEngine';
import { useDateUtils } from '@/hooks/useDateUtils';

export const useTaskBoard = ({
  tasks,
  members,
  config,
  callbacks,
}: TaskBoardHookProps) => {
  const dispatch = useDispatch();
  
  // 工具Hook
  const { generateLayout, calculateSpans } = useLayoutEngine();
  const { formatDate, groupByWeek } = useDateUtils();
  
  // 处理后的数据
  const processedData = useMemo(() => {
    if (!tasks.length || !members.length) {
      return { matrix: [], spans: [] };
    }
    
    // 生成布局
    const layout = generateLayout({
      tasks,
      members,
      config,
    });
    
    // 计算跨列信息
    const spans = calculateSpans(tasks, layout.dateRange);
    
    return {
      matrix: layout.matrix,
      spans,
      dateRange: layout.dateRange,
      weekGroups: groupByWeek(layout.dateRange, config.weekStartDay),
    };
  }, [tasks, members, config, generateLayout, calculateSpans, groupByWeek]);
  
  // 布局配置
  const layoutConfig = useMemo(() => ({
    ...config,
    columnWidth: 120,
    rowHeight: 60,
    cellPadding: 8,
  }), [config]);
  
  // 事件处理
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    dispatch(taskActions.updateTask(taskId, updates));
    callbacks?.onTaskUpdate?.(updates as Task);
  }, [dispatch, callbacks]);
  
  const handleTaskClick = useCallback((task: Task, event: React.MouseEvent) => {
    callbacks?.onTaskClick?.(task, event);
  }, [callbacks]);
  
  const handleCellClick = useCallback((member: Member, date: Date) => {
    callbacks?.onCellClick?.(member, date);
  }, [callbacks]);
  
  return {
    processedData,
    layoutConfig,
    handleTaskUpdate,
    handleTaskClick,
    handleCellClick,
  };
};
```

### 组件测试

```typescript
// TaskBoard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskBoard } from './TaskBoard';
import { tasksSlice } from '@/stores/slices/tasksSlice';

const mockTasks = [
  {
    id: '1',
    title: '任务1',
    memberId: 'member-1',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    status: 'pending' as const,
  },
];

const mockMembers = [
  {
    id: 'member-1',
    name: '张三',
    role: '前端开发',
    email: 'zhangsan@example.com',
    status: 'active' as const,
  },
];

const mockConfig = {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  weekStartDay: 1,
  editable: true,
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksSlice.reducer,
    },
    preloadedState: initialState,
  });
};

describe('TaskBoard', () => {
  it('应该正确渲染任务看板', () => {
    const store = createMockStore({
      tasks: { items: mockTasks, loading: false, error: null },
    });
    
    render(
      <Provider store={store}>
        <TaskBoard
          tasks={mockTasks}
          members={mockMembers}
          config={mockConfig}
        />
      </Provider>
    );
    
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('任务1')).toBeInTheDocument();
  });
  
  it('应该处理任务点击事件', async () => {
    const onTaskClick = jest.fn();
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <TaskBoard
          tasks={mockTasks}
          members={mockMembers}
          config={mockConfig}
          callbacks={{ onTaskClick }}
        />
      </Provider>
    );
    
    const taskCell = screen.getByText('任务1');
    fireEvent.click(taskCell);
    
    await waitFor(() => {
      expect(onTaskClick).toHaveBeenCalledWith(
        mockTasks[0],
        expect.any(Object)
      );
    });
  });
  
  it('应该显示加载状态', () => {
    const store = createMockStore({
      tasks: { items: [], loading: true, error: null },
    });
    
    render(
      <Provider store={store}>
        <TaskBoard
          tasks={[]}
          members={mockMembers}
          config={mockConfig}
          loading={true}
        />
      </Provider>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## 状态管理

### Redux Store 配置

```typescript
// stores/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { tasksSlice } from './slices/tasksSlice';
import { membersSlice } from './slices/membersSlice';
import { resourcesSlice } from './slices/resourcesSlice';
import { uiSlice } from './slices/uiSlice';
import { errorSlice } from './slices/errorSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    members: membersSlice.reducer,
    resources: resourcesSlice.reducer,
    ui: uiSlice.reducer,
    error: errorSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tasks/setTasks'],
        ignoredPaths: ['tasks.items'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slice 实现

```typescript
// stores/slices/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilters, TaskStats } from '@/types/task';
import { taskService } from '@/services/taskService';

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  filters: TaskFilters;
  sortBy: keyof Task;
  sortOrder: 'asc' | 'desc';
  stats: TaskStats;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  selectedTaskId: null,
  filters: {},
  sortBy: 'startDate',
  sortOrder: 'asc',
  stats: {
    total: 0,
    byStatus: {},
    byMember: {},
  },
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getAll();
      return tasks;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const task = await taskService.create(taskData);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload);
    },
    
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.items.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.items[taskIndex] = { ...state.items[taskIndex], ...updates };
      }
    },
    
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(task => task.id !== action.payload);
    },
    
    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: keyof Task; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setSelectedTask,
  setFilters,
  setSorting,
  setLoading,
  setError,
} = tasksSlice.actions;

// Selectors
export const selectAllTasks = (state: RootState) => state.tasks.items;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectSelectedTask = (state: RootState) =>
  state.tasks.items.find(task => task.id === state.tasks.selectedTaskId);

export const selectFilteredTasks = (state: RootState) => {
  const { items, filters, sortBy, sortOrder } = state.tasks;
  
  let filtered = items;
  
  // 应用筛选器
  if (filters.status) {
    filtered = filtered.filter(task => task.status === filters.status);
  }
  if (filters.memberId) {
    filtered = filtered.filter(task => task.memberId === filters.memberId);
  }
  if (filters.dateRange) {
    const [start, end] = filters.dateRange;
    filtered = filtered.filter(task => 
      task.startDate >= start && task.endDate <= end
    );
  }
  
  // 排序
  filtered.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
};

export default tasksSlice.reducer;
```

### Store Hooks

```typescript
// stores/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 特定选择器Hook
export const useTasks = () => useAppSelector(selectAllTasks);
export const useTasksLoading = () => useAppSelector(selectTasksLoading);
export const useSelectedTask = () => useAppSelector(selectSelectedTask);
export const useFilteredTasks = () => useAppSelector(selectFilteredTasks);
```

## 数据层设计

### 数据库设计 (Dexie)

```typescript
// services/database.ts
import Dexie, { Table } from 'dexie';
import { Task, Member, Resource, Booking } from '@/types';

export class ProjectManagementDB extends Dexie {
  tasks!: Table<Task>;
  members!: Table<Member>;
  resources!: Table<Resource>;
  bookings!: Table<Booking>;
  
  constructor() {
    super('ProjectManagementDB');
    
    this.version(1).stores({
      tasks: 'id, memberId, startDate, endDate, status, createdAt',
      members: 'id, email, role, department, status, createdAt',
      resources: 'id, type, status, createdAt',
      bookings: 'id, resourceId, bookedBy, startTime, endTime, status, createdAt',
    });
    
    this.version(2).stores({
      tasks: 'id, memberId, startDate, endDate, status, createdAt, updatedAt',
    }).upgrade(trans => {
      // 数据迁移逻辑
      return trans.tasks.toCollection().modify(task => {
        task.updatedAt = task.createdAt;
      });
    });
  }
}

export const db = new ProjectManagementDB();
```

### 服务层实现

```typescript
// services/taskService.ts
import { db } from './database';
import { Task } from '@/types';
import { eventManager, EventType } from '@/events/eventManager';

class TaskService {
  async getAll(): Promise<Task[]> {
    try {
      return await db.tasks.orderBy('startDate').toArray();
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw new Error('获取任务列表失败');
    }
  }
  
  async getById(id: string): Promise<Task | null> {
    try {
      return await db.tasks.get(id) || null;
    } catch (error) {
      console.error('Failed to fetch task:', error);
      throw new Error('获取任务详情失败');
    }
  }
  
  async getByMemberId(memberId: string): Promise<Task[]> {
    try {
      return await db.tasks.where('memberId').equals(memberId).toArray();
    } catch (error) {
      console.error('Failed to fetch member tasks:', error);
      throw new Error('获取成员任务失败');
    }
  }
  
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const now = Date.now();
      const task: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      
      await db.tasks.add(task);
      
      // 发布事件
      eventManager.publish({
        type: EventType.TASK_CREATED,
        timestamp: now,
        source: 'TaskService',
        data: { task },
      });
      
      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('创建任务失败');
    }
  }
  
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const existingTask = await db.tasks.get(id);
      if (!existingTask) {
        throw new Error('任务不存在');
      }
      
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: Date.now(),
      };
      
      await db.tasks.put(updatedTask);
      
      // 发布事件
      eventManager.publish({
        type: EventType.TASK_UPDATED,
        timestamp: Date.now(),
        source: 'TaskService',
        data: { 
          task: updatedTask, 
          previousTask: existingTask 
        },
      });
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw new Error('更新任务失败');
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      const task = await db.tasks.get(id);
      if (!task) {
        throw new Error('任务不存在');
      }
      
      await db.tasks.delete(id);
      
      // 发布事件
      eventManager.publish({
        type: EventType.TASK_DELETED,
        timestamp: Date.now(),
        source: 'TaskService',
        data: { task },
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw new Error('删除任务失败');
    }
  }
  
  async batchUpdate(updates: Array<{ id: string; updates: Partial<Task> }>): Promise<Task[]> {
    try {
      const updatedTasks: Task[] = [];
      
      await db.transaction('rw', db.tasks, async () => {
        for (const { id, updates: taskUpdates } of updates) {
          const updatedTask = await this.update(id, taskUpdates);
          updatedTasks.push(updatedTask);
        }
      });
      
      return updatedTasks;
    } catch (error) {
      console.error('Failed to batch update tasks:', error);
      throw new Error('批量更新任务失败');
    }
  }
  
  async search(query: string): Promise<Task[]> {
    try {
      const lowercaseQuery = query.toLowerCase();
      return await db.tasks
        .filter(task => 
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description?.toLowerCase().includes(lowercaseQuery)
        )
        .toArray();
    } catch (error) {
      console.error('Failed to search tasks:', error);
      throw new Error('搜索任务失败');
    }
  }
  
  validate(task: Partial<Task>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!task.title?.trim()) {
      errors.push('任务标题不能为空');
    }
    
    if (!task.memberId) {
      errors.push('必须指定任务成员');
    }
    
    if (task.startDate && task.endDate && task.startDate > task.endDate) {
      errors.push('开始日期不能晚于结束日期');
    }
    
    if (task.startDate && task.endDate) {
      const daysDiff = this.calculateDaysDifference(task.startDate, task.endDate);
      if (daysDiff > 30) {
        warnings.push('任务持续时间超过30天，建议拆分');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  private calculateDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const taskService = new TaskService();
```

## 样式系统

### TailwindCSS 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 状态颜色
        'status': {
          'pending': '#FFF9C4',
          'in-progress': '#BBDEFB',
          'completed': '#C8E6C9',
          'blocked': '#FFCDD2',
          'review': '#F0F4C3',
        },
        // 品牌颜色
        'brand': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### CSS 变量

```css
/* styles/variables.css */
:root {
  /* 颜色变量 */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* 状态颜色 */
  --color-status-pending: #fff9c4;
  --color-status-in-progress: #bbdefb;
  --color-status-completed: #c8e6c9;
  --color-status-blocked: #ffcdd2;
  --color-status-review: #f0f4c3;
  
  /* 间距变量 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* 字体大小 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  /* 圆角 */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* 过渡 */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
  --color-secondary: #94a3b8;
}
```

### 组件样式

```css
/* components/TaskBoard/TaskBoard.module.css */
.taskBoard {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
  @apply border border-gray-200;
  @apply transition-all duration-200;
}

.taskBoard:hover {
  @apply shadow-lg;
}

.taskBoardHeader {
  @apply bg-gray-50 border-b border-gray-200;
  @apply sticky top-0 z-10;
}

.taskBoardBody {
  @apply overflow-auto max-h-96;
}

.taskBoardFooter {
  @apply bg-gray-50 border-t border-gray-200;
  @apply sticky bottom-0 z-10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .taskBoard {
    @apply rounded-none border-l-0 border-r-0;
  }
  
  .taskBoardHeader {
    @apply text-sm;
  }
  
  .taskBoardBody {
    @apply max-h-80;
  }
}

/* 任务单元格样式 */
.taskCell {
  @apply border border-gray-200 p-2 min-h-[60px];
  @apply flex items-center justify-center text-center;
  @apply cursor-pointer transition-all duration-150;
  @apply hover:shadow-sm hover:z-10 relative;
}

.taskCell:hover {
  @apply bg-gray-50 shadow-md;
}

.taskCellEmpty {
  @apply bg-gray-25;
}

.taskCellHasTask {
  @apply text-white font-medium;
  @apply shadow-sm;
}

/* 状态颜色 */
.statusPending {
  @apply bg-yellow-100 text-yellow-800;
  background-color: var(--color-status-pending);
}

.statusInProgress {
  @apply bg-blue-100 text-blue-800;
  background-color: var(--color-status-in-progress);
}

.statusCompleted {
  @apply bg-green-100 text-green-800;
  background-color: var(--color-status-completed);
}

.statusBlocked {
  @apply bg-red-100 text-red-800;
  background-color: var(--color-status-blocked);
}

.statusReview {
  @apply bg-lime-100 text-lime-800;
  background-color: var(--color-status-review);
}

/* 跨列任务 */
.taskCellSpanned {
  @apply rounded-md;
  grid-column: span var(--col-span);
}

/* 加载状态 */
.taskBoardLoading {
  @apply flex items-center justify-center p-8;
  @apply text-gray-500;
}

.loadingSpinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600;
}

/* 错误状态 */
.taskBoardError {
  @apply flex items-center justify-center p-8;
  @apply text-red-500 bg-red-50 rounded-lg;
}

.errorIcon {
  @apply w-8 h-8 text-red-400;
}

.errorMessage {
  @apply ml-3 text-sm font-medium;
}

/* 动画效果 */
.fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.slideUp {
  animation: slideUp 0.3s ease-out;
}

/* 可访问性 */
.taskCell:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}

.taskCell:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
```

## 测试指南

### 单元测试

```typescript
// utils/dateUtils.test.ts
import { dateUtils } from '../dateUtils';

describe('dateUtils', () => {
  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15');
      expect(dateUtils.format(date, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(dateUtils.format(date, 'MM/DD/YYYY')).toBe('01/15/2024');
    });
  });
  
  describe('getDateRange', () => {
    it('应该生成正确的日期范围', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-03');
      const range = dateUtils.getDateRange(start, end);
      
      expect(range).toHaveLength(3);
      expect(range[0]).toEqual(new Date('2024-01-01'));
      expect(range[2]).toEqual(new Date('2024-01-03'));
    });
  });
});
```

### 集成测试

```typescript
// integration/taskBoard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { TaskBoard } from '@/components/TaskBoard';
import { createMockStore } from '@/test-utils/mockStore';

describe('TaskBoard Integration', () => {
  it('应该完成完整的任务创建流程', async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <TaskBoard
          tasks={[]}
          members={mockMembers}
          config={mockConfig}
          callbacks={{
            onTaskCreate: jest.fn(),
          }}
        />
      </Provider>
    );
    
    // 点击添加任务按钮
    const addButton = screen.getByRole('button', { name: /添加任务/i });
    await user.click(addButton);
    
    // 填写任务表单
    const titleInput = screen.getByLabelText(/任务标题/i);
    await user.type(titleInput, '新功能开发');
    
    const memberSelect = screen.getByLabelText(/分配给/i);
    await user.selectOptions(memberSelect, 'member-1');
    
    // 提交表单
    const submitButton = screen.getByRole('button', { name: /保存/i });
    await user.click(submitButton);
    
    // 验证任务已创建
    await waitFor(() => {
      expect(screen.getByText('新功能开发')).toBeInTheDocument();
    });
  });
});
```

### E2E 测试

```typescript
// e2e/taskBoard.cy.ts
describe('TaskBoard E2E', () => {
  beforeEach(() => {
    cy.visit('/task-board');
    cy.waitForPageLoad();
  });
  
  it('应该能够创建和编辑任务', () => {
    // 创建任务
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('E2E测试任务');
    cy.get('[data-testid="member-select"]').select('张三');
    cy.get('[data-testid="start-date-input"]').type('2024-01-15');
    cy.get('[data-testid="end-date-input"]').type('2024-01-20');
    cy.get('[data-testid="save-task-button"]').click();
    
    // 验证任务显示
    cy.contains('E2E测试任务').should('be.visible');
    
    // 编辑任务
    cy.contains('E2E测试任务').click();
    cy.get('[data-testid="edit-task-button"]').click();
    cy.get('[data-testid="task-title-input"]')
      .clear()
      .type('E2E测试任务-已编辑');
    cy.get('[data-testid="save-task-button"]').click();
    
    // 验证编辑结果
    cy.contains('E2E测试任务-已编辑').should('be.visible');
  });
  
  it('应该正确处理跨日任务', () => {
    // 创建跨日任务
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type('跨日任务测试');
    cy.get('[data-testid="start-date-input"]').type('2024-01-15');
    cy.get('[data-testid="end-date-input"]').type('2024-01-18');
    cy.get('[data-testid="save-task-button"]').click();
    
    // 验证跨列显示
    cy.get('[data-testid="task-cell"]')
      .contains('跨日任务测试')
      .should('have.css', 'grid-column')
      .and('contain', 'span 4');
  });
});
```

## 性能优化

### 组件优化

```typescript
// 使用 React.memo 优化组件
const TaskCell = React.memo<TaskCellProps>(({ task, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.(task);
  }, [task, onClick]);
  
  return (
    <div 
      className="task-cell"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {task?.title}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.task?.id === nextProps.task?.id &&
    prevProps.task?.status === nextProps.task?.status &&
    prevProps.task?.title === nextProps.task?.title
  );
});

// 使用 useMemo 优化计算
const TaskBoard = ({ tasks, members, config }) => {
  const processedTasks = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      isOverdue: new Date(task.endDate) < new Date(),
      duration: calculateDuration(task.startDate, task.endDate),
    }));
  }, [tasks]);
  
  const memberTaskMap = useMemo(() => {
    return members.reduce((map, member) => {
      map[member.id] = processedTasks.filter(
        task => task.memberId === member.id
      );
      return map;
    }, {} as Record<string, Task[]>);
  }, [members, processedTasks]);
  
  return (
    <div className="task-board">
      {/* 渲染内容 */}
    </div>
  );
};
```

### 虚拟滚动

```typescript
// components/VirtualTaskBoard.tsx
import { FixedSizeGrid } from 'react-window';
import { useMemo } from 'react';

interface VirtualTaskBoardProps {
  tasks: Task[];
  members: Member[];
  columnWidth: number;
  rowHeight: number;
  width: number;
  height: number;
}

export const VirtualTaskBoard: React.FC<VirtualTaskBoardProps> = ({
  tasks,
  members,
  columnWidth,
  rowHeight,
  width,
  height,
}) => {
  const { columnCount, rowCount, cellRenderer } = useMemo(() => {
    const dateRange = generateDateRange(config.startDate, config.endDate);
    const columns = dateRange.length + 1; // +1 for member column
    const rows = members.length + 1; // +1 for header row
    
    return {
      columnCount: columns,
      rowCount: rows,
      cellRenderer: ({ columnIndex, rowIndex, style }) => {
        if (rowIndex === 0 && columnIndex === 0) {
          return <div style={style}>成员</div>;
        }
        
        if (rowIndex === 0) {
          const date = dateRange[columnIndex - 1];
          return (
            <div style={style} className="date-header">
              {formatDate(date, 'MM/DD')}
            </div>
          );
        }
        
        if (columnIndex === 0) {
          const member = members[rowIndex - 1];
          return (
            <div style={style} className="member-cell">
              {member.name}
            </div>
          );
        }
        
        const member = members[rowIndex - 1];
        const date = dateRange[columnIndex - 1];
        const task = findTaskForDate(tasks, member.id, date);
        
        return (
          <div style={style} className="task-cell">
            {task?.title}
          </div>
        );
      },
    };
  }, [tasks, members, config]);
  
  return (
    <FixedSizeGrid
      columnCount={columnCount}
      rowCount={rowCount}
      columnWidth={columnWidth}
      rowHeight={rowHeight}
      width={width}
      height={height}
    >
      {cellRenderer}
    </FixedSizeGrid>
  );
};
```

### 懒加载

```typescript
// 路由级别的懒加载
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const TaskBoardPage = lazy(() => import('@/pages/TaskBoardPage'));
const TeamManagement = lazy(() => import('@/pages/TeamManagement'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/task-board" element={<TaskBoardPage />} />
        <Route path="/team" element={<TeamManagement />} />
      </Routes>
    </Suspense>
  );
}

// 组件级别的懒加载
const TaskTooltip = lazy(() => import('./TaskTooltip'));
const TaskEditor = lazy(() => import('./TaskEditor'));

function TaskCell({ task }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div
      className="task-cell"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {task.title}
      
      {showTooltip && (
        <Suspense fallback={<div>Loading...</div>}>
          <TaskTooltip task={task} />
        </Suspense>
      )}
    </div>
  );
}
```

## 扩展开发

### 插件系统

```typescript
// plugins/types.ts
interface TaskBoardPlugin {
  name: string;
  version: string;
  
  // 生命周期钩子
  onInit?: (context: PluginContext) => void;
  onTaskRender?: (task: Task, element: HTMLElement) => void;
  onTaskClick?: (task: Task, event: Event) => void;
  onBoardRender?: (board: HTMLElement) => void;
  
  // 配置选项
  config?: PluginConfig;
  
  // 清理函数
  onDestroy?: () => void;
}

interface PluginContext {
  getTasks: () => Task[];
  getMembers: () => Member[];
  updateTask: (id: string, updates: Partial<Task>) => void;
  addEventListener: (event: string, handler: Function) => void;
  removeEventListener: (event: string, handler: Function) => void;
}

// 插件管理器
class PluginManager {
  private plugins: Map<string, TaskBoardPlugin> = new Map();
  
  register(plugin: TaskBoardPlugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
  }
  
  unregister(pluginName: string) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.onDestroy?.();
      this.plugins.delete(pluginName);
    }
  }
  
  getPlugins(): TaskBoardPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();
```

### 自定义主题

```typescript
// themes/customTheme.ts
import { Theme } from '@/types/theme';

export const customTheme: Theme = {
  name: 'custom',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    
    // 状态颜色
    status: {
      pending: '#fef3c7',
      'in-progress': '#dbeafe',
      completed: '#d1fae5',
      blocked: '#fee2e2',
      review: '#e0e7ff',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};
```

## 部署指南

### 构建配置

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['antd', '@radix-ui/react-dialog'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD 流水线

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Deploy to production
        run: |
          # 部署脚本
          echo "Deploying to production server..."
```

## 代码规范

### TypeScript 规范

```typescript
// 1. 使用严格的类型定义
interface User {
  readonly id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// 2. 使用联合类型而不是 any
type Status = 'pending' | 'in-progress' | 'completed' | 'blocked';

// 3. 使用泛型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url).then(response => response.json());
}

// 4. 使用条件类型
type TaskStatus = 'pending' | 'in-progress' | 'completed';

type TaskWithStatus<S extends TaskStatus> = S extends 'completed' 
  ? Task & { completedAt: Date }
  : Task;

// 5. 使用工具类型
type PartialTask = Partial<Task>;
type RequiredTaskFields = Pick<Task, 'id' | 'title' | 'memberId'>;
type TaskWithoutTimestamps = Omit<Task, 'createdAt' | 'updatedAt'>;
```

### React 规范

```typescript
// 1. 使用函数式组件和Hooks
const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleUpdate = useCallback((updates: Partial<Task>) => {
    onUpdate(task.id, updates);
    setIsEditing(false);
  }, [task.id, onUpdate]);
  
  return (
    <div className="task-item">
      {isEditing ? (
        <TaskEditForm 
          task={task} 
          onSave={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <TaskView 
          task={task} 
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

// 2. 使用自定义Hooks封装逻辑
const useTaskManager = (memberId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getByMemberId(memberId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [memberId]);
  
  const createTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
    const newTask = await taskService.create(taskData);
    setTasks(prev => [...prev, newTask]);
  }, []);
  
  return { tasks, loading, loadTasks, createTask };
};

// 3. 使用错误边界
class TaskErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Task component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}
```

### 样式规范

```css
/* 1. 使用CSS变量 */
.component {
  /* 颜色 */
  color: var(--text-primary);
  background-color: var(--background-primary);
  
  /* 间距 */
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  /* 字体 */
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  
  /* 圆角 */
  border-radius: var(--radius-md);
  
  /* 阴影 */
  box-shadow: var(--shadow-sm);
  
  /* 过渡 */
  transition: all var(--transition-normal);
}

/* 2. 使用BEM命名规范 */
.task-board {}
.task-board__header {}
.task-board__body {}
.task-board__footer {}

.task-board--loading {}
.task-board--error {}

.task-cell {}
.task-cell--empty {}
.task-cell--has-task {}
.task-cell__content {}
.task-cell__status {}

/* 3. 响应式设计 */
.component {
  /* 移动端优先 */
  padding: var(--spacing-sm);
  
  @media (min-width: 768px) {
    padding: var(--spacing-md);
  }
  
  @media (min-width: 1024px) {
    padding: var(--spacing-lg);
  }
}

/* 4. 可访问性 */
.button {
  /* 确保焦点可见 */
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 5. 性能优化 */
.optimized-component {
  /* 避免重排重绘 */
  will-change: transform;
  
  /* 硬件加速 */
  transform: translateZ(0);
  
  /* 包含布局 */
  contain: layout style paint;
}
```

---

本开发者指南涵盖了项目管理平台的主要开发方面。如需了解更多技术细节，请参考源代码注释或联系开发团队。