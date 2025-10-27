import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// 导入各个模块的slice
import membersSlice from './slices/membersSlice';
import tasksSlice from './slices/tasksSlice';
import projectsSlice from './slices/projectsSlice';
import teamsSlice from './slices/teamsSlice';
import resourcesSlice from './slices/resourcesSlice';
import resourceBookingsSlice from './slices/resourceBookingsSlice';
import performanceSlice from './slices/performanceSlice';
import uiSlice from './slices/uiSlice';
import loadingSlice from './slices/loadingSlice';

export const store = configureStore({
  reducer: {
    members: membersSlice,
    tasks: tasksSlice,
    projects: projectsSlice,
    teams: teamsSlice,
    resources: resourcesSlice,
    resourceBookings: resourceBookingsSlice,
    performance: performanceSlice,
    ui: uiSlice,
    loading: loadingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型化的hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;