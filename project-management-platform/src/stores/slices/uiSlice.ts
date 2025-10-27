import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface UIState {
  // 主题相关
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  
  // 布局相关
  sidebarCollapsed: boolean;
  currentPage: string;
  
  // 模态框状态
  modals: {
    memberForm: boolean;
    taskForm: boolean;
    projectForm: boolean;
    teamForm: boolean;
    resourceForm: boolean;
    importData: boolean;
    exportData: boolean;
  };
  
  // 加载状态
  loading: {
    global: boolean;
    tasks: boolean;
    members: boolean;
    projects: boolean;
    teams: boolean;
    performance: boolean;
  };
  
  // 通知
  notifications: Notification[];
  
  // 错误状态
  errors: {
    message: string | null;
    type: 'error' | 'warning' | 'info' | 'success' | null;
    timestamp: Date | null;
  };
  
  // 数据看板相关
  dashboard: {
    selectedView: 'project' | 'team' | 'personal';
    selectedTimeRange: 'week' | 'month' | 'quarter' | 'year';
    refreshInterval: number; // 秒
    autoRefresh: boolean;
  };
  
  // 任务看板相关
  taskBoard: {
    selectedMembers: string[];
    selectedTeams: string[];
    selectedProjects: string[];
    viewMode: 'timeline' | 'kanban' | 'list';
    groupBy: 'member' | 'team' | 'status' | 'priority';
    showWeekends: boolean;
    showCompletedTasks: boolean;
  };
}

const initialState: UIState = {
  theme: 'light',
  primaryColor: '#1890ff',
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  
  modals: {
    memberForm: false,
    taskForm: false,
    projectForm: false,
    teamForm: false,
    resourceForm: false,
    importData: false,
    exportData: false,
  },
  
  loading: {
    global: false,
    tasks: false,
    members: false,
    projects: false,
    teams: false,
    performance: false,
  },
  
  notifications: [],
  
  errors: {
    message: null,
    type: null,
    timestamp: null,
  },
  
  dashboard: {
    selectedView: 'project',
    selectedTimeRange: 'month',
    refreshInterval: 300, // 5分钟
    autoRefresh: true,
  },
  
  taskBoard: {
    selectedMembers: [],
    selectedTeams: [],
    selectedProjects: [],
    viewMode: 'timeline',
    groupBy: 'member',
    showWeekends: true,
    showCompletedTasks: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主题设置
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    
    // 布局控制
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    
    // 模态框控制
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // 加载状态
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    
    // 通知管理
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };
      state.notifications.unshift(notification);
      
      // 保持最多50条通知
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // 错误管理
    setError: (state, action: PayloadAction<{ message: string; type: 'error' | 'warning' | 'info' | 'success' }>) => {
      state.errors = {
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date(),
      };
    },
    clearError: (state) => {
      state.errors = {
        message: null,
        type: null,
        timestamp: null,
      };
    },
    
    // 数据看板设置
    setDashboardView: (state, action: PayloadAction<'project' | 'team' | 'personal'>) => {
      state.dashboard.selectedView = action.payload;
    },
    setDashboardTimeRange: (state, action: PayloadAction<'week' | 'month' | 'quarter' | 'year'>) => {
      state.dashboard.selectedTimeRange = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.dashboard.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.dashboard.refreshInterval = action.payload;
    },
    
    // 任务看板设置
    setTaskBoardSelectedMembers: (state, action: PayloadAction<string[]>) => {
      state.taskBoard.selectedMembers = action.payload;
    },
    setTaskBoardSelectedTeams: (state, action: PayloadAction<string[]>) => {
      state.taskBoard.selectedTeams = action.payload;
    },
    setTaskBoardSelectedProjects: (state, action: PayloadAction<string[]>) => {
      state.taskBoard.selectedProjects = action.payload;
    },
    setTaskBoardViewMode: (state, action: PayloadAction<'timeline' | 'kanban' | 'list'>) => {
      state.taskBoard.viewMode = action.payload;
    },
    setTaskBoardGroupBy: (state, action: PayloadAction<'member' | 'team' | 'status' | 'priority'>) => {
      state.taskBoard.groupBy = action.payload;
    },
    setTaskBoardShowWeekends: (state, action: PayloadAction<boolean>) => {
      state.taskBoard.showWeekends = action.payload;
    },
    setTaskBoardShowCompletedTasks: (state, action: PayloadAction<boolean>) => {
      state.taskBoard.showCompletedTasks = action.payload;
    },
  },
});

export const {
  setTheme,
  setPrimaryColor,
  toggleSidebar,
  setSidebarCollapsed,
  setCurrentPage,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  setError,
  clearError,
  setDashboardView,
  setDashboardTimeRange,
  setAutoRefresh,
  setRefreshInterval,
  setTaskBoardSelectedMembers,
  setTaskBoardSelectedTeams,
  setTaskBoardSelectedProjects,
  setTaskBoardViewMode,
  setTaskBoardGroupBy,
  setTaskBoardShowWeekends,
  setTaskBoardShowCompletedTasks,
} = uiSlice.actions;

export default uiSlice.reducer;