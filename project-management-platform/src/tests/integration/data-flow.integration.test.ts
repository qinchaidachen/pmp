import { store } from '../../stores';
import { fetchTasks } from '../../stores/slices/tasksSlice';
import { fetchMembers } from '../../stores/slices/membersSlice';
import { fetchProjects } from '../../stores/slices/projectsSlice';
import { mockTasks, mockMembers, mockProjects } from '../mocks/data';

// Mock services
jest.mock('../../services/taskService', () => ({
  taskService: {
    getAll: jest.fn().mockResolvedValue(mockTasks),
    getById: jest.fn().mockResolvedValue(mockTasks[0]),
    create: jest.fn().mockResolvedValue(mockTasks[0]),
    update: jest.fn().mockResolvedValue(mockTasks[0]),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../services/memberService', () => ({
  memberService: {
    getAll: jest.fn().mockResolvedValue(mockMembers),
    getById: jest.fn().mockResolvedValue(mockMembers[0]),
    create: jest.fn().mockResolvedValue(mockMembers[0]),
    update: jest.fn().mockResolvedValue(mockMembers[0]),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../services/projectService', () => ({
  projectService: {
    getAll: jest.fn().mockResolvedValue(mockProjects),
    getById: jest.fn().mockResolvedValue(mockProjects[0]),
    create: jest.fn().mockResolvedValue(mockProjects[0]),
    update: jest.fn().mockResolvedValue(mockProjects[0]),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置store状态
    store.dispatch({ type: 'RESET_STATE' });
  });

  describe('Redux Store Integration', () => {
    it('应该正确初始化store状态', () => {
      const state = store.getState();
      
      expect(state.tasks.tasks).toEqual([]);
      expect(state.tasks.loading).toBe(false);
      expect(state.tasks.error).toBeNull();
      
      expect(state.members.members).toEqual([]);
      expect(state.members.loading).toBe(false);
      expect(state.members.error).toBeNull();
      
      expect(state.projects.projects).toEqual([]);
      expect(state.projects.loading).toBe(false);
      expect(state.projects.error).toBeNull();
    });

    it('应该正确处理异步数据加载', async () => {
      // 触发任务获取
      await store.dispatch(fetchTasks());
      
      let state = store.getState();
      expect(state.tasks.loading).toBe(true);
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));
      
      state = store.getState();
      expect(state.tasks.loading).toBe(false);
      expect(state.tasks.tasks).toEqual(mockTasks);
      expect(state.tasks.error).toBeNull();
    });

    it('应该正确处理成员数据加载', async () => {
      await store.dispatch(fetchMembers());
      
      let state = store.getState();
      expect(state.members.loading).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      state = store.getState();
      expect(state.members.loading).toBe(false);
      expect(state.members.members).toEqual(mockMembers);
    });

    it('应该正确处理项目数据加载', async () => {
      await store.dispatch(fetchProjects());
      
      let state = store.getState();
      expect(state.projects.loading).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      state = store.getState();
      expect(state.projects.loading).toBe(false);
      expect(state.projects.projects).toEqual(mockProjects);
    });
  });

  describe('Service Layer Integration', () => {
    it('taskService应该正确与Redux集成', async () => {
      const { taskService } = require('../../services/taskService');
      
      // Mock数据库响应
      taskService.getAll.mockResolvedValueOnce(mockTasks);
      
      await store.dispatch(fetchTasks());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      expect(state.tasks.tasks).toEqual(mockTasks);
      expect(taskService.getAll).toHaveBeenCalled();
    });

    it('memberService应该正确与Redux集成', async () => {
      const { memberService } = require('../../services/memberService');
      
      memberService.getAll.mockResolvedValueOnce(mockMembers);
      
      await store.dispatch(fetchMembers());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      expect(state.members.members).toEqual(mockMembers);
      expect(memberService.getAll).toHaveBeenCalled();
    });

    it('projectService应该正确与Redux集成', async () => {
      const { projectService } = require('../../services/projectService');
      
      projectService.getAll.mockResolvedValueOnce(mockProjects);
      
      await store.dispatch(fetchProjects());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      expect(state.projects.projects).toEqual(mockProjects);
      expect(projectService.getAll).toHaveBeenCalled();
    });
  });

  describe('Cross-Slice Data Dependencies', () => {
    it('任务和成员数据应该正确关联', async () => {
      // 加载成员数据
      await store.dispatch(fetchMembers());
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 加载任务数据
      await store.dispatch(fetchTasks());
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      
      // 验证数据正确加载
      expect(state.members.members).toHaveLength(2);
      expect(state.tasks.tasks).toHaveLength(2);
      
      // 验证任务中的成员引用
      const taskWithAssignee = state.tasks.tasks.find(task => task.assignee === 'user1');
      expect(taskWithAssignee).toBeDefined();
      
      const member = state.members.members.find(m => m.id === 'user1');
      expect(member).toBeDefined();
    });

    it('项目和任务数据应该正确关联', async () => {
      // 加载项目数据
      await store.dispatch(fetchProjects());
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 加载任务数据
      await store.dispatch(fetchTasks());
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      
      // 验证数据正确加载
      expect(state.projects.projects).toHaveLength(1);
      expect(state.tasks.tasks).toHaveLength(2);
      
      // 验证任务中的项目引用
      const taskWithProject = state.tasks.tasks.find(task => task.projectId === 'project1');
      expect(taskWithProject).toBeDefined();
      
      const project = state.projects.projects.find(p => p.id === 'project1');
      expect(project).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('应该正确处理服务层错误', async () => {
      const { taskService } = require('../../services/taskService');
      
      // 模拟服务错误
      taskService.getAll.mockRejectedValueOnce(new Error('服务不可用'));
      
      await store.dispatch(fetchTasks());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      expect(state.tasks.loading).toBe(false);
      expect(state.tasks.error).toBe('服务不可用');
      expect(state.tasks.tasks).toEqual([]);
    });

    it('应该正确处理网络错误', async () => {
      const { memberService } = require('../../services/memberService');
      
      // 模拟网络错误
      memberService.getAll.mockRejectedValueOnce(new Error('网络连接失败'));
      
      await store.dispatch(fetchMembers());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = store.getState();
      expect(state.members.loading).toBe(false);
      expect(state.members.error).toBe('网络连接失败');
      expect(state.members.members).toEqual([]);
    });
  });

  describe('Loading State Integration', () => {
    it('应该正确管理加载状态', async () => {
      // 初始状态
      let state = store.getState();
      expect(state.tasks.loading).toBe(false);
      expect(state.members.loading).toBe(false);
      expect(state.projects.loading).toBe(false);
      
      // 触发多个异步操作
      const promises = [
        store.dispatch(fetchTasks()),
        store.dispatch(fetchMembers()),
        store.dispatch(fetchProjects()),
      ];
      
      // 检查加载状态
      state = store.getState();
      expect(state.tasks.loading).toBe(true);
      expect(state.members.loading).toBe(true);
      expect(state.projects.loading).toBe(true);
      
      // 等待所有操作完成
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 检查最终状态
      state = store.getState();
      expect(state.tasks.loading).toBe(false);
      expect(state.members.loading).toBe(false);
      expect(state.projects.loading).toBe(false);
    });
  });

  describe('Data Consistency', () => {
    it('应该保持数据一致性', async () => {
      // 初始加载
      await store.dispatch(fetchTasks());
      await store.dispatch(fetchMembers());
      await store.dispatch(fetchProjects());
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      let state = store.getState();
      
      // 验证数据完整性
      expect(state.tasks.tasks).toHaveLength(2);
      expect(state.members.members).toHaveLength(2);
      expect(state.projects.projects).toHaveLength(1);
      
      // 重新加载任务（不应该影响其他数据）
      await store.dispatch(fetchTasks());
      await new Promise(resolve => setTimeout(resolve, 0));
      
      state = store.getState();
      
      // 验证其他数据保持不变
      expect(state.members.members).toHaveLength(2);
      expect(state.projects.projects).toHaveLength(1);
      expect(state.tasks.tasks).toHaveLength(2);
    });
  });
});