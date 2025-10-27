import { db, queryUtils } from './database';
import { Member, FilterOptions } from '../types';

class MemberService {
  // 获取所有成员
  async getAll(): Promise<Member[]> {
    return await db.members.orderBy('name').toArray();
  }

  // 根据ID获取成员
  async getById(id: string): Promise<Member | undefined> {
    return await db.members.get(id);
  }

  // 根据团队ID获取成员
  async getByTeamId(teamId: string): Promise<Member[]> {
    return await db.optimizedQuery('members', 'getByTeamId', async () => {
      return await db.members.where('teamId').equals(teamId).toArray();
    });
  }

  // 根据角色获取成员
  async getByRole(role: string): Promise<Member[]> {
    return await db.optimizedQuery('members', 'getByRole', async () => {
      return await db.members.where('role').equals(role).toArray();
    });
  }

  // 根据团队和角色获取成员（优化查询）
  async getByTeamAndRole(teamId: string, role: string): Promise<Member[]> {
    return await queryUtils.getMembersByTeamAndRole(teamId, role);
  }

  // 获取团队中的活跃成员（优化查询）
  async getActiveMembersByTeam(teamId: string): Promise<Member[]> {
    return await queryUtils.getActiveMembersByTeam(teamId);
  }

  // 筛选成员
  async getFiltered(filters: FilterOptions): Promise<Member[]> {
    let query = db.members.toCollection();

    if (filters.memberIds && filters.memberIds.length > 0) {
      query = query.filter(member => filters.memberIds!.includes(member.id));
    }

    if (filters.teamIds && filters.teamIds.length > 0) {
      query = query.filter(member => member.teamId && filters.teamIds!.includes(member.teamId));
    }

    return await query.toArray();
  }

  // 创建成员
  async create(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const member: Member = {
      ...memberData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.members.add(member);
    return member;
  }

  // 更新成员
  async update(id: string, updates: Partial<Member>): Promise<Member> {
    const existingMember = await db.members.get(id);
    if (!existingMember) {
      throw new Error(`成员ID ${id} 不存在`);
    }

    const updatedMember = {
      ...existingMember,
      ...updates,
      updatedAt: new Date(),
    };

    await db.members.put(updatedMember);
    return updatedMember;
  }

  // 删除成员
  async delete(id: string): Promise<void> {
    const member = await db.members.get(id);
    if (!member) {
      throw new Error(`成员ID ${id} 不存在`);
    }

    // 检查是否有相关任务
    const relatedTasks = await db.tasks.where('memberId').equals(id).count();
    if (relatedTasks > 0) {
      throw new Error(`无法删除成员，该成员还有 ${relatedTasks} 个相关任务`);
    }

    await db.members.delete(id);
  }

  // 批量创建成员
  async createBatch(membersData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Member[]> {
    const members = membersData.map(data => ({
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.members.bulkAdd(members);
    return members;
  }

  // 获取活跃成员数量
  async getActiveCount(): Promise<number> {
    return await db.optimizedQuery('members', 'getActiveCount', async () => {
      return await db.members.where('isActive').equals(true).count();
    });
  }

  // 获取成员统计信息
  async getStats() {
    const total = await db.members.count();
    const active = await db.members.where('isActive').equals(true).count();
    const inactive = total - active;

    // 按角色统计
    const members = await db.members.toArray();
    const roleStats = members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按团队统计
    const teamStats = members.reduce((acc, member) => {
      if (member.teamId) {
        acc[member.teamId] = (acc[member.teamId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      roleStats,
      teamStats,
    };
  }

  // 搜索成员
  async search(query: string): Promise<Member[]> {
    const lowerQuery = query.toLowerCase();
    return await db.members
      .filter(member => 
        member.name.toLowerCase().includes(lowerQuery) ||
        member.role.toLowerCase().includes(lowerQuery) ||
        (member.email && member.email.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  // 生成唯一ID
  private generateId(): string {
    return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const memberService = new MemberService();