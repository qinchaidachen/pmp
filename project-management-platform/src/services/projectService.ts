import { db, queryUtils } from './database';
import { Project } from '../types';

class ProjectService {
  // 获取所有项目
  async getAll(): Promise<Project[]> {
    return await db.projects.orderBy('startDate').reverse().toArray();
  }

  // 根据ID获取项目
  async getById(id: string): Promise<Project | undefined> {
    return await db.projects.get(id);
  }

  // 根据状态获取项目
  async getByStatus(status: Project['status']): Promise<Project[]> {
    return await db.optimizedQuery('projects', 'getByStatus', async () => {
      return await db.projects.where('status').equals(status).toArray();
    });
  }

  // 根据业务线获取项目
  async getByBusinessLine(businessLineId: string): Promise<Project[]> {
    return await db.optimizedQuery('projects', 'getByBusinessLine', async () => {
      return await db.projects.where('businessLineId').equals(businessLineId).toArray();
    });
  }

  // 获取活跃项目
  async getActive(): Promise<Project[]> {
    return await db.optimizedQuery('projects', 'getActive', async () => {
      return await db.projects.where('status').equals('active').toArray();
    });
  }

  // 根据状态和日期范围获取项目（优化查询）
  async getByStatusAndDateRange(status: Project['status'], startDate: Date, endDate: Date): Promise<Project[]> {
    return await queryUtils.getProjectsByStatusAndDateRange(status, startDate, endDate);
  }

  // 创建项目
  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.projects.add(project);
    return project;
  }

  // 更新项目
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const existingProject = await db.projects.get(id);
    if (!existingProject) {
      throw new Error(`项目ID ${id} 不存在`);
    }

    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date(),
    };

    await db.projects.put(updatedProject);
    return updatedProject;
  }

  // 删除项目
  async delete(id: string): Promise<void> {
    const project = await db.projects.get(id);
    if (!project) {
      throw new Error(`项目ID ${id} 不存在`);
    }

    // 检查是否有相关任务
    const relatedTasks = await db.tasks.where('projectId').equals(id).count();
    if (relatedTasks > 0) {
      throw new Error(`无法删除项目，该项目还有 ${relatedTasks} 个相关任务`);
    }

    await db.projects.delete(id);
  }

  // 获取项目统计信息
  async getStats() {
    const projects = await db.projects.toArray();
    
    const total = projects.length;
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<Project['status'], number>);

    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const planning = projects.filter(p => p.status === 'planning').length;

    // 按业务线统计
    const businessLineStats = projects.reduce((acc, project) => {
      if (project.businessLineId) {
        acc[project.businessLineId] = (acc[project.businessLineId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      completed,
      planning,
      byStatus,
      businessLineStats,
    };
  }

  // 获取项目进度
  async getProgress(id: string) {
    const project = await this.getById(id);
    if (!project) {
      throw new Error(`项目ID ${id} 不存在`);
    }

    const tasks = await db.tasks.where('projectId').equals(id).toArray();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const storyPointProgress = totalStoryPoints > 0 ? completedStoryPoints / totalStoryPoints : 0;

    return {
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completedStoryPoints,
      taskProgress,
      storyPointProgress,
      isOverdue: new Date() > project.endDate && storyPointProgress < 1,
    };
  }

  // 搜索项目
  async search(query: string): Promise<Project[]> {
    const lowerQuery = query.toLowerCase();
    return await db.projects
      .filter(project => 
        project.name.toLowerCase().includes(lowerQuery) ||
        (project.description && project.description.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  // 生成唯一ID
  private generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const projectService = new ProjectService();