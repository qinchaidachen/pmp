import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../index';

export interface ResourceBooking {
  id: string;
  resourceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface ResourceBookingsState {
  items: ResourceBooking[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourceBookingsState = {
  items: [],
  loading: false,
  error: null,
};

const resourceBookingsSlice = createSlice({
  name: 'resourceBookings',
  initialState,
  reducers: {
    setResourceBookings: (state, action: PayloadAction<ResourceBooking[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addResourceBooking: (state, action: PayloadAction<ResourceBooking>) => {
      state.items.push(action.payload);
    },
    updateResourceBooking: (state, action: PayloadAction<{ id: string; updates: Partial<ResourceBooking> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    deleteResourceBooking: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setResourceBookings,
  addResourceBooking,
  updateResourceBooking,
  deleteResourceBooking,
  setLoading,
  setError,
} = resourceBookingsSlice.actions;

export default resourceBookingsSlice.reducer;

// Thunk actions
export const fetchResourceBookings = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // 模拟API调用
    const resourceBookings: ResourceBooking[] = [];
    dispatch(setResourceBookings(resourceBookings));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch resource bookings'));
  }
};