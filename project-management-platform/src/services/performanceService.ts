import { db } from './database';
import { PerformanceMetric, Task, TaskStatus, Member, Team } from '../types';

class PerformanceService {
  // 获取效能指标
  async getMetrics(
    period: 'week' | 'month' | 'quarter' | 'year',
    targetType: 'member' | 'team' | 'all',
    targetIds?: string[]
  ): Promise<PerformanceMetric[]> {
    let query = db.performanceMetrics.where('period').equals(period);

    if (targetType !== 'all') {
      query = query.filter(metric => metric.targetType === targetType);
    }

    if (targetIds && targetIds.length > 0) {
      query = query.filter(metric => targetIds.includes(metric.targetId));
    }

    return await query.orderBy('date').reverse().toArray();
  }

  // 计算效能指标
  async calculateMetrics(
    period: 'week' | 'month' | 'quarter' | 'year',
    dateRange?: { start: Date; end: Date }
  ): Promise<PerformanceMetric[]> {
    const { startDate, endDate } = this.getPeriodRange(period, dateRange);
    
    // 获取所有成员和团队
    const members = await db.members.where('isActive').equals(true).toArray();
    const teams = await db.teams.toArray();
    
    const metrics: PerformanceMetric[] = [];

    // 计算成员效能
    for (const member of members) {
      const memberMetric = await this.calculateMemberMetric(member, startDate, endDate, period);
      if (memberMetric) {
        metrics.push(memberMetric);
      }
    }

    // 计算团队效能
    for (const team of teams) {
      const teamMetric = await this.calculateTeamMetric(team, startDate, endDate, period);
      if (teamMetric) {
        metrics.push(teamMetric);
      }
    }

    // 批量保存到数据库
    if (metrics.length > 0) {
      await db.performanceMetrics.bulkPut(metrics);
    }

    return metrics;
  }

  // 计算单个成员的效能指标
  private async calculateMemberMetric(
    member: Member,
    startDate: Date,
    endDate: Date,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<PerformanceMetric | null> {
    // 获取成员在指定时间段内的任务
    const tasks = await db.tasks
      .where('memberId')
      .equals(member.id)
      .filter(task => 
        task.startDate <= endDate && task.endDate >= startDate
      )
      .toArray();

    if (tasks.length === 0) {
      return null;
    }

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    // 基础指标
    const storyPointsCompleted = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const personDaysInvested = completedTasks.reduce((sum, task) => sum + (task.actualPersonDays || 0), 0);
    const tasksCompleted = completedTasks.length;
    
    // 平均任务周期
    const avgTaskCycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const cycleTime = task.completedAt 
            ? (task.completedAt.getTime() - task.startDate.getTime()) / (1000 * 60 * 60) // 小时
            : 0;
          return sum + cycleTime;
        }, 0) / completedTasks.length
      : 0;

    // 计算指标
    const efficiencyScore = this.calculateEfficiencyScore(storyPointsCompleted, personDaysInvested);
    const velocity = this.calculateVelocity(storyPointsCompleted, startDate, endDate);
    const qualityScore = this.calculateQualityScore(completedTasks);

    const metric: PerformanceMetric = {
      id: `${member.id}-${this.formatDate(startDate)}-${period}`,
      targetId: member.id,
      targetType: 'member',
      date: startDate,
      period,
      storyPointsCompleted,
      personDaysInvested,
      tasksCompleted,
      avgTaskCycleTime,
      efficiencyScore,
      velocity,
      qualityScore,
      rank: 0, // 将在后面计算
      percentile: 0, // 将在后面计算
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return metric;
  }

  // 计算团队的效能指标
  private async calculateTeamMetric(
    team: Team,
    startDate: Date,
    endDate: Date,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<PerformanceMetric | null> {
    // 获取团队在指定时间段内的任务
    const tasks = await db.tasks
      .where('teamId')
      .equals(team.id)
      .filter(task => 
        task.startDate <= endDate && task.endDate >= startDate
      )
      .toArray();

    if (tasks.length === 0) {
      return null;
    }

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    // 基础指标
    const storyPointsCompleted = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const personDaysInvested = completedTasks.reduce((sum, task) => sum + (task.actualPersonDays || 0), 0);
    const tasksCompleted = completedTasks.length;
    
    // 平均任务周期
    const avgTaskCycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const cycleTime = task.completedAt 
            ? (task.completedAt.getTime() - task.startDate.getTime()) / (1000 * 60 * 60) // 小时
            : 0;
          return sum + cycleTime;
        }, 0) / completedTasks.length
      : 0;

    // 计算指标
    const efficiencyScore = this.calculateEfficiencyScore(storyPointsCompleted, personDaysInvested);
    const velocity = this.calculateVelocity(storyPointsCompleted, startDate, endDate);
    const qualityScore = this.calculateQualityScore(completedTasks);

    const metric: PerformanceMetric = {
      id: `${team.id}-${this.formatDate(startDate)}-${period}`,
      targetId: team.id,
      targetType: 'team',
      date: startDate,
      period,
      storyPointsCompleted,
      personDaysInvested,
      tasksCompleted,
      avgTaskCycleTime,
      efficiencyScore,
      velocity,
      qualityScore,
      rank: 0,
      percentile: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return metric;
  }

  // 计算效率分数
  private calculateEfficiencyScore(storyPoints: number, personDays: number): number {
    if (personDays === 0) return 0;
    // 效率 = 完成的故事点数 / 投入人天
    return storyPoints / personDays;
  }

  // 计算速率
  private calculateVelocity(storyPoints: number, startDate: Date, endDate: Date): number {
    const weeks = this.getWeeksBetween(startDate, endDate);
    if (weeks === 0) return 0;
    // 速率 = 每周完成的故事点数
    return storyPoints / weeks;
  }

  // 计算质量分数（简化版本）
  private calculateQualityScore(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    // 这里可以根据实际需要调整计算逻辑
    // 例如：基于重新工作的任务数量、缺陷率等
    // 目前简化处理，假设所有已完成任务的质量都是100%
    return 100;
  }

  // 重新计算所有指标
  async recalculateAll(): Promise<PerformanceMetric[]> {
    const periods: Array<'week' | 'month' | 'quarter' | 'year'> = ['week', 'month', 'quarter', 'year'];
    const allMetrics: PerformanceMetric[] = [];

    for (const period of periods) {
      const metrics = await this.calculateMetrics(period);
      allMetrics.push(...metrics);
    }

    // 计算排名
    await this.calculateRankings(allMetrics);

    return allMetrics;
  }

  // 计算排名
  private async calculateRankings(metrics: PerformanceMetric[]) {
    // 按目标类型和周期分组计算排名
    const groupedMetrics = this.groupMetricsByTypeAndPeriod(metrics);

    for (const group of groupedMetrics) {
      // 按效率分数排序
      const sortedMetrics = group.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
      
      sortedMetrics.forEach((metric, index) => {
        metric.rank = index + 1;
        metric.percentile = ((sortedMetrics.length - index) / sortedMetrics.length) * 100;
      });
    }

    // 更新数据库
    if (metrics.length > 0) {
      await db.performanceMetrics.bulkPut(metrics);
    }
  }

  // 按类型和周期分组指标
  private groupMetricsByTypeAndPeriod(metrics: PerformanceMetric[]): PerformanceMetric[][] {
    const groups: { [key: string]: PerformanceMetric[] } = {};

    metrics.forEach(metric => {
      const key = `${metric.targetType}-${metric.period}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(metric);
    });

    return Object.values(groups);
  }

  // 获取时间段范围
  private getPeriodRange(
    period: 'week' | 'month' | 'quarter' | 'year',
    dateRange?: { start: Date; end: Date }
  ): { startDate: Date; endDate: Date } {
    if (dateRange) {
      return dateRange;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  // 计算两个日期之间的周数
  private getWeeksBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)));
  }

  // 格式化日期为字符串
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // 获取排行榜
  async getLeaderboard(
    period: 'week' | 'month' | 'quarter' | 'year',
    targetType: 'member' | 'team',
    metric: 'efficiencyScore' | 'velocity' | 'qualityScore' = 'efficiencyScore',
    limit: number = 10
  ): Promise<PerformanceMetric[]> {
    const metrics = await this.getMetrics(period, targetType);
    
    return metrics
      .sort((a, b) => (b as any)[metric] - (a as any)[metric])
      .slice(0, limit);
  }
}

export const performanceService = new PerformanceService();