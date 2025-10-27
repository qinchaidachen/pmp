import projectsReducer, {
  ProjectsState,
  fetchProjects,
  addProject,
  updateProject,
  deleteProject,
  toggleProjectSelection,
  clearSelectedProjects,
  setCurrentProject,
} from '../../stores/slices/projectsSlice';
import { mockProjects } from '../mocks/data';

describe('projectsSlice', () => {
  let initialState: ProjectsState;

  beforeEach(() => {
    initialState = {
      projects: [],
      loading: false,
      error: null,
      selectedProjectIds: [],
      currentProjectId: null,
    };
  });

  describe('reducers', () => {
    it('应该处理toggleProjectSelection', () => {
      const state1 = projectsReducer(initialState, toggleProjectSelection('project1'));
      expect(state1.selectedProjectIds).toEqual(['project1']);

      const state2 = projectsReducer(state1, toggleProjectSelection('project1'));
      expect(state2.selectedProjectIds).toEqual([]);
    });

    it('应该处理clearSelectedProjects', () => {
      const stateWithSelection = {
        ...initialState,
        selectedProjectIds: ['project1', 'project2'],
      };
      const state = projectsReducer(stateWithSelection, clearSelectedProjects());
      expect(state.selectedProjectIds).toEqual([]);
    });

    it('应该处理setCurrentProject', () => {
      const state = projectsReducer(initialState, setCurrentProject('project1'));
      expect(state.currentProjectId).toBe('project1');
    });
  });

  describe('async thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('fetchProjects', () => {
      it('应该处理fetchProjects fulfilled', async () => {
        const mockProjectService = {
          getAll: jest.fn().mockResolvedValue(mockProjects),
        };

        jest.doMock('../../services/projectService', () => ({
          projectService: mockProjectService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchProjects()(dispatch, getState, undefined);
        expect(result.payload).toEqual(mockProjects);
      });

      it('应该处理fetchProjects rejected', async () => {
        const error = new Error('获取项目失败');
        const mockProjectService = {
          getAll: jest.fn().mockRejectedValue(error),
        };

        jest.doMock('../../services/projectService', () => ({
          projectService: mockProjectService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchProjects()(dispatch, getState, undefined);
        expect(result.payload).toEqual('获取项目失败');
      });
    });

    describe('addProject', () => {
      it('应该处理addProject fulfilled', async () => {
        const newProjectData = {
          name: '新项目',
          description: '项目描述',
          status: 'active' as const,
          owner: 'user1',
          members: ['user1', 'user2'],
          startDate: new Date(),
          endDate: new Date(),
        };

        const createdProject = {
          ...newProjectData,
          id: 'new-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockProjectService = {
          create: jest.fn().mockResolvedValue(createdProject),
        };

        jest.doMock('../../services/projectService', () => ({
          projectService: mockProjectService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await addProject(newProjectData)(dispatch, getState, undefined);
        expect(result.payload).toEqual(createdProject);
      });
    });

    describe('updateProject', () => {
      it('应该处理updateProject fulfilled', async () => {
        const updateData = { name: '更新的项目' };
        const updatedProject = { ...mockProjects[0], ...updateData };

        const mockProjectService = {
          update: jest.fn().mockResolvedValue(updatedProject),
        };

        jest.doMock('../../services/projectService', () => ({
          projectService: mockProjectService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await updateProject({ id: 'project1', updates: updateData })(dispatch, getState, undefined);
        expect(result.payload).toEqual(updatedProject);
      });
    });

    describe('deleteProject', () => {
      it('应该处理deleteProject fulfilled', async () => {
        const mockProjectService = {
          delete: jest.fn().mockResolvedValue(undefined),
        };

        jest.doMock('../../services/projectService', () => ({
          projectService: mockProjectService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await deleteProject('project1')(dispatch, getState, undefined);
        expect(result.payload).toEqual('project1');
      });
    });
  });

  describe('extraReducers', () => {
    it('应该处理fetchProjects pending', () => {
      const action = { type: fetchProjects.pending.type };
      const state = projectsReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('应该处理fetchProjects fulfilled', () => {
      const action = {
        type: fetchProjects.fulfilled.type,
        payload: mockProjects,
      };
      const state = projectsReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.projects).toEqual(mockProjects);
    });

    it('应该处理fetchProjects rejected', () => {
      const action = {
        type: fetchProjects.rejected.type,
        payload: '获取项目失败',
      };
      const state = projectsReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('获取项目失败');
    });

    it('应该处理addProject fulfilled', () => {
      const newProject = {
        ...mockProjects[0],
        id: 'new-id',
        name: '新项目',
      };
      const action = {
        type: addProject.fulfilled.type,
        payload: newProject,
      };
      const state = projectsReducer(initialState, action);
      expect(state.projects).toContain(newProject);
    });

    it('应该处理updateProject fulfilled', () => {
      const initialStateWithProjects = {
        ...initialState,
        projects: mockProjects,
      };
      const updatedProject = {
        ...mockProjects[0],
        name: '更新的项目',
      };
      const action = {
        type: updateProject.fulfilled.type,
        payload: updatedProject,
      };
      const state = projectsReducer(initialStateWithProjects, action);
      expect(state.projects[0].name).toBe('更新的项目');
    });

    it('应该处理deleteProject fulfilled', () => {
      const initialStateWithProjects = {
        ...initialState,
        projects: mockProjects,
      };
      const action = {
        type: deleteProject.fulfilled.type,
        payload: 'project1',
      };
      const state = projectsReducer(initialStateWithProjects, action);
      expect(state.projects).toHaveLength(0);
    });
  });
});