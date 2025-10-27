import { db } from './database';
import { Team } from '../types';

class TeamService {
  // 获取所有团队
  async getAll(): Promise<Team[]> {
    return await db.teams.orderBy('name').toArray();
  }

  // 根据ID获取团队
  async getById(id: string): Promise<Team | undefined> {
    return await db.teams.get(id);
  }

  // 根据业务线获取团队
  async getByBusinessLine(businessLineId: string): Promise<Team[]> {
    return await db.teams.where('businessLineId').equals(businessLineId).toArray();
  }

  // 获取团队的成员
  async getTeamMembers(teamId: string) {
    const team = await this.getById(teamId);
    if (!team) {
      throw new Error(`团队ID ${teamId} 不存在`);
    }

    const members = await Promise.all(
      team.memberIds.map(memberId => db.members.get(memberId))
    );

    return members.filter(member => member !== undefined);
  }

  // 创建团队
  async create(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const team: Team = {
      ...teamData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.teams.add(team);
    return team;
  }

  // 更新团队
  async update(id: string, updates: Partial<Team>): Promise<Team> {
    const existingTeam = await db.teams.get(id);
    if (!existingTeam) {
      throw new Error(`团队ID ${id} 不存在`);
    }

    const updatedTeam = {
      ...existingTeam,
      ...updates,
      updatedAt: new Date(),
    };

    await db.teams.put(updatedTeam);
    return updatedTeam;
  }

  // 删除团队
  async delete(id: string): Promise<void> {
    const team = await db.teams.get(id);
    if (!team) {
      throw new Error(`团队ID ${id} 不存在`);
    }

    // 检查是否有相关任务
    const relatedTasks = await db.tasks.where('teamId').equals(id).count();
    if (relatedTasks > 0) {
      throw new Error(`无法删除团队，该团队还有 ${relatedTasks} 个相关任务`);
    }

    // 更新成员的团队ID
    await db.members.where('teamId').equals(id).modify({ teamId: undefined });

    await db.teams.delete(id);
  }

  // 添加成员到团队
  async addMember(teamId: string, memberId: string): Promise<Team> {
    const team = await this.getById(teamId);
    if (!team) {
      throw new Error(`团队ID ${teamId} 不存在`);
    }

    if (!team.memberIds.includes(memberId)) {
      team.memberIds.push(memberId);
      await this.update(teamId, { memberIds: team.memberIds });
      
      // 同时更新成员的团队ID
      await db.members.update(memberId, { teamId });
    }

    return team;
  }

  // 从团队移除成员
  async removeMember(teamId: string, memberId: string): Promise<Team> {
    const team = await this.getById(teamId);
    if (!team) {
      throw new Error(`团队ID ${teamId} 不存在`);
    }

    team.memberIds = team.memberIds.filter(id => id !== memberId);
    await this.update(teamId, { memberIds: team.memberIds });
    
    // 同时更新成员的团队ID
    await db.members.update(memberId, { teamId: undefined });

    return team;
  }

  // 获取团队统计信息
  async getStats() {
    const teams = await db.teams.toArray();
    
    const total = teams.length;
    const totalMembers = teams.reduce((sum, team) => sum + team.memberIds.length, 0);
    const avgTeamSize = total > 0 ? totalMembers / total : 0;

    // 按业务线统计
    const businessLineStats = teams.reduce((acc, team) => {
      if (team.businessLineId) {
        acc[team.businessLineId] = (acc[team.businessLineId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 团队规模分布
    const sizeDistribution = teams.reduce((acc, team) => {
      const size = team.memberIds.length;
      if (size === 0) acc.small++;
      else if (size <= 5) acc.medium++;
      else if (size <= 10) acc.large++;
      else acc.xlarge++;
      return acc;
    }, { small: 0, medium: 0, large: 0, xlarge: 0 });

    return {
      total,
      totalMembers,
      avgTeamSize,
      businessLineStats,
      sizeDistribution,
    };
  }

  // 获取团队效能统计
  async getTeamPerformance(teamId: string, startDate?: Date, endDate?: Date) {
    const team = await this.getById(teamId);
    if (!team) {
      throw new Error(`团队ID ${teamId} 不存在`);
    }

    let query = db.tasks.where('teamId').equals(teamId);
    
    if (startDate && endDate) {
      query = query.filter(task => 
        task.startDate <= endDate && task.endDate >= startDate
      );
    }

    const tasks = await query.toArray();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedStoryPoints = tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const velocity = completedStoryPoints / (startDate && endDate ? 
      this.getWeeksBetween(startDate, endDate) : 4); // 默认4周

    return {
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completedStoryPoints,
      velocity,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      storyPointProgress: totalStoryPoints > 0 ? completedStoryPoints / totalStoryPoints : 0,
    };
  }

  // 搜索团队
  async search(query: string): Promise<Team[]> {
    const lowerQuery = query.toLowerCase();
    return await db.teams
      .filter(team => 
        team.name.toLowerCase().includes(lowerQuery) ||
        (team.description && team.description.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  // 计算两个日期之间的周数
  private getWeeksBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
  }

  // 生成唯一ID
  private generateId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const teamService = new TeamService();