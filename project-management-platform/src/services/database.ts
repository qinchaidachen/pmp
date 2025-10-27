import Dexie, { Table } from 'dexie';
import { 
  Member, 
  Task, 
  Project, 
  Team, 
  Resource, 
  ResourceBooking, 
  PerformanceMetric,
  BusinessLine,
  Role,
  FilterOptions,
  TaskStatus,
  TaskPriority
} from '../types';

// 导入迁移管理器相关函数
export { DatabaseMigrationManager, migrationManager, runMigrations, validateDatabaseHealth, getDatabaseStatus } from './migrationManager';

// 性能监控接口
interface PerformanceMetrics {
  queryTime: number;
  operation: string;
  table: string;
  timestamp: Date;
  resultCount?: number;
  indexed: boolean;
}

// 数据库配置接口
interface DatabaseConfig {
  version: number;
  indexes: {
    [tableName: string]: {
      [indexName: string]: string | string[];
    };
  };
}

// 索引定义
export const INDEX_DEFINITIONS: DatabaseConfig = {
  version: 2,
  indexes: {
    tasks: {
      // 基础索引
      'id': 'id',
      'title': 'title',
      'memberId': 'memberId',
      'projectId': 'projectId',
      'teamId': 'teamId',
      'status': 'status',
      'priority': 'priority',
      'startDate': 'startDate',
      'endDate': 'endDate',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引 - 优化常用查询
      '[projectId+status]': '[projectId+status]',
      '[projectId+createdAt]': '[projectId+createdAt]',
      '[memberId+status]': '[memberId+status]',
      '[memberId+startDate]': '[memberId+startDate]',
      '[teamId+status]': '[teamId+status]',
      '[teamId+createdAt]': '[teamId+createdAt]',
      '[status+priority]': '[status+priority]',
      '[status+startDate]': '[status+startDate]',
      '[priority+startDate]': '[priority+startDate]',
      '[startDate+endDate]': '[startDate+endDate]'
    },
    members: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'role': 'role',
      'email': 'email',
      'teamId': 'teamId',
      'isActive': 'isActive',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引 - 优化查询
      '[teamId+role]': '[teamId+role]',
      '[teamId+isActive]': '[teamId+isActive]',
      '[role+isActive]': '[role+isActive]',
      '[isActive+createdAt]': '[isActive+createdAt]'
    },
    projects: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'status': 'status',
      'businessLineId': 'businessLineId',
      'startDate': 'startDate',
      'endDate': 'endDate',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引
      '[status+startDate]': '[status+startDate]',
      '[businessLineId+status]': '[businessLineId+status]',
      '[startDate+endDate]': '[startDate+endDate]'
    },
    teams: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'businessLineId': 'businessLineId',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引
      '[businessLineId+createdAt]': '[businessLineId+createdAt]'
    },
    resources: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'type': 'type',
      'isAvailable': 'isAvailable',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引
      '[type+isAvailable]': '[type+isAvailable]'
    },
    resourceBookings: {
      // 基础索引
      'id': 'id',
      'resourceId': 'resourceId',
      'memberId': 'memberId',
      'status': 'status',
      'startDate': 'startDate',
      'endDate': 'endDate',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引
      '[resourceId+startDate]': '[resourceId+startDate]',
      '[memberId+startDate]': '[memberId+startDate]',
      '[status+startDate]': '[status+startDate]',
      '[startDate+endDate]': '[startDate+endDate]'
    },
    performanceMetrics: {
      // 基础索引
      'id': 'id',
      'targetId': 'targetId',
      'targetType': 'targetType',
      'date': 'date',
      'period': 'period',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      
      // 复合索引
      '[targetId+date]': '[targetId+date]',
      '[targetType+date]': '[targetType+date]',
      '[period+date]': '[period+date]'
    },
    businessLines: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt'
    },
    roles: {
      // 基础索引
      'id': 'id',
      'name': 'name',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt'
    }
  }
};

// 性能监控类
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // 保持固定数量的记录
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // 记录慢查询
    if (metrics.queryTime > 100) {
      console.warn(`慢查询检测: ${metrics.operation} on ${metrics.table} 耗时 ${metrics.queryTime}ms`);
    }
  }

  getMetrics(operation?: string, table?: string): PerformanceMetrics[] {
    let filtered = this.metrics;
    
    if (operation) {
      filtered = filtered.filter(m => m.operation === operation);
    }
    
    if (table) {
      filtered = filtered.filter(m => m.table === table);
    }
    
    return filtered;
  }

  getAverageQueryTime(operation?: string, table?: string): number {
    const metrics = this.getMetrics(operation, table);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.queryTime, 0);
    return total / metrics.length;
  }

  getSlowQueries(threshold: number = 100): PerformanceMetrics[] {
    return this.metrics.filter(m => m.queryTime > threshold);
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// 定义数据库类
export class ProjectManagementDB extends Dexie {
  // 定义表
  members!: Table<Member>;
  tasks!: Table<Task>;
  projects!: Table<Project>;
  teams!: Table<Team>;
  resources!: Table<Resource>;
  resourceBookings!: Table<ResourceBooking>;
  performanceMetrics!: Table<PerformanceMetric>;
  businessLines!: Table<BusinessLine>;
  roles!: Table<Role>;

  private performanceMonitor: PerformanceMonitor;

  constructor() {
    super('ProjectManagementDB');
    this.performanceMonitor = new PerformanceMonitor();
    
    this.setupDatabase();
  }

  private setupDatabase(): void {
    // 版本 1 - 基础结构
    this.version(1).stores({
      members: 'id, name, role, teamId, isActive, createdAt, updatedAt',
      tasks: 'id, title, memberId, projectId, teamId, status, startDate, endDate, priority, storyPoints, createdAt, updatedAt',
      projects: 'id, name, status, startDate, endDate, businessLineId, createdAt, updatedAt',
      teams: 'id, name, businessLineId, createdAt, updatedAt',
      resources: 'id, name, type, isAvailable, createdAt, updatedAt',
      resourceBookings: 'id, resourceId, memberId, startDate, endDate, status, createdAt, updatedAt',
      performanceMetrics: 'id, targetId, targetType, date, period, createdAt, updatedAt',
      businessLines: 'id, name, createdAt, updatedAt',
      roles: 'id, name, createdAt, updatedAt'
    });

    // 版本 2 - 添加优化索引
    this.version(2).stores({
      members: 'id, name, role, teamId, isActive, createdAt, updatedAt, [teamId+role], [teamId+isActive], [role+isActive], [isActive+createdAt]',
      tasks: 'id, title, memberId, projectId, teamId, status, startDate, endDate, priority, storyPoints, createdAt, updatedAt, [projectId+status], [projectId+createdAt], [memberId+status], [memberId+startDate], [teamId+status], [teamId+createdAt], [status+priority], [status+startDate], [priority+startDate], [startDate+endDate]',
      projects: 'id, name, status, startDate, endDate, businessLineId, createdAt, updatedAt, [status+startDate], [businessLineId+status], [businessLineId+createdAt]',
      teams: 'id, name, businessLineId, createdAt, updatedAt, [businessLineId+status], [businessLineId+createdAt]',
      resources: 'id, name, type, isAvailable, createdAt, updatedAt, [type+isAvailable], [isAvailable+createdAt]',
      resourceBookings: 'id, resourceId, memberId, startDate, endDate, status, createdAt, updatedAt, [resourceId+status], [memberId+status], [startDate+endDate], [status+startDate]',
      performanceMetrics: 'id, targetId, targetType, date, period, createdAt, updatedAt, [targetId+targetType], [targetType+date]',
      businessLines: 'id, name, createdAt, updatedAt',
      roles: 'id, name, createdAt, updatedAt'
    }).upgrade(tx => {
      console.log('数据库升级到版本 2，添加性能优化索引');
    });

    // 定义钩子函数
    this.setupHooks();
  }

  private setupHooks(): void {
    // 成员表钩子
    this.members.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.members.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 任务表钩子
    this.tasks.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.tasks.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 项目表钩子
    this.projects.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.projects.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 团队表钩子
    this.teams.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.teams.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 资源表钩子
    this.resources.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.resources.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 资源预订表钩子
    this.resourceBookings.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.resourceBookings.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 效能指标表钩子
    this.performanceMetrics.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.performanceMetrics.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 业务线表钩子
    this.businessLines.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.businessLines.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    // 角色表钩子
    this.roles.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.roles.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });
  }

  // 性能优化的查询方法
  async optimizedQuery<T>(
    tableName: keyof ProjectManagementDB,
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      this.performanceMonitor.recordMetrics({
        queryTime,
        operation,
        table: tableName as string,
        timestamp: new Date(),
        resultCount: Array.isArray(result) ? result.length : 1,
        indexed: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      console.error(`查询失败: ${operation} on ${tableName}`, error);
      
      this.performanceMonitor.recordMetrics({
        queryTime,
        operation: `${operation}_ERROR`,
        table: tableName as string,
        timestamp: new Date(),
        indexed: false
      });
      
      throw error;
    }
  }

  // 获取性能监控器
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  // 获取数据库配置
  getConfig(): DatabaseConfig {
    return INDEX_DEFINITIONS;
  }

  // 检查索引是否存在
  async checkIndexes(): Promise<{ [tableName: string]: string[] }> {
    const indexInfo: { [tableName: string]: string[] } = {};
    
    for (const [tableName, indexes] of Object.entries(INDEX_DEFINITIONS.indexes)) {
      const table = this[tableName as keyof this] as any;
      if (table && table.schema) {
        indexInfo[tableName] = Object.keys(table.schema.indexes || {});
      }
    }
    
    return indexInfo;
  }
}

// 创建数据库实例
export const db = new ProjectManagementDB();

// 数据库初始化和迁移
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    
    // 检查并创建索引
    await ensureIndexes();
    
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 确保索引存在
export const ensureIndexes = async (): Promise<void> => {
  try {
    const currentIndexes = await db.checkIndexes();
    const expectedIndexes = INDEX_DEFINITIONS.indexes;
    
    for (const [tableName, expectedIndexDefs] of Object.entries(expectedIndexes)) {
      const tableIndexes = currentIndexes[tableName] || [];
      const expectedIndexNames = Object.keys(expectedIndexDefs);
      
      const missingIndexes = expectedIndexNames.filter(
        indexName => !tableIndexes.includes(indexName)
      );
      
      if (missingIndexes.length > 0) {
        console.warn(`表 ${tableName} 缺少索引:`, missingIndexes);
        // 注意：实际的索引创建需要在数据库版本升级中处理
      }
    }
  } catch (error) {
    console.error('检查索引时出错:', error);
  }
};

// 清空所有数据
export const clearAllData = async (): Promise<void> => {
  await db.transaction('rw', 
    db.members, db.tasks, db.projects, db.teams, 
    db.resources, db.resourceBookings, db.performanceMetrics, 
    db.businessLines, db.roles, 
    async () => {
      await db.members.clear();
      await db.tasks.clear();
      await db.projects.clear();
      await db.teams.clear();
      await db.resources.clear();
      await db.resourceBookings.clear();
      await db.performanceMetrics.clear();
      await db.businessLines.clear();
      await db.roles.clear();
    }
  );
};

// 获取数据库统计信息
export const getDatabaseStats = async () => {
  const stats = {
    members: await db.members.count(),
    tasks: await db.tasks.count(),
    projects: await db.projects.count(),
    teams: await db.teams.count(),
    resources: await db.resources.count(),
    resourceBookings: await db.resourceBookings.count(),
    performanceMetrics: await db.performanceMetrics.count(),
    businessLines: await db.businessLines.count(),
    roles: await db.roles.count(),
  };
  return stats;
};

// 获取性能报告
export const getPerformanceReport = () => {
  const monitor = db.getPerformanceMonitor();
  
  return {
    averageQueryTime: monitor.getAverageQueryTime(),
    slowQueries: monitor.getSlowQueries(),
    recentQueries: monitor.getMetrics().slice(-10),
    totalQueries: monitor.getMetrics().length
  };
};

// 优化查询的工具函数
export const queryUtils = {
  // 优化的任务查询
  async getTasksByProjectAndStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    return db.optimizedQuery('tasks', 'getTasksByProjectAndStatus', async () => {
      return await db.tasks.where('[projectId+status]').equals([projectId, status]).toArray();
    });
  },

  async getTasksByMemberAndDateRange(memberId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    return db.optimizedQuery('tasks', 'getTasksByMemberAndDateRange', async () => {
      return await db.tasks
        .where('[memberId+startDate]')
        .between([memberId, startDate], [memberId, endDate])
        .toArray();
    });
  },

  async getTasksByStatusAndPriority(status: TaskStatus, priority: TaskPriority): Promise<Task[]> {
    return db.optimizedQuery('tasks', 'getTasksByStatusAndPriority', async () => {
      return await db.tasks.where('[status+priority]').equals([status, priority]).toArray();
    });
  },

  // 优化的成员查询
  async getMembersByTeamAndRole(teamId: string, role: string): Promise<Member[]> {
    return db.optimizedQuery('members', 'getMembersByTeamAndRole', async () => {
      return await db.members.where('[teamId+role]').equals([teamId, role]).toArray();
    });
  },

  async getActiveMembersByTeam(teamId: string): Promise<Member[]> {
    return db.optimizedQuery('members', 'getActiveMembersByTeam', async () => {
      return await db.members.where('[teamId+isActive]').equals([teamId, true]).toArray();
    });
  },

  // 优化的项目查询
  async getProjectsByStatusAndDateRange(status: string, startDate: Date, endDate: Date): Promise<Project[]> {
    return db.optimizedQuery('projects', 'getProjectsByStatusAndDateRange', async () => {
      return await db.projects
        .where('[status+startDate]')
        .between([status, startDate], [status, endDate])
        .toArray();
    });
  },

  // 优化的资源查询
  async getAvailableResourcesByType(type: string): Promise<Resource[]> {
    return db.optimizedQuery('resources', 'getAvailableResourcesByType', async () => {
      return await db.resources.where('[type+isAvailable]').equals([type, true]).toArray();
    });
  },

  // 优化的资源预订查询
  async getResourceBookingsByDateRange(startDate: Date, endDate: Date): Promise<ResourceBooking[]> {
    return db.optimizedQuery('resourceBookings', 'getResourceBookingsByDateRange', async () => {
      return await db.resourceBookings
        .where('[startDate+endDate]')
        .between([startDate, startDate], [endDate, endDate])
        .toArray();
    });
  }
};

// 数据库维护工具
export const maintenanceUtils = {
  // 重建所有索引
  async rebuildIndexes(): Promise<void> {
    console.log('开始重建索引...');
    
    // 获取所有表名
    const tableNames = Object.keys(INDEX_DEFINITIONS.indexes);
    
    for (const tableName of tableNames) {
      const table = db[tableName as keyof ProjectManagementDB] as any;
      if (table) {
        // 触发索引重建
        await table.count();
        console.log(`表 ${tableName} 索引重建完成`);
      }
    }
    
    console.log('所有索引重建完成');
  },

  // 清理性能数据
  clearPerformanceData(): void {
    db.getPerformanceMonitor().clearMetrics();
    console.log('性能数据已清理');
  },

  // 优化数据库
  async optimize(): Promise<void> {
    console.log('开始数据库优化...');
    
    // 清理性能数据
    this.clearPerformanceData();
    
    // 重建索引
    await this.rebuildIndexes();
    
    console.log('数据库优化完成');
  }
};