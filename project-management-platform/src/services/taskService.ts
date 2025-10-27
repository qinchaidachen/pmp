import { db, queryUtils } from './database';
import { Task, TaskStatus, FilterOptions, SortOptions } from '../types';

class TaskService {
  // 获取所有任务
  async getAll(filters?: FilterOptions): Promise<Task[]> {
    let query = db.tasks.orderBy('startDate');

    if (filters) {
      query = this.applyFilters(query, filters);
    }

    return await query.toArray();
  }

  // 根据ID获取任务
  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  }

  // 根据成员ID获取任务
  async getByMemberId(memberId: string): Promise<Task[]> {
    return await db.tasks.where('memberId').equals(memberId).toArray();
  }

  // 根据项目ID获取任务
  async getByProjectId(projectId: string): Promise<Task[]> {
    return await db.optimizedQuery('tasks', 'getByProjectId', async () => {
      return await db.tasks.where('projectId').equals(projectId).toArray();
    });
  }

  // 根据团队ID获取任务
  async getByTeamId(teamId: string): Promise<Task[]> {
    return await db.tasks.where('teamId').equals(teamId).toArray();
  }

  // 根据状态获取任务
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    return await db.optimizedQuery('tasks', 'getByStatus', async () => {
      return await db.tasks.where('status').equals(status).toArray();
    });
  }

  // 获取指定时间范围内的任务
  async getByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return await db.tasks
      .filter(task => 
        task.startDate <= endDate && task.endDate >= startDate
      )
      .toArray();
  }

  // 获取成员在指定时间范围内的任务
  async getMemberTasksInRange(memberId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    return await queryUtils.getTasksByMemberAndDateRange(memberId, startDate, endDate);
  }

  // 应用筛选条件
  private applyFilters(query: any, filters: FilterOptions) {
    if (filters.memberIds && filters.memberIds.length > 0) {
      query = query.filter(task => filters.memberIds!.includes(task.memberId));
    }

    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.filter(task => task.teamId && filters.teamIds!.includes(task.teamId));
    }

    if (filters.projectIds && filters.projectIds.length > 0) {
      query = query.filter(task => task.projectId && filters.projectIds!.includes(task.projectId));
    }

    if (filters.status && filters.status.length > 0) {
      query = query.filter(task => filters.status!.includes(task.status));
    }

    if (filters.dateRange) {
      query = query.filter(task => 
        task.startDate <= filters.dateRange!.end && 
        task.endDate >= filters.dateRange!.start
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.filter(task => 
        task.tags && task.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    return query;
  }

  // 排序任务
  async getSorted(sortOptions: SortOptions): Promise<Task[]> {
    let query = db.tasks.toCollection();

    const { field, direction } = sortOptions;
    const directionModifier = direction === 'desc' ? -1 : 1;

    switch (field) {
      case 'startDate':
        query = db.tasks.orderBy('startDate');
        break;
      case 'endDate':
        query = db.tasks.orderBy('endDate');
        break;
      case 'priority':
        query = db.tasks.orderBy('priority');
        break;
      case 'storyPoints':
        query = db.tasks.orderBy('storyPoints');
        break;
      case 'efficiencyScore':
        // 需要通过联表查询或预计算字段来实现
        query = db.tasks.orderBy('storyPoints'); // 临时实现
        break;
      default:
        query = db.tasks.orderBy('startDate');
    }

    const tasks = await query.toArray();
    
    // 如果需要反向排序
    if (direction === 'desc') {
      tasks.reverse();
    }

    return tasks;
  }

  // 创建任务
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.tasks.add(task);
    return task;
  }

  // 更新任务
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const existingTask = await db.tasks.get(id);
    if (!existingTask) {
      throw new Error(`任务ID ${id} 不存在`);
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date(),
    };

    await db.tasks.put(updatedTask);
    return updatedTask;
  }

  // 删除任务
  async delete(id: string): Promise<void> {
    const task = await db.tasks.get(id);
    if (!task) {
      throw new Error(`任务ID ${id} 不存在`);
    }

    await db.tasks.delete(id);
  }

  // 批量创建任务
  async createBatch(tasksData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Task[]> {
    const tasks = tasksData.map(data => ({
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.tasks.bulkAdd(tasks);
    return tasks;
  }

  // 更新任务状态
  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date(),
    };

    // 如果状态变为完成，记录完成时间
    if (status === TaskStatus.COMPLETED) {
      updates.completedAt = new Date();
    }

    return await this.update(id, updates);
  }

  // 获取任务统计信息
  async getStats(filters?: FilterOptions) {
    let query = db.tasks.toCollection();
    
    if (filters) {
      query = this.applyFilters(query, filters);
    }

    const tasks = await query.toArray();
    
    const total = tasks.length;
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const byPriority = tasks.reduce((acc, task) => {
      if (task.priority) {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const totalPersonDays = tasks.reduce((sum, task) => sum + (task.actualPersonDays || 0), 0);

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    const avgCycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const cycleTime = task.completedAt 
            ? (task.completedAt.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)
            : 0;
          return sum + cycleTime;
        }, 0) / completedTasks.length
      : 0;

    return {
      total,
      byStatus,
      byPriority,
      totalStoryPoints,
      totalPersonDays,
      avgCycleTime,
      completionRate: total > 0 ? (byStatus[TaskStatus.COMPLETED] || 0) / total : 0,
    };
  }

  // 获取逾期任务
  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.tasks
      .filter(task => 
        task.endDate < now && 
        task.status !== TaskStatus.COMPLETED
      )
      .toArray();
  }

  // 获取即将到期的任务
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return await db.tasks
      .filter(task => 
        task.endDate >= now && 
        task.endDate <= futureDate &&
        task.status !== TaskStatus.COMPLETED
      )
      .toArray();
  }

  // 搜索任务
  async search(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    return await db.tasks
      .filter(task => 
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
      .toArray();
  }

  // 根据项目ID和状态获取任务（优化查询）
  async getByProjectIdAndStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    return await queryUtils.getTasksByProjectAndStatus(projectId, status);
  }

  // 根据状态和优先级获取任务（优化查询）
  async getByStatusAndPriority(status: TaskStatus, priority: string): Promise<Task[]> {
    return await queryUtils.getTasksByStatusAndPriority(status, priority as any);
  }

  // 获取逾期任务（优化查询）
  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.optimizedQuery('tasks', 'getOverdueTasks', async () => {
      return await db.tasks
        .where('endDate')
        .below(now)
        .and(task => task.status !== TaskStatus.COMPLETED)
        .toArray();
    });
  }

  // 获取即将到期的任务（优化查询）
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return await db.optimizedQuery('tasks', 'getUpcomingTasks', async () => {
      return await db.tasks
        .where('endDate')
        .between(now, futureDate)
        .and(task => task.status !== TaskStatus.COMPLETED)
        .toArray();
    });
  }

  // 批量获取任务统计信息（优化查询）
  async getBatchStats(projectIds: string[]): Promise<{ [projectId: string]: any }> {
    const stats: { [projectId: string]: any } = {};
    
    for (const projectId of projectIds) {
      const tasks = await this.getByProjectId(projectId);
      
      const total = tasks.length;
      const byStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<TaskStatus, number>);
      
      const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      
      stats[projectId] = {
        total,
        byStatus,
        totalStoryPoints,
        completionRate: total > 0 ? (byStatus[TaskStatus.COMPLETED] || 0) / total : 0,
      };
    }
    
    return stats;
  }

  // 获取性能报告
  async getPerformanceReport(): Promise<any> {
    const monitor = db.getPerformanceMonitor();
    
    return {
      averageQueryTime: monitor.getAverageQueryTime('getByProjectId', 'tasks'),
      slowQueries: monitor.getSlowQueries(50),
      totalQueries: monitor.getMetrics('getByProjectId', 'tasks').length,
      recentQueries: monitor.getMetrics('getByProjectId', 'tasks').slice(-5)
    };
  }

  // 生成唯一ID
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const taskService = new TaskService();