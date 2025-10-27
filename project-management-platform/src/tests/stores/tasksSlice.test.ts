import tasksReducer, {
  TasksState,
  setFilters,
  setSortOptions,
  toggleTaskSelection,
  clearSelectedTasks,
} from '../../stores/slices/tasksSlice';
import { mockTasks } from '../mocks/data';

describe('tasksSlice', () => {
  let initialState: TasksState;

  beforeEach(() => {
    initialState = {
      tasks: [],
      loading: false,
      error: null,
      selectedTaskIds: [],
      filters: {},
      sortOptions: {
        field: 'startDate',
        direction: 'asc',
      },
    };
  });

  describe('reducers', () => {
    it('应该处理setFilters', () => {
      const newFilters = { status: 'todo' as const };
      const state = tasksReducer(initialState, setFilters(newFilters));
      expect(state.filters).toEqual(newFilters);
    });

    it('应该处理setSortOptions', () => {
      const newSortOptions = { field: 'name', direction: 'desc' as const };
      const state = tasksReducer(initialState, setSortOptions(newSortOptions));
      expect(state.sortOptions).toEqual(newSortOptions);
    });

    it('应该处理toggleTaskSelection', () => {
      const state1 = tasksReducer(initialState, toggleTaskSelection('1'));
      expect(state1.selectedTaskIds).toEqual(['1']);

      const state2 = tasksReducer(state1, toggleTaskSelection('1'));
      expect(state2.selectedTaskIds).toEqual([]);
    });

    it('应该处理clearSelectedTasks', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTaskIds: ['1', '2', '3'],
      };
      const state = tasksReducer(stateWithSelection, clearSelectedTasks());
      expect(state.selectedTaskIds).toEqual([]);
    });
  });

  describe('extraReducers', () => {
    it('应该处理fetchTasks fulfilled', () => {
      const action = {
        type: 'tasks/fetchTasks/fulfilled',
        payload: mockTasks,
      };
      const state = tasksReducer(initialState, action);
      expect(state.tasks).toEqual(mockTasks);
      expect(state.loading).toBe(false);
    });

    it('应该处理fetchTasks pending', () => {
      const action = { type: 'tasks/fetchTasks/pending' };
      const state = tasksReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('应该处理fetchTasks rejected', () => {
      const action = {
        type: 'tasks/fetchTasks/rejected',
        payload: '获取任务失败',
      };
      const state = tasksReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('获取任务失败');
    });

    it('应该处理addTask fulfilled', () => {
      const newTask = {
        ...mockTasks[0],
        id: 'new-id',
        title: '新任务',
      };
      const action = {
        type: 'tasks/addTask/fulfilled',
        payload: newTask,
      };
      const state = tasksReducer(initialState, action);
      expect(state.tasks).toContain(newTask);
    });

    it('应该处理updateTask fulfilled', () => {
      const initialStateWithTasks = {
        ...initialState,
        tasks: mockTasks,
      };
      const updatedTask = {
        ...mockTasks[0],
        title: '更新的任务',
      };
      const action = {
        type: 'tasks/updateTask/fulfilled',
        payload: updatedTask,
      };
      const state = tasksReducer(initialStateWithTasks, action);
      expect(state.tasks[0].title).toBe('更新的任务');
    });

    it('应该处理deleteTask fulfilled', () => {
      const initialStateWithTasks = {
        ...initialState,
        tasks: mockTasks,
      };
      const action = {
        type: 'tasks/deleteTask/fulfilled',
        payload: '1',
      };
      const state = tasksReducer(initialStateWithTasks, action);
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('2');
    });
  });
});