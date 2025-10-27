import { TaskService } from '../../services/taskService';
import { mockTasks } from '../mocks/data';

// Mock database
const mockDb = {
  tasks: {
    orderBy: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(mockTasks),
    get: jest.fn().mockResolvedValue(mockTasks[0]),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
  },
  optimizedQuery: jest.fn().mockImplementation(async (_, __, callback) => {
    return await callback();
  }),
};

jest.mock('../../services/database', () => ({
  db: mockDb,
  queryUtils: {},
}));

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('应该返回所有任务', async () => {
      const result = await taskService.getAll();
      expect(result).toEqual(mockTasks);
      expect(mockDb.tasks.orderBy).toHaveBeenCalledWith('startDate');
    });

    it('应该应用过滤条件', async () => {
      const filteredTasks = [mockTasks[0]];
      mockDb.tasks.orderBy.mockReturnThis();
      mockDb.tasks.toArray.mockResolvedValue(filteredTasks);

      const result = await taskService.getAll({ status: 'todo' });
      expect(result).toEqual(filteredTasks);
    });
  });

  describe('getById', () => {
    it('应该根据ID返回任务', async () => {
      const result = await taskService.getById('1');
      expect(result).toEqual(mockTasks[0]);
      expect(mockDb.tasks.get).toHaveBeenCalledWith('1');
    });

    it('应该处理未找到的任务', async () => {
      mockDb.tasks.get.mockResolvedValue(undefined);
      const result = await taskService.getById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getByMemberId', () => {
    it('应该根据成员ID返回任务', async () => {
      const result = await taskService.getByMemberId('user1');
      expect(result).toEqual(mockTasks);
      expect(mockDb.tasks.where).toHaveBeenCalledWith('memberId');
      expect(mockDb.tasks.equals).toHaveBeenCalledWith('user1');
    });
  });

  describe('getByStatus', () => {
    it('应该根据状态返回任务', async () => {
      const result = await taskService.getByStatus('todo');
      expect(result).toEqual(mockTasks);
      expect(mockDb.optimizedQuery).toHaveBeenCalled();
    });
  });

  describe('getByDateRange', () => {
    it('应该返回指定时间范围内的任务', async () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-12-31');
      const result = await taskService.getByDateRange(startDate, endDate);
      expect(result).toEqual(mockTasks);
      expect(mockDb.tasks.filter).toHaveBeenCalled();
    });
  });
});