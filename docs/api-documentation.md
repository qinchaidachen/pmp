# API文档 (API Documentation)

本文档详细说明了项目管理平台的API接口、数据结构和集成方式。

## 📑 目录

- [概述](#概述)
- [数据类型定义](#数据类型定义)
- [核心组件API](#核心组件api)
- [服务层API](#服务层api)
- [状态管理API](#状态管理api)
- [工具函数API](#工具函数api)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 概述

项目管理平台采用前端驱动的架构，数据主要通过以下方式管理：

- **本地存储**：使用IndexedDB (Dexie) 进行本地数据持久化
- **状态管理**：使用Redux Toolkit进行全局状态管理
- **组件状态**：使用React Hooks进行局部状态管理

### API设计原则

- **类型安全**：所有API都基于TypeScript类型定义
- **一致性**：统一的接口设计和错误处理
- **可扩展性**：支持插件系统和自定义扩展
- **性能优化**：内置缓存和性能监控

## 数据类型定义

### 基础类型

```typescript
// 基础ID类型
type ID = string;

// 时间类型
type DateString = string; // ISO 8601格式
type Timestamp = number; // Unix时间戳

// 状态枚举
enum TaskStatus {
  PENDING = 'pending',      // 待开始
  IN_PROGRESS = 'inProgress', // 进行中
  COMPLETED = 'completed',  // 已完成
  BLOCKED = 'blocked',      // 阻塞
  REVIEW = 'review'         // 评审中
}

enum MemberStatus {
  ACTIVE = 'active',        // 在职
  INACTIVE = 'inactive',    // 离职
  ON_LEAVE = 'onLeave',     // 休假
  LOANED = 'loaned'         // 借调
}

enum ResourceStatus {
  AVAILABLE = 'available',  // 可用
  BOOKED = 'booked',        // 已预订
  MAINTENANCE = 'maintenance' // 维护中
}
```

### 核心数据模型

#### Task 任务模型

```typescript
interface Task {
  /** 任务唯一标识 */
  id: ID;
  
  /** 任务标题 */
  title: string;
  
  /** 任务描述 */
  description?: string;
  
  /** 所属成员ID */
  memberId: ID;
  
  /** 任务开始日期 */
  startDate: DateString;
  
  /** 任务结束日期 */
  endDate: DateString;
  
  /** 任务状态 */
  status: TaskStatus;
  
  /** 自定义颜色（可选） */
  color?: string;
  
  /** 任务优先级 */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  /** 任务标签 */
  tags?: string[];
  
  /** 任务依赖 */
  dependencies?: ID[];
  
  /** 完成百分比 */
  progress?: number; // 0-100
  
  /** 任务创建时间 */
  createdAt: Timestamp;
  
  /** 任务更新时间 */
  updatedAt: Timestamp;
  
  /** 创建者ID */
  createdBy: ID;
  
  /** 任务元数据 */
  metadata?: Record<string, any>;
}
```

#### Member 成员模型

```typescript
interface Member {
  /** 成员唯一标识 */
  id: ID;
  
  /** 成员姓名 */
  name: string;
  
  /** 邮箱地址 */
  email: string;
  
  /** 角色/岗位 */
  role: string;
  
  /** 所属部门 */
  department?: string;
  
  /** 头像URL */
  avatar?: string;
  
  /** 成员状态 */
  status: MemberStatus;
  
  /** 入职日期 */
  joinDate: DateString;
  
  /** 技能标签 */
  skills?: string[];
  
  /** 工作量配置 */
  workload?: {
    /** 最大并发任务数 */
    maxConcurrentTasks: number;
    /** 每日工作小时数 */
    dailyHours: number;
  };
  
  /** 创建时间 */
  createdAt: Timestamp;
  
  /** 更新时间 */
  updatedAt: Timestamp;
}
```

#### Resource 资源模型

```typescript
interface Resource {
  /** 资源唯一标识 */
  id: ID;
  
  /** 资源名称 */
  name: string;
  
  /** 资源类型 */
  type: 'room' | 'equipment' | 'vehicle' | 'other';
  
  /** 资源描述 */
  description?: string;
  
  /** 资源状态 */
  status: ResourceStatus;
  
  /** 容量信息 */
  capacity?: {
    /** 最大人数 */
    maxPersons?: number;
    /** 面积（平方米） */
    area?: number;
  };
  
  /** 位置信息 */
  location?: {
    /** 建筑 */
    building?: string;
    /** 楼层 */
    floor?: string;
    /** 房间号 */
    room?: string;
  };
  
  /** 设备清单 */
  equipment?: string[];
  
  /** 可用时间段 */
  availableHours?: {
    /** 开始时间 */
    start: string; // HH:mm格式
    /** 结束时间 */
    end: string;
  }[];
  
  /** 创建时间 */
  createdAt: Timestamp;
  
  /** 更新时间 */
  updatedAt: Timestamp;
}
```

#### Booking 预订模型

```typescript
interface Booking {
  /** 预订唯一标识 */
  id: ID;
  
  /** 资源ID */
  resourceId: ID;
  
  /** 预订者ID */
  bookedBy: ID;
  
  /** 预订标题 */
  title: string;
  
  /** 预订描述 */
  description?: string;
  
  /** 开始时间 */
  startTime: DateString;
  
  /** 结束时间 */
  endTime: DateString;
  
  /** 参与人员 */
  participants?: ID[];
  
  /** 预订状态 */
  status: 'confirmed' | 'pending' | 'cancelled';
  
  /** 创建时间 */
  createdAt: Timestamp;
  
  /** 更新时间 */
  updatedAt: Timestamp;
}
```

### 配置类型

#### BoardConfig 看板配置

```typescript
interface BoardConfig {
  /** 开始日期 */
  startDate: DateString;
  
  /** 结束日期 */
  endDate: DateString;
  
  /** 每周起始日（0=周日, 1=周一） */
  weekStartDay?: 0 | 1;
  
  /** 是否启用编辑模式 */
  editable?: boolean;
  
  /** 是否显示周末 */
  showWeekends?: boolean;
  
  /** 颜色主题 */
  colorScheme?: ColorScheme;
  
  /** 视图配置 */
  viewConfig?: {
    /** 列宽 */
    columnWidth?: number;
    /** 行高 */
    rowHeight?: number;
    /** 缩放比例 */
    zoom?: number;
  };
}
```

#### ColorScheme 颜色方案

```typescript
interface ColorScheme {
  /** 待开始状态颜色 */
  pending: string;
  
  /** 进行中状态颜色 */
  inProgress: string;
  
  /** 已完成状态颜色 */
  completed: string;
  
  /** 阻塞状态颜色 */
  blocked: string;
  
  /** 评审中状态颜色 */
  review: string;
}

// 默认颜色方案
const DEFAULT_COLOR_SCHEME: ColorScheme = {
  pending: '#FFF9C4',
  inProgress: '#BBDEFB',
  completed: '#C8E6C9',
  blocked: '#FFCDD2',
  review: '#F0F4C3',
};
```

## 核心组件API

### TaskBoard 组件

任务看板的核心组件，提供完整的功能接口。

```typescript
interface TaskBoardProps {
  /** 看板配置 */
  config: BoardConfig;
  
  /** 任务数据 */
  tasks: Task[];
  
  /** 成员数据 */
  members: Member[];
  
  /** 事件回调 */
  callbacks?: {
    /** 任务点击回调 */
    onTaskClick?: (task: Task, event: MouseEvent) => void;
    
    /** 任务更新回调 */
    onTaskUpdate?: (task: Task) => void;
    
    /** 单元格点击回调 */
    onCellClick?: (member: Member, date: Date) => void;
    
    /** 任务创建回调 */
    onTaskCreate?: (data: Partial<Task>) => void;
    
    /** 任务删除回调 */
    onTaskDelete?: (taskId: ID) => void;
  };
  
  /** 样式类名 */
  className?: string;
  
  /** 自定义样式 */
  style?: React.CSSProperties;
  
  /** 是否显示加载状态 */
  loading?: boolean;
  
  /** 错误信息 */
  error?: string;
}

/**
 * TaskBoard 组件
 */
declare const TaskBoard: React.FC<TaskBoardProps>;
```

### 组件方法

```typescript
interface TaskBoardRef {
  /** 刷新看板数据 */
  refresh: () => void;
  
  /** 导出数据 */
  export: (format: 'csv' | 'json' | 'excel') => void;
  
  /** 打印看板 */
  print: () => void;
  
  /** 缩放到指定比例 */
  zoomTo: (scale: number) => void;
  
  /** 滚动到指定位置 */
  scrollTo: (x: number, y: number) => void;
  
  /** 获取当前视图配置 */
  getViewConfig: () => BoardConfig;
  
  /** 设置视图配置 */
  setViewConfig: (config: Partial<BoardConfig>) => void;
}
```

### 使用示例

```typescript
import { TaskBoard } from '@/components/TaskBoard';

function MyComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const config: BoardConfig = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    weekStartDay: 1,
    editable: true,
    showWeekends: false,
  };
  
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
  };
  
  const handleTaskUpdate = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };
  
  return (
    <TaskBoard
      config={config}
      tasks={tasks}
      members={members}
      callbacks={{
        onTaskClick: handleTaskClick,
        onTaskUpdate: handleTaskUpdate,
      }}
    />
  );
}
```

## 服务层API

服务层提供数据访问和业务逻辑处理。

### TaskService 任务服务

```typescript
interface TaskService {
  /** 获取所有任务 */
  getAll(): Promise<Task[]>;
  
  /** 根据ID获取任务 */
  getById(id: ID): Promise<Task | null>;
  
  /** 根据成员ID获取任务 */
  getByMemberId(memberId: ID): Promise<Task[]>;
  
  /** 根据日期范围获取任务 */
  getByDateRange(startDate: DateString, endDate: DateString): Promise<Task[]>;
  
  /** 创建任务 */
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  
  /** 更新任务 */
  update(id: ID, updates: Partial<Task>): Promise<Task>;
  
  /** 删除任务 */
  delete(id: ID): Promise<void>;
  
  /** 批量更新任务 */
  batchUpdate(updates: Array<{ id: ID; updates: Partial<Task> }>): Promise<Task[]>;
  
  /** 搜索任务 */
  search(query: string): Promise<Task[]>;
  
  /** 验证任务数据 */
  validate(task: Partial<Task>): ValidationResult;
}

/**
 * 任务服务实例
 */
declare const taskService: TaskService;
```

### MemberService 成员服务

```typescript
interface MemberService {
  /** 获取所有成员 */
  getAll(): Promise<Member[]>;
  
  /** 根据ID获取成员 */
  getById(id: ID): Promise<Member | null>;
  
  /** 根据状态获取成员 */
  getByStatus(status: MemberStatus): Promise<Member[]>;
  
  /** 创建成员 */
  create(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member>;
  
  /** 更新成员 */
  update(id: ID, updates: Partial<Member>): Promise<Member>;
  
  /** 删除成员 */
  delete(id: ID): Promise<void>;
  
  /** 获取成员工作量统计 */
  getWorkloadStats(memberId: ID, dateRange: [DateString, DateString]): Promise<WorkloadStats>;
}

/**
 * 成员服务实例
 */
declare const memberService: MemberService;
```

### ResourceService 资源服务

```typescript
interface ResourceService {
  /** 获取所有资源 */
  getAll(): Promise<Resource[]>;
  
  /** 根据ID获取资源 */
  getById(id: ID): Promise<Resource | null>;
  
  /** 根据类型获取资源 */
  getByType(type: Resource['type']): Promise<Resource[]>;
  
  /** 获取可用资源 */
  getAvailable(startTime: DateString, endTime: DateString): Promise<Resource[]>;
  
  /** 创建资源 */
  create(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource>;
  
  /** 更新资源 */
  update(id: ID, updates: Partial<Resource>): Promise<Resource>;
  
  /** 删除资源 */
  delete(id: ID): Promise<void>;
  
  /** 预订资源 */
  book(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  
  /** 取消预订 */
  cancelBooking(bookingId: ID): Promise<void>;
  
  /** 获取资源预订 */
  getBookings(resourceId: ID, dateRange: [DateString, DateString]): Promise<Booking[]>;
}

/**
 * 资源服务实例
 */
declare const resourceService: ResourceService;
```

### 使用示例

```typescript
import { taskService, memberService, resourceService } from '@/services';

// 创建任务
const newTask = await taskService.create({
  title: '新功能开发',
  description: '开发用户管理功能',
  memberId: 'member-123',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  status: TaskStatus.PENDING,
  createdBy: 'user-456',
});

// 获取成员的任务
const memberTasks = await taskService.getByMemberId('member-123');

// 预订会议室
const booking = await resourceService.book({
  resourceId: 'room-789',
  bookedBy: 'user-456',
  title: '项目评审会议',
  startTime: '2024-01-25T10:00:00Z',
  endTime: '2024-01-25T12:00:00Z',
});
```

## 状态管理API

使用Redux Toolkit进行全局状态管理。

### Store配置

```typescript
interface RootState {
  tasks: TasksState;
  members: MembersState;
  resources: ResourcesState;
  ui: UIState;
  error: ErrorState;
}

interface TasksState {
  /** 任务列表 */
  items: Task[];
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | null;
  
  /** 当前选中的任务 */
  selectedTaskId: ID | null;
  
  /** 筛选条件 */
  filters: TaskFilters;
  
  /** 排序规则 */
  sortBy: keyof Task;
  sortOrder: 'asc' | 'desc';
}

interface MembersState {
  /** 成员列表 */
  items: Member[];
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | null;
  
  /** 当前选中的成员 */
  selectedMemberId: ID | null;
}

interface ResourcesState {
  /** 资源列表 */
  items: Resource[];
  
  /** 预订列表 */
  bookings: Booking[];
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | null;
}

interface UIState {
  /** 当前主题 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 语言设置 */
  locale: string;
  
  /** 看板配置 */
  boardConfig: BoardConfig;
  
  /** 侧边栏状态 */
  sidebarCollapsed: boolean;
  
  /** 加载状态 */
  globalLoading: boolean;
}

interface ErrorState {
  /** 错误列表 */
  errors: Array<{
    id: string;
    message: string;
    timestamp: number;
    stack?: string;
  }>;
  
  /** 是否显示错误边界 */
  showErrorBoundary: boolean;
}
```

### Action Creators

```typescript
// Task Actions
interface TaskActions {
  /** 设置任务列表 */
  setTasks: (tasks: Task[]) => PayloadAction<Task[]>;
  
  /** 添加任务 */
  addTask: (task: Task) => PayloadAction<Task>;
  
  /** 更新任务 */
  updateTask: (id: ID, updates: Partial<Task>) => PayloadAction<{ id: ID; updates: Partial<Task> }>;
  
  /** 删除任务 */
  deleteTask: (id: ID) => PayloadAction<ID>;
  
  /** 设置选中任务 */
  setSelectedTask: (id: ID | null) => PayloadAction<ID | null>;
  
  /** 设置筛选条件 */
  setFilters: (filters: TaskFilters) => PayloadAction<TaskFilters>;
  
  /** 设置排序规则 */
  setSorting: (sortBy: keyof Task, sortOrder: 'asc' | 'desc') => PayloadAction<{ sortBy: keyof Task; sortOrder: 'asc' | 'desc' }>;
  
  /** 设置加载状态 */
  setLoading: (loading: boolean) => PayloadAction<boolean>;
  
  /** 设置错误信息 */
  setError: (error: string | null) => PayloadAction<string | null>;
}

// Member Actions
interface MemberActions {
  setMembers: (members: Member[]) => PayloadAction<Member[]>;
  addMember: (member: Member) => PayloadAction<Member>;
  updateMember: (id: ID, updates: Partial<Member>) => PayloadAction<{ id: ID; updates: Partial<Member> }>;
  deleteMember: (id: ID) => PayloadAction<ID>;
  setSelectedMember: (id: ID | null) => PayloadAction<ID | null>;
  setLoading: (loading: boolean) => PayloadAction<boolean>;
  setError: (error: string | null) => PayloadAction<string | null>;
}
```

### Selectors

```typescript
// Task Selectors
interface TaskSelectors {
  /** 获取所有任务 */
  selectAllTasks: (state: RootState) => Task[];
  
  /** 根据ID获取任务 */
  selectTaskById: (state: RootState, id: ID) => Task | undefined;
  
  /** 获取选中任务 */
  selectSelectedTask: (state: RootState) => Task | undefined;
  
  /** 获取过滤后的任务 */
  selectFilteredTasks: (state: RootState) => Task[];
  
  /** 获取成员的任务 */
  selectTasksByMember: (state: RootState, memberId: ID) => Task[];
  
  /** 获取任务统计 */
  selectTaskStats: (state: RootState) => TaskStats;
  
  /** 获取任务加载状态 */
  selectTasksLoading: (state: RootState) => boolean;
  
  /**获取任务错误信息 */
  selectTasksError: (state: RootState) => string | null;
}

// Member Selectors
interface MemberSelectors {
  selectAllMembers: (state: RootState) => Member[];
  selectMemberById: (state: RootState, id: ID) => Member | undefined;
  selectSelectedMember: (state: RootState) => Member | undefined;
  selectActiveMembers: (state: RootState) => Member[];
  selectMembersByDepartment: (state: RootState, department: string) => Member[];
  selectMembersLoading: (state: RootState) => boolean;
  selectMembersError: (state: RootState) => string | null;
}
```

### 使用示例

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { taskActions, taskSelectors } from '@/stores/slices/tasksSlice';
import { memberActions, memberSelectors } from '@/stores/slices/membersSlice';

function TaskBoardContainer() {
  const dispatch = useDispatch();
  
  // 选择器使用
  const tasks = useSelector(taskSelectors.selectAllTasks);
  const selectedTask = useSelector(taskSelectors.selectSelectedTask);
  const loading = useSelector(taskSelectors.selectTasksLoading);
  const error = useSelector(taskSelectors.selectTasksError);
  
  const members = useSelector(memberSelectors.selectActiveMembers);
  
  // Action使用
  const handleTaskUpdate = (id: ID, updates: Partial<Task>) => {
    dispatch(taskActions.updateTask(id, updates));
  };
  
  const handleTaskSelect = (id: ID | null) => {
    dispatch(taskActions.setSelectedTask(id));
  };
  
  const handleLoadTasks = () => {
    dispatch(taskActions.setLoading(true));
    // 异步加载任务数据
    loadTasks().then(tasks => {
      dispatch(taskActions.setTasks(tasks));
      dispatch(taskActions.setLoading(false));
    }).catch(error => {
      dispatch(taskActions.setError(error.message));
      dispatch(taskActions.setLoading(false));
    });
  };
  
  return (
    <TaskBoard
      tasks={tasks}
      members={members}
      loading={loading}
      error={error}
      onTaskUpdate={handleTaskUpdate}
      onTaskSelect={handleTaskSelect}
    />
  );
}
```

## 工具函数API

### 数据验证

```typescript
interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  
  /** 错误信息列表 */
  errors: string[];
  
  /** 警告信息列表 */
  warnings: string[];
}

interface Validator {
  /** 验证任务数据 */
  validateTask: (task: Partial<Task>) => ValidationResult;
  
  /** 验证成员数据 */
  validateMember: (member: Partial<Member>) => ValidationResult;
  
  /** 验证资源数据 */
  validateResource: (resource: Partial<Resource>) => ValidationResult;
  
  /** 验证预订数据 */
  validateBooking: (booking: Partial<Booking>) => ValidationResult;
  
  /** 验证日期范围 */
  validateDateRange: (startDate: DateString, endDate: DateString) => ValidationResult;
}

/**
 * 验证器实例
 */
declare const validator: Validator;
```

### 日期处理

```typescript
interface DateUtils {
  /** 格式化日期 */
  format: (date: Date | DateString, format: string) => string;
  
  /** 解析日期字符串 */
  parse: (dateString: DateString) => Date;
  
  /** 获取日期范围 */
  getDateRange: (startDate: Date, endDate: Date) => Date[];
  
  /** 按周分组日期 */
  groupByWeek: (dates: Date[], weekStartDay?: 0 | 1) => WeekGroup[];
  
  /** 计算两个日期之间的天数 */
  daysBetween: (startDate: Date, endDate: Date) => number;
  
  /** 检查是否为工作日 */
  isWorkingDay: (date: Date, excludeWeekends?: boolean) => boolean;
  
  /** 获取周的开始和结束日期 */
  getWeekBounds: (date: Date, weekStartDay?: 0 | 1) => { start: Date; end: Date };
}

/**
 * 日期工具实例
 */
declare const dateUtils: DateUtils;
```

### 颜色工具

```typescript
interface ColorUtils {
  /** 获取状态对应的颜色 */
  getStatusColor: (status: TaskStatus, colorScheme?: ColorScheme) => string;
  
  /** 计算文本对比色 */
  getContrastColor: (backgroundColor: string) => string;
  
  /** 验证颜色值 */
  isValidColor: (color: string) => boolean;
  
  /** 转换颜色格式 */
  convertColor: (color: string, format: 'hex' | 'rgb' | 'hsl') => string;
  
  /** 生成随机颜色 */
  generateRandomColor: () => string;
  
  /** 调整颜色亮度 */
  adjustBrightness: (color: string, amount: number) => string;
}

/**
 * 颜色工具实例
 */
declare const colorUtils: ColorUtils;
```

### 数据导入导出

```typescript
interface DataUtils {
  /** 导出CSV */
  exportToCSV: (data: any[], filename: string) => void;
  
  /** 导出JSON */
  exportToJSON: (data: any[], filename: string) => void;
  
  /** 解析CSV */
  parseCSV: (csvString: string) => Promise<any[]>;
  
  /** 解析JSON */
  parseJSON: (jsonString: string) => Promise<any[]>;
  
  /** 数据转换 */
  transformData: (data: any[], transformer: (item: any) => any) => any[];
  
  /** 数据清洗 */
  cleanData: (data: any[], rules: CleaningRules) => any[];
}

/**
 * 数据工具实例
 */
declare const dataUtils: DataUtils;
```

### 使用示例

```typescript
import { validator, dateUtils, colorUtils, dataUtils } from '@/utils';

// 验证任务数据
const validation = validator.validateTask({
  title: '新功能开发',
  memberId: 'member-123',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// 日期处理
const dates = dateUtils.getDateRange(
  dateUtils.parse('2024-01-01'),
  dateUtils.parse('2024-01-31')
);

const weekGroups = dateUtils.groupByWeek(dates, 1); // 周一开始

// 颜色处理
const statusColor = colorUtils.getStatusColor(TaskStatus.IN_PROGRESS);
const textColor = colorUtils.getContrastColor(statusColor);

// 数据导出
const tasks = await taskService.getAll();
dataUtils.exportToCSV(tasks, 'tasks.csv');
```

## 事件系统

### 事件类型

```typescript
enum EventType {
  // 任务相关事件
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_STATUS_CHANGED = 'task:status-changed',
  
  // 成员相关事件
  MEMBER_CREATED = 'member:created',
  MEMBER_UPDATED = 'member:updated',
  MEMBER_DELETED = 'member:deleted',
  
  // 资源相关事件
  RESOURCE_BOOKED = 'resource:booked',
  RESOURCE_CANCELLED = 'resource:cancelled',
  
  // UI相关事件
  VIEW_CHANGED = 'view:changed',
  THEME_CHANGED = 'theme:changed',
  
  // 系统事件
  ERROR_OCCURRED = 'error:occurred',
  DATA_LOADED = 'data:loaded',
}
```

### 事件接口

```typescript
interface BaseEvent {
  /** 事件类型 */
  type: EventType;
  
  /** 事件时间戳 */
  timestamp: number;
  
  /** 事件源 */
  source: string;
  
  /** 事件数据 */
  data?: any;
}

interface TaskEvent extends BaseEvent {
  type: EventType.TASK_CREATED | EventType.TASK_UPDATED | EventType.TASK_DELETED | EventType.TASK_STATUS_CHANGED;
  data: {
    task: Task;
    previousTask?: Task;
  };
}

interface MemberEvent extends BaseEvent {
  type: EventType.MEMBER_CREATED | EventType.MEMBER_UPDATED | EventType.MEMBER_DELETED;
  data: {
    member: Member;
    previousMember?: Member;
  };
}

interface ResourceEvent extends BaseEvent {
  type: EventType.RESOURCE_BOOKED | EventType.RESOURCE_CANCELLED;
  data: {
    booking: Booking;
    resource: Resource;
  };
}
```

### 事件管理器

```typescript
interface EventManager {
  /** 订阅事件 */
  subscribe: <T extends BaseEvent>(
    eventType: EventType,
    handler: (event: T) => void
  ) => () => void;
  
  /** 发布事件 */
  publish: <T extends BaseEvent>(event: T) => void;
  
  /** 取消所有订阅 */
  unsubscribeAll: () => void;
  
  /** 获取事件历史 */
  getEventHistory: (eventType?: EventType) => BaseEvent[];
  
  /** 清空事件历史 */
  clearHistory: () => void;
}

/**
 * 事件管理器实例
 */
declare const eventManager: EventManager;
```

### 使用示例

```typescript
import { eventManager, EventType } from '@/events';

// 订阅任务创建事件
const unsubscribe = eventManager.subscribe<EventType.TASK_CREATED>(
  EventType.TASK_CREATED,
  (event) => {
    console.log('Task created:', event.data.task);
    // 更新UI或发送通知
  }
);

// 发布任务创建事件
eventManager.publish({
  type: EventType.TASK_CREATED,
  timestamp: Date.now(),
  source: 'TaskBoard',
  data: {
    task: newTask,
  },
});

// 取消订阅
unsubscribe();
```

## 错误处理

### 错误类型

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation',
  NETWORK_ERROR = 'network',
  DATABASE_ERROR = 'database',
  PERMISSION_ERROR = 'permission',
  SYSTEM_ERROR = 'system',
}

interface AppError {
  /** 错误类型 */
  type: ErrorType;
  
  /** 错误代码 */
  code: string;
  
  /** 错误消息 */
  message: string;
  
  /** 详细描述 */
  details?: string;
  
  /** 错误堆栈 */
  stack?: string;
  
  /** 发生时间 */
  timestamp: number;
  
  /** 上下文信息 */
  context?: Record<string, any>;
}
```

### 错误处理器

```typescript
interface ErrorHandler {
  /** 处理错误 */
  handle: (error: Error | AppError) => void;
  
  /** 记录错误 */
  log: (error: AppError) => void;
  
  /** 显示错误消息 */
  showMessage: (error: AppError) => void;
  
  /** 重试操作 */
  retry: (operation: () => Promise<any>, maxRetries?: number) => Promise<any>;
  
  /** 获取错误统计 */
  getErrorStats: () => ErrorStats;
}

/**
 * 错误处理器实例
 */
declare const errorHandler: ErrorHandler;
```

### 错误边界

```typescript
interface ErrorBoundaryProps {
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** 回退组件 */
  fallback?: React.ComponentType<{ error: Error }>;
  
  /** 是否显示错误详情 */
  showDetails?: boolean;
  
  /** 是否重置错误状态 */
  resetOnPropsChange?: boolean;
}

/**
 * 错误边界组件
 */
declare const ErrorBoundary: React.ComponentClass<ErrorBoundaryProps>;
```

### 使用示例

```typescript
import { errorHandler, ErrorType } from '@/utils/errorHandler';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 错误处理
try {
  await taskService.create(taskData);
} catch (error) {
  errorHandler.handle(error);
}

// 重试操作
const result = await errorHandler.retry(async () => {
  return await api.call();
}, 3);

// 错误边界使用
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
      fallback={({ error }) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
        </div>
      )}
    >
      <MainComponent />
    </ErrorBoundary>
  );
}
```

---

本API文档涵盖了项目管理平台的主要接口和数据结构。如需了解更多详细信息，请参考源代码注释或联系开发团队。