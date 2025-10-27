import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';

export interface Resource {
  id: string;
  name: string;
  type: 'equipment' | 'room' | 'software' | 'other';
  status: 'available' | 'in-use' | 'maintenance' | 'unavailable';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResourcesState {
  items: Resource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  items: [],
  loading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setResources: (state, action: PayloadAction<Resource[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addResource: (state, action: PayloadAction<Resource>) => {
      state.items.push(action.payload);
    },
    updateResource: (state, action: PayloadAction<Resource>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeResource: (state, action: PayloadAction<string>) => {
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
  setResources,
  addResource,
  updateResource,
  removeResource,
  setLoading,
  setError,
} = resourcesSlice.actions;

export default resourcesSlice.reducer;

// Thunk actions
export const fetchResources = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // 模拟API调用
    const resources: Resource[] = [];
    dispatch(setResources(resources));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch resources'));
  }
};

export const deleteResource = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(removeResource(id));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Failed to delete resource'));
  }
};