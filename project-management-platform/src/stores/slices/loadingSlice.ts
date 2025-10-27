import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
  // 全局加载状态
  global: boolean;
  
  // 各模块加载状态
  dashboard: boolean;
  tasks: boolean;
  projects: boolean;
  teams: boolean;
  members: boolean;
  resources: boolean;
  performance: boolean;
  
  // 具体操作加载状态
  operations: {
    [key: string]: boolean;
  };
  
  // 加载消息
  message?: string;
}

const initialState: LoadingState = {
  global: false,
  dashboard: false,
  tasks: false,
  projects: false,
  teams: false,
  members: false,
  resources: false,
  performance: false,
  operations: {},
  message: undefined,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    // 设置全局加载状态
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.global = action.payload.loading;
      state.message = action.payload.message;
    },
    
    // 设置模块加载状态
    setModuleLoading: (state, action: PayloadAction<{
      module: keyof Omit<LoadingState, 'global' | 'operations' | 'message'>;
      loading: boolean;
    }>) => {
      state[action.payload.module] = action.payload.loading;
    },
    
    // 设置操作加载状态
    setOperationLoading: (state, action: PayloadAction<{
      operation: string;
      loading: boolean;
    }>) => {
      state.operations[action.payload.operation] = action.payload.loading;
      
      // 如果操作完成，清理消息
      if (!action.payload.loading) {
        state.message = undefined;
      }
    },
    
    // 清除所有加载状态
    clearAllLoading: (state) => {
      state.global = false;
      state.dashboard = false;
      state.tasks = false;
      state.projects = false;
      state.teams = false;
      state.members = false;
      state.resources = false;
      state.performance = false;
      state.operations = {};
      state.message = undefined;
    },
    
    // 清除模块加载状态
    clearModuleLoading: (state, action: PayloadAction<keyof Omit<LoadingState, 'global' | 'operations' | 'message'>>) => {
      state[action.payload] = false;
    },
    
    // 清除操作加载状态
    clearOperationLoading: (state, action: PayloadAction<string>) => {
      delete state.operations[action.payload];
    },
    
    // 设置加载消息
    setLoadingMessage: (state, action: PayloadAction<string | undefined>) => {
      state.message = action.payload;
    },
  },
});

export const {
  setGlobalLoading,
  setModuleLoading,
  setOperationLoading,
  clearAllLoading,
  clearModuleLoading,
  clearOperationLoading,
  setLoadingMessage,
} = loadingSlice.actions;

export default loadingSlice.reducer;

// 选择器
export const selectGlobalLoading = (state: { loading: LoadingState }) => state.loading.global;
export const selectModuleLoading = (module: keyof Omit<LoadingState, 'global' | 'operations' | 'message'>) =>
  (state: { loading: LoadingState }) => state.loading[module];
export const selectOperationLoading = (operation: string) =>
  (state: { loading: LoadingState }) => state.loading.operations[operation];
export const selectAnyLoading = (state: { loading: LoadingState }) => {
  const { global, dashboard, tasks, projects, teams, members, resources, performance, operations } = state.loading;
  return global || dashboard || tasks || projects || teams || members || resources || performance ||
    Object.values(operations).some(Boolean);
};
export const selectLoadingMessage = (state: { loading: LoadingState }) => state.loading.message;