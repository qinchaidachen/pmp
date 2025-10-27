import { db, queryUtils, getPerformanceReport, maintenanceUtils } from '../services/database';
import { initializeDatabase } from '../services/database';
import { runMigrations } from '../services/migrationManager';

// IndexedDB 性能优化测试
export class PerformanceTest {
  private testResults: any[] = [];

  async runAllTests(): Promise<void> {
    console.log('开始 IndexedDB 性能优化测试...\n');

    try {
      // 初始化数据库
      await this.testDatabaseInitialization();
      
      // 创建测试数据
      await this.createTestData();
      
      // 测试基础查询性能
      await this.testBasicQueries();
      
      // 测试优化查询性能
      await this.testOptimizedQueries();
      
      // 测试索引效果
      await this.testIndexEffectiveness();
      
      // 测试性能监控
      await this.testPerformanceMonitoring();
      
      // 生成测试报告
      this.generateTestReport();
      
    } catch (error) {
      console.error('测试执行失败:', error);
    }
  }

  private async testDatabaseInitialization(): Promise<void> {
    console.log('1. 测试数据库初始化...');
    
    const startTime = performance.now();
    await initializeDatabase();
    const endTime = performance.now();
    
    this.testResults.push({
      test: '数据库初始化',
      duration: endTime - startTime,
      status: 'success'
    });
    
    console.log(`   ✓ 初始化完成，耗时 ${(endTime - startTime).toFixed(2)}ms\n`);
  }

  private async createTestData(): Promise<void> {
    console.log('2. 创建测试数据...');
    
    const startTime = performance.now();
    
    // 创建测试成员
    const members = Array.from({ length: 100 }, (_, i) => ({
      name: `成员${i + 1}`,
      role: i % 5 === 0 ? 'manager' : i % 3 === 0 ? 'developer' : 'designer',
      email: `member${i + 1}@company.com`,
      teamId: `team${Math.floor(i / 10) + 1}`,
      isActive: i % 10 !== 0
    }));

    // 创建测试项目
    const projects = Array.from({ length: 20 }, (_, i) => ({
      name: `项目${i + 1}`,
      description: `项目${i + 1}的描述`,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31),
      status: ['planning', 'active', 'completed'][Math.floor(Math.random() * 3)],
      taskIds: [],
      teamIds: [`team${Math.floor(i / 5) + 1}`],
      businessLineId: `bl${Math.floor(i / 4) + 1}`
    }));

    // 创建测试任务
    const tasks = Array.from({ length: 500 }, (_, i) => ({
      title: `任务${i + 1}`,
      description: `任务${i + 1}的描述`,
      memberId: members[i % members.length].id,
      projectId: projects[i % projects.length].id,
      teamId: `team${Math.floor(i / 50) + 1}`,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31),
      status: ['pending', 'inProgress', 'completed'][Math.floor(Math.random() * 3)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      storyPoints: Math.floor(Math.random() * 10) + 1
    }));

    // 批量插入数据
    await db.transaction('rw', db.members, db.projects, db.tasks, async () => {
      await db.members.bulkAdd(members);
      await db.projects.bulkAdd(projects);
      await db.tasks.bulkAdd(tasks);
    });

    const endTime = performance.now();
    
    this.testResults.push({
      test: '创建测试数据',
      duration: endTime - startTime,
      recordsCreated: members.length + projects.length + tasks.length,
      status: 'success'
    });
    
    console.log(`   ✓ 创建了 ${members.length} 成员, ${projects.length} 项目, ${tasks.length} 任务`);
    console.log(`   ✓ 数据创建完成，耗时 ${(endTime - startTime).toFixed(2)}ms\n`);
  }

  private async testBasicQueries(): Promise<void> {
    console.log('3. 测试基础查询性能...');
    
    // 测试按状态查询任务
    const statusQueryTime = await this.measureQuery(async () => {
      return await db.tasks.where('status').equals('pending').toArray();
    }, '基础查询-按状态');

    // 测试按成员查询任务
    const memberQueryTime = await this.measureQuery(async () => {
      const members = await db.members.limit(1).toArray();
      if (members.length > 0) {
        return await db.tasks.where('memberId').equals(members[0].id).toArray();
      }
      return [];
    }, '基础查询-按成员');

    // 测试时间范围查询
    const dateRangeQueryTime = await this.measureQuery(async () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 6, 1);
      return await db.tasks
        .filter(task => task.startDate >= startDate && task.endDate <= endDate)
        .toArray();
    }, '基础查询-时间范围');

    console.log(`   ✓ 基础查询测试完成\n`);
  }

  private async testOptimizedQueries(): Promise<void> {
    console.log('4. 测试优化查询性能...');
    
    // 获取测试数据
    const projects = await db.projects.limit(5).toArray();
    const members = await db.members.limit(5).toArray();
    
    if (projects.length > 0) {
      // 测试项目+状态复合查询
      await this.measureQuery(async () => {
        return await queryUtils.getTasksByProjectAndStatus(projects[0].id, 'pending' as any);
      }, '优化查询-项目+状态');
    }

    if (members.length > 0) {
      // 测试成员+时间范围复合查询
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 6, 1);
      await this.measureQuery(async () => {
        return await queryUtils.getTasksByMemberAndDateRange(members[0].id, startDate, endDate);
      }, '优化查询-成员+时间');
    }

    // 测试团队+角色查询
    await this.measureQuery(async () => {
      return await db.members.where('[teamId+role]').equals(['team1', 'developer']).toArray();
    }, '优化查询-团队+角色');

    console.log(`   ✓ 优化查询测试完成\n`);
  }

  private async testIndexEffectiveness(): Promise<void> {
    console.log('5. 测试索引效果...');
    
    const indexInfo = await db.checkIndexes();
    console.log('   当前索引状态:');
    
    for (const [tableName, indexes] of Object.entries(indexInfo)) {
      console.log(`   ${tableName}: ${indexes.length} 个索引`);
    }

    this.testResults.push({
      test: '索引检查',
      totalIndexes: Object.values(indexInfo).reduce((sum, indexes) => sum + indexes.length, 0),
      status: 'success'
    });

    console.log(`   ✓ 索引检查完成\n`);
  }

  private async testPerformanceMonitoring(): Promise<void> {
    console.log('6. 测试性能监控...');
    
    // 执行一些查询以生成监控数据
    await db.tasks.where('status').equals('completed').limit(10).toArray();
    await db.members.where('isActive').equals(true).limit(10).toArray();
    
    // 获取性能报告
    const report = getPerformanceReport();
    
    console.log(`   平均查询时间: ${report.averageQueryTime.toFixed(2)}ms`);
    console.log(`   总查询数: ${report.totalQueries}`);
    console.log(`   慢查询数: ${report.slowQueries.length}`);
    
    this.testResults.push({
      test: '性能监控',
      averageQueryTime: report.averageQueryTime,
      totalQueries: report.totalQueries,
      slowQueries: report.slowQueries.length,
      status: 'success'
    });

    console.log(`   ✓ 性能监控测试完成\n`);
  }

  private async measureQuery(queryFn: () => Promise<any>, testName: string): Promise<number> {
    const startTime = performance.now();
    const result = await queryFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.testResults.push({
      test: testName,
      duration,
      resultCount: Array.isArray(result) ? result.length : 1,
      status: 'success'
    });
    
    console.log(`   ${testName}: ${duration.toFixed(2)}ms (${Array.isArray(result) ? result.length : 1} 条记录)`);
    
    return duration;
  }

  private generateTestReport(): void {
    console.log('=== IndexedDB 性能优化测试报告 ===\n');
    
    console.log('测试结果汇总:');
    this.testResults.forEach(result => {
      console.log(`  ${result.test}: ${result.duration?.toFixed(2) || 'N/A'}ms - ${result.status}`);
    });
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.status === 'success').length;
    const avgDuration = this.testResults
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / this.testResults.filter(r => r.duration).length;
    
    console.log(`\n总体统计:`);
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  成功测试: ${successfulTests}`);
    console.log(`  失败测试: ${totalTests - successfulTests}`);
    console.log(`  平均耗时: ${avgDuration.toFixed(2)}ms`);
    
    // 性能建议
    console.log(`\n性能建议:`);
    if (avgDuration > 50) {
      console.log(`  ⚠ 平均查询时间较长 (${avgDuration.toFixed(2)}ms)，建议检查索引优化`);
    } else {
      console.log(`  ✓ 查询性能良好`);
    }
    
    const slowQueries = this.testResults.filter(r => r.duration && r.duration > 100);
    if (slowQueries.length > 0) {
      console.log(`  ⚠ 发现 ${slowQueries.length} 个慢查询，建议进一步优化`);
    } else {
      console.log(`  ✓ 未发现慢查询`);
    }
    
    console.log('\n测试完成！');
  }
}

// 便捷测试函数
export const runPerformanceTest = async (): Promise<void> => {
  const tester = new PerformanceTest();
  await tester.runAllTests();
};

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runPerformanceTest().catch(console.error);
}