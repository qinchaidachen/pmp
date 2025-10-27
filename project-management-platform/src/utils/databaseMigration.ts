import { db } from '../services/database';
import { DataValidator } from './dataValidation';
import { Member, Task, Project, Team, Resource, ResourceBooking, PerformanceMetric, BusinessLine, Role } from '../types';

// 迁移版本管理
interface MigrationVersion {
  version: number;
  name: string;
  description: string;
  timestamp: Date;
}

// 迁移记录
interface MigrationRecord {
  id: string;
  version: number;
  name: string;
  executedAt: Date;
  success: boolean;
  error?: string;
}

// 数据库迁移管理器
export class DatabaseMigrationManager {
  private static readonly MIGRATION_STORAGE_KEY = 'pm_migration_history';
  private static readonly CURRENT_VERSION = 1;

  // 获取当前数据库版本
  static async getCurrentVersion(): Promise<number> {
    try {
      const stored = localStorage.getItem(this.MIGRATION_STORAGE_KEY);
      if (!stored) return 0;

      const migrations: MigrationRecord[] = JSON.parse(stored);
      const latestMigration = migrations
        .filter(m => m.success)
        .sort((a, b) => b.version - a.version)[0];

      return latestMigration ? latestMigration.version : 0;
    } catch (error) {
      console.error('获取数据库版本失败:', error);
      return 0;
    }
  }

  // 执行迁移
  static async runMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion >= this.CURRENT_VERSION) {
      console.log('数据库已是最新版本');
      return;
    }

    console.log(`开始数据库迁移: ${currentVersion} -> ${this.CURRENT_VERSION}`);

    try {
      // 按顺序执行迁移
      for (let version = currentVersion + 1; version <= this.CURRENT_VERSION; version++) {
        await this.executeMigration(version);
      }

      console.log('数据库迁移完成');
    } catch (error) {
      console.error('数据库迁移失败:', error);
      throw error;
    }
  }

  // 执行单个迁移
  private static async executeMigration(version: number): Promise<void> {
    const migration = this.getMigration(version);
    if (!migration) {
      throw new Error(`未找到版本 ${version} 的迁移脚本`);
    }

    console.log(`执行迁移: ${migration.name}`);

    try {
      await migration.up();
      
      // 记录迁移成功
      await this.recordMigration({
        id: `migration_${version}`,
        version,
        name: migration.name,
        executedAt: new Date(),
        success: true,
      });

      console.log(`迁移 ${migration.name} 执行成功`);
    } catch (error) {
      // 记录迁移失败
      await this.recordMigration({
        id: `migration_${version}`,
        version,
        name: migration.name,
        executedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error(`迁移 ${migration.name} 执行失败:`, error);
      throw error;
    }
  }

  // 记录迁移历史
  private static async recordMigration(record: MigrationRecord): Promise<void> {
    try {
      const stored = localStorage.getItem(this.MIGRATION_STORAGE_KEY);
      const migrations: MigrationRecord[] = stored ? JSON.parse(stored) : [];
      
      // 移除同版本的历史记录
      const filteredMigrations = migrations.filter(m => m.version !== record.version);
      filteredMigrations.push(record);
      
      localStorage.setItem(this.MIGRATION_STORAGE_KEY, JSON.stringify(filteredMigrations));
    } catch (error) {
      console.error('记录迁移历史失败:', error);
    }
  }

  // 获取迁移脚本
  private static getMigration(version: number): { name: string; up: () => Promise<void> } | null {
    const migrations: { [key: number]: { name: string; up: () => Promise<void> } } = {
      1: {
        name: 'Initial Database Schema',
        up: this.migrateToVersion1,
      },
    };

    return migrations[version] || null;
  }

  // 迁移到版本1：初始化数据库架构
  private static async migrateToVersion1(): Promise<void> {
    console.log('初始化数据库架构...');

    // 创建示例数据
    await this.createInitialData();
    
    console.log('数据库架构初始化完成');
  }

  // 创建初始数据
  private static async createInitialData(): Promise<void> {
    try {
      // 检查是否已有数据
      const memberCount = await db.members.count();
      if (memberCount > 0) {
        console.log('数据库已有数据，跳过初始化');
        return;
      }

      // 创建业务线
      const businessLines: Omit<BusinessLine, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Web开发',
          description: 'Web应用开发业务线',
          ownerIds: [],
          color: '#1890ff',
        },
        {
          name: '移动开发',
          description: '移动应用开发业务线',
          ownerIds: [],
          color: '#52c41a',
        },
        {
          name: '数据分析',
          description: '数据分析和AI业务线',
          ownerIds: [],
          color: '#faad14',
        },
      ];

      const createdBusinessLines = await db.businessLines.bulkAdd(
        businessLines.map(bl => ({
          ...bl,
          id: `bl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建角色
      const roles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: '前端工程师',
          description: '负责前端界面开发',
          permissions: ['task.create', 'task.update', 'task.view'],
        },
        {
          name: '后端工程师',
          description: '负责后端服务开发',
          permissions: ['task.create', 'task.update', 'task.view', 'api.manage'],
        },
        {
          name: 'UI设计师',
          description: '负责界面设计',
          permissions: ['task.create', 'task.update', 'task.view', 'design.create'],
        },
        {
          name: '测试工程师',
          description: '负责质量保证',
          permissions: ['task.create', 'task.update', 'task.view', 'test.execute'],
        },
        {
          name: '产品经理',
          description: '负责产品规划',
          permissions: ['task.create', 'task.update', 'task.view', 'project.manage'],
        },
      ];

      await db.roles.bulkAdd(
        roles.map(role => ({
          ...role,
          id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建团队
      const teams: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: '前端团队',
          description: '负责Web前端开发',
          memberIds: [],
          projectIds: [],
          businessLineId: (createdBusinessLines as any[])[0].id,
        },
        {
          name: '后端团队',
          description: '负责后端服务开发',
          memberIds: [],
          projectIds: [],
          businessLineId: (createdBusinessLines as any[])[0].id,
        },
        {
          name: '移动团队',
          description: '负责移动应用开发',
          memberIds: [],
          projectIds: [],
          businessLineId: (createdBusinessLines as any[])[1].id,
        },
      ];

      const createdTeams = await db.teams.bulkAdd(
        teams.map(team => ({
          ...team,
          id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建成员
      const members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: '张三',
          role: '前端工程师',
          email: 'zhangsan@example.com',
          teamId: (createdTeams as any[])[0].id,
          isActive: true,
        },
        {
          name: '李四',
          role: '后端工程师',
          email: 'lisi@example.com',
          teamId: (createdTeams as any[])[1].id,
          isActive: true,
        },
        {
          name: '王五',
          role: 'UI设计师',
          email: 'wangwu@example.com',
          teamId: (createdTeams as any[])[0].id,
          isActive: true,
        },
        {
          name: '赵六',
          role: '测试工程师',
          email: 'zhaoliu@example.com',
          teamId: (createdTeams as any[])[1].id,
          isActive: true,
        },
        {
          name: '孙七',
          role: '产品经理',
          email: 'sunqi@example.com',
          isActive: true,
        },
      ];

      const createdMembers = await db.members.bulkAdd(
        members.map(member => ({
          ...member,
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建项目
      const projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: '企业官网重构',
          description: '重新设计并开发企业官方网站',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: 'active',
          taskIds: [],
          teamIds: [(createdTeams as any[])[0].id, (createdTeams as any[])[1].id],
          businessLineId: (createdBusinessLines as any[])[0].id,
        },
        {
          name: '移动App开发',
          description: '开发企业移动应用',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-06-30'),
          status: 'planning',
          taskIds: [],
          teamIds: [(createdTeams as any[])[2].id],
          businessLineId: (createdBusinessLines as any[])[1].id,
        },
      ];

      const createdProjects = await db.projects.bulkAdd(
        projects.map(project => ({
          ...project,
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建资源
      const resources: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: '大会议室A',
          type: 'meetingRoom' as any,
          description: '可容纳20人的大型会议室',
          location: '3楼',
          capacity: 20,
          isAvailable: true,
        },
        {
          name: '小会议室B',
          type: 'meetingRoom' as any,
          description: '可容纳8人的小型会议室',
          location: '3楼',
          capacity: 8,
          isAvailable: true,
        },
        {
          name: '测试服务器',
          type: 'testDevice' as any,
          description: '用于功能测试的服务器环境',
          location: '机房',
          isAvailable: true,
        },
      ];

      await db.resources.bulkAdd(
        resources.map(resource => ({
          ...resource,
          id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      // 创建示例任务
      const tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          title: '登录页面开发',
          description: '实现用户登录界面和表单验证',
          memberId: (createdMembers as any[])[0].id,
          projectId: (createdProjects as any[])[0].id,
          teamId: (createdTeams as any[])[0].id,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-07'),
          status: 'completed' as any,
          storyPoints: 5,
          actualPersonDays: 3,
          estimatedPersonDays: 4,
          tags: ['前端', '认证'],
          completedAt: new Date('2024-01-06'),
        },
        {
          title: 'API接口开发',
          description: '开发用户认证相关的后端API',
          memberId: (createdMembers as any[])[1].id,
          projectId: (createdProjects as any[])[0].id,
          teamId: (createdTeams as any[])[1].id,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-10'),
          status: 'inProgress' as any,
          storyPoints: 8,
          estimatedPersonDays: 6,
          tags: ['后端', 'API', '认证'],
        },
        {
          title: '首页组件开发',
          description: '开发应用首页的React组件',
          memberId: (createdMembers as any[])[0].id,
          projectId: (createdProjects as any[])[0].id,
          teamId: (createdTeams as any[])[0].id,
          startDate: new Date('2024-01-08'),
          endDate: new Date('2024-01-15'),
          status: 'pending' as any,
          storyPoints: 6,
          estimatedPersonDays: 5,
          tags: ['前端', '组件'],
        },
      ];

      await db.tasks.bulkAdd(
        tasks.map(task => ({
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      console.log('初始数据创建完成');
    } catch (error) {
      console.error('创建初始数据失败:', error);
      throw error;
    }
  }

  // 重置数据库（仅用于开发/测试）
  static async resetDatabase(): Promise<void> {
    console.log('重置数据库...');
    
    await db.delete();
    await db.open();
    
    // 清除迁移历史
    localStorage.removeItem(this.MIGRATION_STORAGE_KEY);
    
    // 重新执行迁移
    await this.runMigrations();
    
    console.log('数据库重置完成');
  }

  // 获取迁移历史
  static async getMigrationHistory(): Promise<MigrationRecord[]> {
    try {
      const stored = localStorage.getItem(this.MIGRATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('获取迁移历史失败:', error);
      return [];
    }
  }
}