import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PerformanceMetric } from '../../types';
import { performanceService } from '../../services/performanceService';

interface PerformanceState {
  metrics: PerformanceMetric[];
  loading: boolean;
  error: string | null;
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  selectedTargetType: 'member' | 'team' | 'all';
  lastCalculated: Date | null;
}

const initialState: PerformanceState = {
  metrics: [],
  loading: false,
  error: null,
  selectedPeriod: 'month',
  selectedTargetType: 'all',
  lastCalculated: null,
};

// 异步操作
export const fetchPerformanceMetrics = createAsyncThunk(
  'performance/fetchMetrics',
  async ({ 
    period, 
    targetType, 
    targetIds 
  }: { 
    period: 'week' | 'month' | 'quarter' | 'year';
    targetType: 'member' | 'team' | 'all';
    targetIds?: string[];
  }) => {
    const metrics = await performanceService.getMetrics(period, targetType, targetIds);
    return metrics;
  }
);

export const calculatePerformanceMetrics = createAsyncThunk(
  'performance/calculateMetrics',
  async ({ 
    period, 
    dateRange 
  }: { 
    period: 'week' | 'month' | 'quarter' | 'year';
    dateRange?: { start: Date; end: Date };
  }) => {
    const metrics = await performanceService.calculateMetrics(period, dateRange);
    return { metrics, calculatedAt: new Date() };
  }
);

export const recalculateAllMetrics = createAsyncThunk(
  'performance/recalculateAll',
  async () => {
    const metrics = await performanceService.recalculateAll();
    return { metrics, calculatedAt: new Date() };
  }
);

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    setSelectedPeriod: (state, action: PayloadAction<'week' | 'month' | 'quarter' | 'year'>) => {
      state.selectedPeriod = action.payload;
    },
    setSelectedTargetType: (state, action: PayloadAction<'member' | 'team' | 'all'>) => {
      state.selectedTargetType = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取效能指标
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取效能指标失败';
      })
      
      // 计算效能指标
      .addCase(calculatePerformanceMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePerformanceMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.lastCalculated = action.payload.calculatedAt;
      })
      .addCase(calculatePerformanceMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '计算效能指标失败';
      })
      
      // 重新计算所有指标
      .addCase(recalculateAllMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recalculateAllMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.lastCalculated = action.payload.calculatedAt;
      })
      .addCase(recalculateAllMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '重新计算效能指标失败';
      });
  },
});

export const { 
  setSelectedPeriod, 
  setSelectedTargetType, 
  clearError 
} = performanceSlice.actions;

export default performanceSlice.reducer;