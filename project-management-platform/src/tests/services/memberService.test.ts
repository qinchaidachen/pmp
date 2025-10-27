import { MemberService } from '../../services/memberService';
import { mockMembers } from '../mocks/data';

describe('MemberService', () => {
  let memberService: MemberService;

  beforeEach(() => {
    memberService = new MemberService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('应该返回所有成员', async () => {
      const mockDb = {
        members: {
          orderBy: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockMembers),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
        queryUtils: {},
      }));

      const result = await memberService.getAll();
      expect(result).toEqual(mockMembers);
      expect(mockDb.members.orderBy).toHaveBeenCalledWith('name');
    });
  });

  describe('getById', () => {
    it('应该根据ID返回成员', async () => {
      const mockMember = mockMembers[0];
      const mockDb = {
        members: {
          get: jest.fn().mockResolvedValue(mockMember),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getById('user1');
      expect(result).toEqual(mockMember);
      expect(mockDb.members.get).toHaveBeenCalledWith('user1');
    });

    it('应该处理未找到的成员', async () => {
      const mockDb = {
        members: {
          get: jest.fn().mockResolvedValue(undefined),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getByTeamId', () => {
    it('应该根据团队ID返回成员', async () => {
      const mockDb = {
        members: {
          where: jest.fn().mockReturnThis(),
          equals: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([mockMembers[0]]),
        },
        optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
          return await callback();
        }),
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getByTeamId('team1');
      expect(result).toHaveLength(1);
      expect(mockDb.optimizedQuery).toHaveBeenCalledWith(
        'members',
        'getByTeamId',
        expect.any(Function)
      );
    });
  });

  describe('getByRole', () => {
    it('应该根据角色返回成员', async () => {
      const mockDb = {
        members: {
          where: jest.fn().mockReturnThis(),
          equals: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([mockMembers[0]]),
        },
        optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
          return await callback();
        }),
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getByRole('developer');
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('developer');
    });
  });

  describe('getByTeamAndRole', () => {
    it('应该根据团队和角色返回成员', async () => {
      const mockQueryUtils = {
        getMembersByTeamAndRole: jest.fn().mockResolvedValue([mockMembers[0]]),
      };

      jest.doMock('../../services/database', () => ({
        db: {},
        queryUtils: mockQueryUtils,
      }));

      const result = await memberService.getByTeamAndRole('team1', 'developer');
      expect(result).toHaveLength(1);
      expect(mockQueryUtils.getMembersByTeamAndRole).toHaveBeenCalledWith('team1', 'developer');
    });
  });

  describe('getActiveMembersByTeam', () => {
    it('应该返回团队中的活跃成员', async () => {
      const mockQueryUtils = {
        getActiveMembersByTeam: jest.fn().mockResolvedValue(mockMembers),
      };

      jest.doMock('../../services/database', () => ({
        db: {},
        queryUtils: mockQueryUtils,
      }));

      const result = await memberService.getActiveMembersByTeam('team1');
      expect(result).toEqual(mockMembers);
      expect(mockQueryUtils.getActiveMembersByTeam).toHaveBeenCalledWith('team1');
    });
  });

  describe('getFiltered', () => {
    it('应该根据成员ID筛选成员', async () => {
      const filters = { memberIds: ['user1'] };
      const mockDb = {
        members: {
          toCollection: jest.fn().mockReturnThis(),
          filter: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([mockMembers[0]]),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getFiltered(filters);
      expect(result).toHaveLength(1);
      expect(mockDb.members.toCollection).toHaveBeenCalled();
    });

    it('应该根据团队ID筛选成员', async () => {
      const filters = { teamIds: ['team1'] };
      const mockDb = {
        members: {
          toCollection: jest.fn().mockReturnThis(),
          filter: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([mockMembers[0]]),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getFiltered(filters);
      expect(result).toHaveLength(1);
    });

    it('应该处理空筛选条件', async () => {
      const filters = {};
      const mockDb = {
        members: {
          toCollection: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockMembers),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await memberService.getFiltered(filters);
      expect(result).toEqual(mockMembers);
      expect(mockDb.members.toCollection).toHaveBeenCalled();
    });
  });
});