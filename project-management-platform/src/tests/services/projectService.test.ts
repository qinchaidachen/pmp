import { ProjectService } from '../../services/projectService';
import { mockProjects } from '../mocks/data';

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('应该返回所有项目', async () => {
      const mockDb = {
        projects: {
          orderBy: jest.fn().mockReturnThis(),
          reverse: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockProjects),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
        queryUtils: {},
      }));

      const result = await projectService.getAll();
      expect(result).toEqual(mockProjects);
      expect(mockDb.projects.orderBy).toHaveBeenCalledWith('startDate');
      expect(mockDb.projects.reverse).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('应该根据ID返回项目', async () => {
      const mockProject = mockProjects[0];
      const mockDb = {
        projects: {
          get: jest.fn().mockResolvedValue(mockProject),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.getById('project1');
      expect(result).toEqual(mockProject);
      expect(mockDb.projects.get).toHaveBeenCalledWith('project1');
    });

    it('应该处理未找到的项目', async () => {
      const mockDb = {
        projects: {
          get: jest.fn().mockResolvedValue(undefined),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.getById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    it('应该根据状态返回项目', async () => {
      const mockDb = {
        projects: {
          where: jest.fn().mockReturnThis(),
          equals: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockProjects),
        },
        optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
          return await callback();
        }),
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.getByStatus('active');
      expect(result).toEqual(mockProjects);
      expect(mockDb.optimizedQuery).toHaveBeenCalledWith(
        'projects',
        'getByStatus',
        expect.any(Function)
      );
    });
  });

  describe('getByBusinessLine', () => {
    it('应该根据业务线返回项目', async () => {
      const mockDb = {
        projects: {
          where: jest.fn().mockReturnThis(),
          equals: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockProjects),
        },
        optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
          return await callback();
        }),
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.getByBusinessLine('business1');
      expect(result).toEqual(mockProjects);
      expect(mockDb.optimizedQuery).toHaveBeenCalledWith(
        'projects',
        'getByBusinessLine',
        expect.any(Function)
      );
    });
  });

  describe('getActive', () => {
    it('应该返回活跃项目', async () => {
      const mockDb = {
        projects: {
          where: jest.fn().mockReturnThis(),
          equals: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockProjects),
        },
        optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
          return await callback();
        }),
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.getActive();
      expect(result).toEqual(mockProjects);
      expect(mockDb.optimizedQuery).toHaveBeenCalledWith(
        'projects',
        'getActive',
        expect.any(Function)
      );
    });
  });

  describe('getByStatusAndDateRange', () => {
    it('应该根据状态和日期范围返回项目', async () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-12-31');
      const mockQueryUtils = {
        getProjectsByStatusAndDateRange: jest.fn().mockResolvedValue(mockProjects),
      };

      jest.doMock('../../services/database', () => ({
        db: {},
        queryUtils: mockQueryUtils,
      }));

      const result = await projectService.getByStatusAndDateRange('active', startDate, endDate);
      expect(result).toEqual(mockProjects);
      expect(mockQueryUtils.getProjectsByStatusAndDateRange).toHaveBeenCalledWith(
        'active',
        startDate,
        endDate
      );
    });
  });

  describe('create', () => {
    it('应该创建新项目', async () => {
      const projectData = {
        name: '新项目',
        description: '项目描述',
        status: 'active' as const,
        owner: 'user1',
        members: ['user1', 'user2'],
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
      };

      const mockDb = {
        projects: {
          add: jest.fn().mockResolvedValue('new-id'),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      // Mock generateId method
      jest.spyOn(projectService as any, 'generateId').mockReturnValue('new-id');

      const result = await projectService.create(projectData);
      expect(result).toMatchObject({
        ...projectData,
        id: 'new-id',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockDb.projects.add).toHaveBeenCalledWith(result);
    });
  });

  describe('update', () => {
    it('应该更新项目', async () => {
      const updateData = { name: '更新的项目名称' };
      const mockDb = {
        projects: {
          update: jest.fn().mockResolvedValue(1),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.update('project1', updateData);
      expect(result).toBe(true);
      expect(mockDb.projects.update).toHaveBeenCalledWith('project1', updateData);
    });

    it('应该处理更新失败', async () => {
      const updateData = { name: '更新的项目名称' };
      const mockDb = {
        projects: {
          update: jest.fn().mockResolvedValue(0),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      const result = await projectService.update('non-existent', updateData);
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('应该删除项目', async () => {
      const mockDb = {
        projects: {
          delete: jest.fn().mockResolvedValue(undefined),
        },
      };

      jest.doMock('../../services/database', () => ({
        db: mockDb,
      }));

      await projectService.delete('project1');
      expect(mockDb.projects.delete).toHaveBeenCalledWith('project1');
    });
  });
});