import { z } from 'zod';
import { Member, Task, Project, Team, Resource, ResourceBooking, PerformanceMetric, BusinessLine, Role, TaskStatus, TaskPriority, ResourceType } from '../types';

// 成员验证模式
export const memberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '成员姓名不能为空'),
  role: z.string().min(1, '角色不能为空'),
  email: z.string().email('邮箱格式不正确').optional(),
  avatar: z.string().url('头像URL格式不正确').optional(),
  teamId: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 任务验证模式
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, '任务标题不能为空'),
  description: z.string().optional(),
  memberId: z.string().min(1, '必须指定任务负责人'),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority).optional(),
  storyPoints: z.number().min(0).optional(),
  actualPersonDays: z.number().min(0).optional(),
  estimatedPersonDays: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: '结束日期不能早于开始日期',
  path: ['endDate'],
});

// 项目验证模式
export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['planning', 'active', 'onHold', 'completed', 'cancelled']),
  taskIds: z.array(z.string()),
  teamIds: z.array(z.string()),
  businessLineId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: '项目结束日期不能早于开始日期',
  path: ['endDate'],
});

// 团队验证模式
export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '团队名称不能为空'),
  description: z.string().optional(),
  memberIds: z.array(z.string()),
  projectIds: z.array(z.string()),
  businessLineId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 资源验证模式
export const resourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '资源名称不能为空'),
  type: z.nativeEnum(ResourceType),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  isAvailable: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 资源预定验证模式
export const resourceBookingSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1, '必须指定资源'),
  memberId: z.string().min(1, '必须指定预定人'),
  title: z.string().min(1, '预定标题不能为空'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  attendees: z.array(z.string()).optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: '结束时间必须晚于开始时间',
  path: ['endDate'],
});

// 效能指标验证模式
export const performanceMetricSchema = z.object({
  id: z.string().min(1),
  targetId: z.string().min(1),
  targetType: z.enum(['member', 'team']),
  date: z.date(),
  period: z.enum(['week', 'month', 'quarter', 'year']),
  storyPointsCompleted: z.number().min(0),
  personDaysInvested: z.number().min(0),
  tasksCompleted: z.number().min(0),
  avgTaskCycleTime: z.number().min(0),
  efficiencyScore: z.number().min(0),
  velocity: z.number().min(0),
  qualityScore: z.number().min(0),
  rank: z.number().min(1),
  percentile: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 业务线验证模式
export const businessLineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '业务线名称不能为空'),
  description: z.string().optional(),
  ownerIds: z.array(z.string()),
  color: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 角色验证模式
export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '角色名称不能为空'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 数据验证器类
export class DataValidator {
  // 验证成员数据
  static validateMember(data: unknown): { success: true; data: Member } | { success: false; errors: string[] } {
    const result = memberSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证任务数据
  static validateTask(data: unknown): { success: true; data: Task } | { success: false; errors: string[] } {
    const result = taskSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证项目数据
  static validateProject(data: unknown): { success: true; data: Project } | { success: false; errors: string[] } {
    const result = projectSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证团队数据
  static validateTeam(data: unknown): { success: true; data: Team } | { success: false; errors: string[] } {
    const result = teamSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证资源数据
  static validateResource(data: unknown): { success: true; data: Resource } | { success: false; errors: string[] } {
    const result = resourceSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证资源预定数据
  static validateResourceBooking(data: unknown): { success: true; data: ResourceBooking } | { success: false; errors: string[] } {
    const result = resourceBookingSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证效能指标数据
  static validatePerformanceMetric(data: unknown): { success: true; data: PerformanceMetric } | { success: false; errors: string[] } {
    const result = performanceMetricSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证业务线数据
  static validateBusinessLine(data: unknown): { success: true; data: BusinessLine } | { success: false; errors: string[] } {
    const result = businessLineSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 验证角色数据
  static validateRole(data: unknown): { success: true; data: Role } | { success: false; errors: string[] } {
    const result = roleSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error.errors.map(err => err.message) };
    }
  }

  // 批量验证数据
  static validateBatch<T>(
    data: unknown[],
    validator: (data: unknown) => { success: true; data: T } | { success: false; errors: string[] }
  ): { valid: T[]; invalid: { index: number; errors: string[] }[] } {
    const valid: T[] = [];
    const invalid: { index: number; errors: string[] }[] = [];

    data.forEach((item, index) => {
      const result = validator(item);
      if (result.success) {
        valid.push(result.data);
      } else {
        invalid.push({ index, errors: result.errors });
      }
    });

    return { valid, invalid };
  }
}