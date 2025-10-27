// 基础类型定义 - 基于现有TaskBoard组件扩展

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

// 任务优先级
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 资源类型
export enum ResourceType {
  MEETING_ROOM = 'meetingRoom',
  TEST_DEVICE = 'testDevice',
  OTHER = 'other'
}

// 成员角色
export interface Member {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  teamId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 任务接口 - 扩展现有TaskBoard的Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  memberId: string;
  projectId?: string;
  teamId?: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number; // 故事点/估点
  actualPersonDays?: number; // 实际投入人天
  estimatedPersonDays?: number; // 预估人天
  tags?: string[];
  dependencies?: string[]; // 依赖的任务ID列表
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 看板配置 - 基于现有BoardConfig扩展
export interface BoardConfig {
  startDate: Date;
  endDate: Date;
  weekStartDay: number; // 0=Sunday, 1=Monday
  showWeekends: boolean;
  editable: boolean;
  showStoryPoints?: boolean;
  showPersonDays?: boolean;
  groupBy?: 'member' | 'team' | 'status' | 'priority';
}

// 项目接口
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'onHold' | 'completed' | 'cancelled';
  taskIds: string[];
  teamIds: string[];
  businessLineId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 团队接口
export interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  projectIds: string[];
  businessLineId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 业务线接口
export interface BusinessLine {
  id: string;
  name: string;
  description?: string;
  ownerIds: string[]; // 负责该业务线的团队或角色ID
  color?: string; // 用于UI显示的颜色
  createdAt: Date;
  updatedAt: Date;
}

// 角色接口
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 资源接口
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description?: string;
  location?: string;
  capacity?: number; // 容量（如会议室人数）
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 资源预定记录
export interface ResourceBooking {
  id: string;
  resourceId: string;
  memberId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  attendees?: string[]; // 参与者成员ID列表
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// 效能指标接口
export interface PerformanceMetric {
  id: string; // e.g., 'memberId-2024-10'
  targetId: string; // 关联的成员或团队ID
  targetType: 'member' | 'team';
  date: Date; // 统计周期，如月份第一天
  period: 'week' | 'month' | 'quarter' | 'year';
  
  // 基础指标
  storyPointsCompleted: number;
  personDaysInvested: number;
  tasksCompleted: number;
  avgTaskCycleTime: number; // 平均任务周期（小时）
  
  // 计算指标
  efficiencyScore: number; // 综合效率分
  velocity: number; // 速率（每周完成的故事点数）
  qualityScore: number; // 质量分（基于缺陷率等）
  
  // 排名相关
  rank: number;
  percentile: number; // 百分位数
  
  createdAt: Date;
  updatedAt: Date;
}

// 数据导入导出相关类型
export interface ImportData {
  members: Member[];
  tasks: Task[];
  projects: Project[];
  teams: Team[];
  resources?: Resource[];
  resourceBookings?: ResourceBooking[];
}

export interface ExportOptions {
  format: 'json' | 'csv';
  includeComputedData: boolean; // 是否包含计算后的效能数据
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 图表数据类型
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// 看板数据视图
export interface BoardViewData {
  members: Member[];
  tasks: Task[];
  config: BoardConfig;
  projects?: Project[];
  teams?: Team[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 筛选和排序选项
export interface FilterOptions {
  memberIds?: string[];
  teamIds?: string[];
  projectIds?: string[];
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SortOptions {
  field: keyof Task | 'efficiencyScore' | 'velocity';
  direction: 'asc' | 'desc';
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}