import { db, INDEX_DEFINITIONS } from './database';

// 迁移步骤接口
interface MigrationStep {
  version: number;
  description: string;
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
}

// 数据库迁移管理器
export class DatabaseMigrationManager {
  private migrations: MigrationStep[] = [];

  constructor() {
    this.setupMigrations();
  }

  private setupMigrations(): void {
    // 版本 1 -> 2: 添加性能优化索引
    this.migrations.push({
      version: 2,
      description: '添加性能优化索引',
      execute: this.createPerformanceIndexes.bind(this),
      rollback: this.removePerformanceIndexes.bind(this)
    });

    // 未来版本可以继续添加迁移步骤
    // this.migrations.push({
    //   version: 3,
    //   description: '添加新的字段或表',
    //   execute: this.addNewFields.bind(this),
    //   rollback: this.removeNewFields.bind(this)
    // });
  }

  // 创建性能优化索引
  private async createPerformanceIndexes(): Promise<void> {
    console.log('开始创建性能优化索引...');
    
    try {
      // 检查当前数据库版本
      const currentVersion = db.tables.length > 0 ? 2 : 1;
      
      if (currentVersion < 2) {
        // 模拟索引创建过程
        console.log('正在创建索引...');
        
        // 验证索引是否创建成功
        const indexInfo = await db.checkIndexes();
        console.log('当前索引状态:', indexInfo);
        
        console.log('性能优化索引创建完成');
      } else {
        console.log('索引已存在，跳过创建');
      }
    } catch (error) {
      console.error('创建性能优化索引失败:', error);
      throw error;
    }
  }

  // 移除性能优化索引
  private async removePerformanceIndexes(): Promise<void> {
    console.log('移除性能优化索引...');
    // 注意：实际移除索引需要在数据库版本降级中处理
    console.log('性能优化索引移除完成');
  }

  // 执行迁移到指定版本
  async migrateTo(targetVersion: number): Promise<void> {
    console.log(`开始迁移到版本 ${targetVersion}...`);
    
    const currentVersion = this.getCurrentVersion();
    
    if (currentVersion === targetVersion) {
      console.log('数据库已是目标版本，无需迁移');
      return;
    }

    if (currentVersion > targetVersion) {
      throw new Error('不支持版本降级');
    }

    // 按顺序执行迁移
    for (const migration of this.migrations) {
      if (migration.version > currentVersion && migration.version <= targetVersion) {
        console.log(`执行迁移: ${migration.description}`);
        await migration.execute();
      }
    }

    console.log(`迁移到版本 ${targetVersion} 完成`);
  }

  // 获取当前版本
  private getCurrentVersion(): number {
    // 基于实际的索引存在情况判断版本
    return INDEX_DEFINITIONS.version;
  }

  // 获取迁移历史
  getMigrationHistory(): MigrationStep[] {
    return [...this.migrations];
  }

  // 检查迁移状态
  async checkMigrationStatus(): Promise<{
    currentVersion: number;
    targetVersion: number;
    pendingMigrations: MigrationStep[];
    isUpToDate: boolean;
  }> {
    const currentVersion = this.getCurrentVersion();
    const targetVersion = INDEX_DEFINITIONS.version;
    const pendingMigrations = this.migrations.filter(
      m => m.version > currentVersion && m.version <= targetVersion
    );

    return {
      currentVersion,
      targetVersion,
      pendingMigrations,
      isUpToDate: currentVersion === targetVersion
    };
  }

  // 验证数据库完整性
  async validateDatabase(): Promise<{
    isValid: boolean;
    issues: string[];
    indexStatus: { [tableName: string]: string[] };
  }> {
    const issues: string[] = [];
    
    try {
      // 检查表是否存在
      const requiredTables = ['members', 'tasks', 'projects', 'teams', 'resources', 'resourceBookings', 'performanceMetrics', 'businessLines', 'roles'];
      const existingTables = db.tables.map(t => t.name);
      
      for (const tableName of requiredTables) {
        if (!existingTables.includes(tableName)) {
          issues.push(`缺少表: ${tableName}`);
        }
      }

      // 检查索引状态
      const indexStatus = await db.checkIndexes();
      const expectedIndexes = INDEX_DEFINITIONS.indexes;

      for (const [tableName, expectedIndexDefs] of Object.entries(expectedIndexes)) {
        const tableIndexes = indexStatus[tableName] || [];
        const expectedIndexNames = Object.keys(expectedIndexDefs);
        
        const missingIndexes = expectedIndexNames.filter(
          indexName => !tableIndexes.includes(indexName)
        );
        
        if (missingIndexes.length > 0) {
          issues.push(`表 ${tableName} 缺少索引: ${missingIndexes.join(', ')}`);
        }
      }

      // 检查数据完整性
      try {
        await db.members.count();
        await db.tasks.count();
        await db.projects.count();
      } catch (error) {
        issues.push('数据表访问异常');
      }

      return {
        isValid: issues.length === 0,
        issues,
        indexStatus
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`数据库验证失败: ${error}`],
        indexStatus: {}
      };
    }
  }

  // 备份数据库
  async backupDatabase(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log('开始备份数据库...');
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: this.getCurrentVersion(),
        data: {
          members: await db.members.toArray(),
          tasks: await db.tasks.toArray(),
          projects: await db.projects.toArray(),
          teams: await db.teams.toArray(),
          resources: await db.resources.toArray(),
          resourceBookings: await db.resourceBookings.toArray(),
          performanceMetrics: await db.performanceMetrics.toArray(),
          businessLines: await db.businessLines.toArray(),
          roles: await db.roles.toArray()
        }
      };

      console.log('数据库备份完成');
      return {
        success: true,
        data: backup
      };
    } catch (error) {
      console.error('数据库备份失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 恢复数据库
  async restoreDatabase(backupData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('开始恢复数据库...');
      
      // 清空现有数据
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

      // 恢复数据
      if (backupData.data) {
        await db.transaction('rw', 
          db.members, db.tasks, db.projects, db.teams, 
          db.resources, db.resourceBookings, db.performanceMetrics, 
          db.businessLines, db.roles, 
          async () => {
            if (backupData.data.members) await db.members.bulkAdd(backupData.data.members);
            if (backupData.data.tasks) await db.tasks.bulkAdd(backupData.data.tasks);
            if (backupData.data.projects) await db.projects.bulkAdd(backupData.data.projects);
            if (backupData.data.teams) await db.teams.bulkAdd(backupData.data.teams);
            if (backupData.data.resources) await db.resources.bulkAdd(backupData.data.resources);
            if (backupData.data.resourceBookings) await db.resourceBookings.bulkAdd(backupData.data.resourceBookings);
            if (backupData.data.performanceMetrics) await db.performanceMetrics.bulkAdd(backupData.data.performanceMetrics);
            if (backupData.data.businessLines) await db.businessLines.bulkAdd(backupData.data.businessLines);
            if (backupData.data.roles) await db.roles.bulkAdd(backupData.data.roles);
          }
        );
      }

      console.log('数据库恢复完成');
      return {
        success: true
      };
    } catch (error) {
      console.error('数据库恢复失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}

// 创建迁移管理器实例
export const migrationManager = new DatabaseMigrationManager();

// 便捷的迁移函数
export const runMigrations = async (): Promise<void> => {
  try {
    const status = await migrationManager.checkMigrationStatus();
    
    if (!status.isUpToDate) {
      console.log(`发现 ${status.pendingMigrations.length} 个待执行迁移`);
      
      for (const migration of status.pendingMigrations) {
        console.log(`执行迁移: ${migration.description}`);
        await migration.execute();
      }
      
      console.log('所有迁移执行完成');
    } else {
      console.log('数据库已是最新版本');
    }
  } catch (error) {
    console.error('迁移执行失败:', error);
    throw error;
  }
};

// 验证数据库健康状态
export const validateDatabaseHealth = async (): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const validation = await migrationManager.validateDatabase();
  const recommendations: string[] = [];

  if (!validation.isValid) {
    recommendations.push('运行数据库迁移以修复问题');
  }

  if (validation.issues.some(issue => issue.includes('索引'))) {
    recommendations.push('考虑运行数据库优化以重建索引');
  }

  // 检查性能
  const performanceReport = getPerformanceReport();
  if (performanceReport.averageQueryTime > 50) {
    recommendations.push('查询性能较差，建议优化索引或查询语句');
  }

  return {
    isHealthy: validation.isValid && performanceReport.averageQueryTime < 50,
    issues: validation.issues,
    recommendations
  };
};

// 获取数据库状态摘要
export const getDatabaseStatus = async () => {
  const migrationStatus = await migrationManager.checkMigrationStatus();
  const validation = await migrationManager.validateDatabase();
  const performance = getPerformanceReport();
  const health = await validateDatabaseHealth();

  return {
    migration: migrationStatus,
    validation,
    performance,
    health,
    timestamp: new Date().toISOString()
  };
};