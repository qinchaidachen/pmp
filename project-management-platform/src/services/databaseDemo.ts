import { 
  initializeDatabase, 
  queryUtils, 
  getPerformanceReport, 
  maintenanceUtils,
  getDatabaseStatus,
  db
} from './database';
import { runMigrations, validateDatabaseHealth } from './migrationManager';
import { runPerformanceTest } from './performanceTest';

/**
 * IndexedDB 性能优化演示
 * 
 * 本文件展示了如何使用优化后的数据库功能
 */

export class DatabaseOptimizationDemo {
  
  /**
   * 演示数据库初始化和迁移
   */
  async demoInitialization(): Promise<void> {
    console.log('=== 数据库初始化演示 ===\n');
    
    try {
      // 1. 初始化数据库
      console.log('1. 初始化数据库...');
      await initializeDatabase();
      console.log('   ✓ 数据库初始化成功\n');
      
      // 2. 运行迁移
      console.log('2. 检查并运行迁移...');
      await runMigrations();
      console.log('   ✓ 迁移检查完成\n');
      
      // 3. 验证数据库健康状态
      console.log('3. 验证数据库健康状态...');
      const health = await validateDatabaseHealth();
      console.log(`   健康状态: ${health.isHealthy ? '健康' : '需要维护'}`);
      if (health.recommendations.length > 0) {
        console.log('   建议:');
        health.recommendations.forEach(rec => console.log(`     - ${rec}`));
      }
      console.log('');
      
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }

  /**
   * 演示优化查询功能
   */
  async demoOptimizedQueries(): Promise<void> {
    console.log('=== 优化查询演示 ===\n');
    
    try {
      // 1. 基础查询对比
      console.log('1. 查询性能对比演示:');
      
      // 使用优化查询
      console.log('   使用优化查询...');
      const startTime1 = performance.now();
      const tasks = await queryUtils.getTasksByProjectAndStatus('project1', 'pending' as any);
      const endTime1 = performance.now();
      console.log(`   优化查询耗时: ${(endTime1 - startTime1).toFixed(2)}ms`);
      console.log(`   返回结果: ${tasks.length} 条记录\n`);
      
      // 2. 复合查询演示
      console.log('2. 复合查询演示:');
      
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const memberTasks = await queryUtils.getTasksByMemberAndDateRange('member1', startDate, endDate);
      console.log(`   成员任务查询: ${memberTasks.length} 条记录`);
      
      const teamMembers = await queryUtils.getActiveMembersByTeam('team1');
      console.log(`   团队活跃成员: ${teamMembers.length} 人`);
      
      const availableResources = await queryUtils.getAvailableResourcesByType('meetingRoom');
      console.log(`   可用会议室: ${availableResources.length} 个\n`);
      
    } catch (error) {
      console.error('查询演示失败:', error);
    }
  }

  /**
   * 演示性能监控功能
   */
  async demoPerformanceMonitoring(): Promise<void> {
    console.log('=== 性能监控演示 ===\n');
    
    try {
      // 1. 获取性能报告
      console.log('1. 获取性能报告:');
      const report = getPerformanceReport();
      
      console.log(`   平均查询时间: ${report.averageQueryTime.toFixed(2)}ms`);
      console.log(`   总查询数: ${report.totalQueries}`);
      console.log(`   慢查询数: ${report.slowQueries.length}`);
      console.log(`   最近查询数: ${report.recentQueries.length}\n`);
      
      // 2. 显示最近查询详情
      if (report.recentQueries.length > 0) {
        console.log('2. 最近查询详情:');
        report.recentQueries.slice(0, 3).forEach((query, index) => {
          console.log(`   ${index + 1}. ${query.operation} on ${query.table}: ${query.queryTime.toFixed(2)}ms`);
        });
        console.log('');
      }
      
      // 3. 显示慢查询
      if (report.slowQueries.length > 0) {
        console.log('3. 慢查询记录:');
        report.slowQueries.slice(0, 3).forEach((query, index) => {
          console.log(`   ${index + 1}. ${query.operation}: ${query.queryTime.toFixed(2)}ms`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.error('性能监控演示失败:', error);
    }
  }

  /**
   * 演示数据库维护功能
   */
  async demoMaintenance(): Promise<void> {
    console.log('=== 数据库维护演示 ===\n');
    
    try {
      // 1. 获取数据库状态
      console.log('1. 获取数据库状态:');
      const status = await getDatabaseStatus();
      
      console.log(`   当前版本: ${status.migration.currentVersion}`);
      console.log(`   目标版本: ${status.migration.targetVersion}`);
      console.log(`   是否最新: ${status.migration.isUpToDate ? '是' : '否'}`);
      console.log(`   健康状态: ${status.health.isHealthy ? '健康' : '需要维护'}\n`);
      
      // 2. 索引检查
      console.log('2. 检查索引状态:');
      const indexInfo = await db.checkIndexes();
      Object.entries(indexInfo).forEach(([table, indexes]) => {
        console.log(`   ${table}: ${indexes.length} 个索引`);
      });
      console.log('');
      
      // 3. 清理性能数据（演示）
      console.log('3. 清理性能数据...');
      maintenanceUtils.clearPerformanceData();
      console.log('   ✓ 性能数据已清理\n');
      
    } catch (error) {
      console.error('维护演示失败:', error);
    }
  }

  /**
   * 运行完整演示
   */
  async runFullDemo(): Promise<void> {
    console.log('🚀 IndexedDB 性能优化完整演示\n');
    console.log('='.repeat(50));
    console.log('');
    
    await this.demoInitialization();
    await this.demoOptimizedQueries();
    await this.demoPerformanceMonitoring();
    await this.demoMaintenance();
    
    console.log('='.repeat(50));
    console.log('✅ 演示完成！\n');
    
    console.log('📚 更多功能:');
    console.log('   - 查看 PerformanceMonitor 组件获取可视化监控界面');
    console.log('   - 运行 runPerformanceTest() 执行完整性能测试');
    console.log('   - 查看 INDEXEDDB_OPTIMIZATION.md 了解详细优化说明');
  }
}

// 便捷演示函数
export const runDemo = async (): Promise<void> => {
  const demo = new DatabaseOptimizationDemo();
  await demo.runFullDemo();
};

// 便捷测试函数
export const runQuickTest = async (): Promise<void> => {
  console.log('🧪 运行快速性能测试...\n');
  await runPerformanceTest();
};

// 便捷健康检查
export const runHealthCheck = async (): Promise<void> => {
  console.log('🔍 运行数据库健康检查...\n');
  
  const health = await validateDatabaseHealth();
  console.log(`健康状态: ${health.isHealthy ? '✅ 健康' : '⚠️ 需要维护'}`);
  
  if (health.issues.length > 0) {
    console.log('\n发现问题:');
    health.issues.forEach(issue => console.log(`  ❌ ${issue}`));
  }
  
  if (health.recommendations.length > 0) {
    console.log('\n建议:');
    health.recommendations.forEach(rec => console.log(`  💡 ${rec}`));
  }
  
  console.log('');
};

// 便捷优化函数
export const runQuickOptimize = async (): Promise<void> => {
  console.log('🔧 运行快速优化...\n');
  
  try {
    console.log('1. 清理性能数据...');
    maintenanceUtils.clearPerformanceData();
    console.log('   ✓ 完成\n');
    
    console.log('2. 重建索引...');
    await maintenanceUtils.rebuildIndexes();
    console.log('   ✓ 完成\n');
    
    console.log('3. 验证优化效果...');
    const health = await validateDatabaseHealth();
    console.log(`   健康状态: ${health.isHealthy ? '✅ 健康' : '⚠️ 需要维护'}\n`);
    
    console.log('✅ 优化完成！');
  } catch (error) {
    console.error('❌ 优化失败:', error);
  }
};

// 导出便捷函数
export default {
  runDemo,
  runQuickTest,
  runHealthCheck,
  runQuickOptimize
};