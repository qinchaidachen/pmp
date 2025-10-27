import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStatus, FilterOptions, SortOptions } from '../../types';
import { taskService } from '../../services/taskService';
import { setModuleLoading } from './loadingSlice';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskIds: string[];
  filters: FilterOptions;
  sortOptions: SortOptions;
}

const initialState: TasksState = {
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

// 异步操作
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters?: FilterOptions, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'tasks', loading: true }));
    try {
      const tasks = await taskService.getAll(filters);
      return tasks;
    } finally {
      dispatch(setModuleLoading({ module: 'tasks', loading: false }));
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'tasks', loading: true }));
    try {
      const newTask = await taskService.create(task);
      return newTask;
    } finally {
      dispatch(setModuleLoading({ module: 'tasks', loading: false }));
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'tasks', loading: true }));
    try {
      const updatedTask = await taskService.update(id, updates);
      return updatedTask;
    } finally {
      dispatch(setModuleLoading({ module: 'tasks', loading: false }));
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'tasks', loading: true }));
    try {
      await taskService.delete(id);
      return id;
    } finally {
      dispatch(setModuleLoading({ module: 'tasks', loading: false }));
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }: { id: string; status: TaskStatus }, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'tasks', loading: true }));
    try {
      const updates: Partial<Task> = { 
        status,
        updatedAt: new Date()
      };
      
      // 如果状态变为完成，记录完成时间
      if (status === TaskStatus.COMPLETED) {
        updates.completedAt = new Date();
      }
      
      const updatedTask = await taskService.update(id, updates);
      return updatedTask;
    } finally {
      dispatch(setModuleLoading({ module: 'tasks', loading: false }));
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = action.payload;
    },
    setFilters: (state, action: PayloadAction<FilterOptions>) => {
      state.filters = action.payload;
    },
    setSortOptions: (state, action: PayloadAction<SortOptions>) => {
      state.sortOptions = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取任务列表
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取任务列表失败';
      })
      // 添加任务
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.error.message || '添加任务失败';
      })
      // 更新任务
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.error.message || '更新任务失败';
      })
      // 删除任务
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.selectedTaskIds = state.selectedTaskIds.filter(id => id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.error.message || '删除任务失败';
      })
      // 更新任务状态
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  },
});

export const { 
  setSelectedTasks, 
  setFilters, 
  setSortOptions, 
  clearError 
} = tasksSlice.actions;

export default tasksSlice.reducer;