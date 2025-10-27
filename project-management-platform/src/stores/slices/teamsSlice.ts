import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Team, Resource, ResourceBooking, ResourceType } from '../../types';
import { teamService } from '../../services/teamService';
import { resourceService } from '../../services/resourceService';
import { setModuleLoading } from './loadingSlice';

interface TeamsState {
  teams: Team[];
  resources: Resource[];
  resourceBookings: ResourceBooking[];
  loading: boolean;
  error: string | null;
  selectedTeamIds: string[];
}

const initialState: TeamsState = {
  teams: [],
  resources: [],
  resourceBookings: [],
  loading: false,
  error: null,
  selectedTeamIds: [],
};

// 异步操作 - 团队
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'teams', loading: true }));
    try {
      const teams = await teamService.getAll();
      return teams;
    } finally {
      dispatch(setModuleLoading({ module: 'teams', loading: false }));
    }
  }
);

export const addTeam = createAsyncThunk(
  'teams/addTeam',
  async (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'teams', loading: true }));
    try {
      const newTeam = await teamService.create(team);
      return newTeam;
    } finally {
      dispatch(setModuleLoading({ module: 'teams', loading: false }));
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, updates }: { id: string; updates: Partial<Team> }, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'teams', loading: true }));
    try {
      const updatedTeam = await teamService.update(id, updates);
      return updatedTeam;
    } finally {
      dispatch(setModuleLoading({ module: 'teams', loading: false }));
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id: string, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'teams', loading: true }));
    try {
      await teamService.delete(id);
      return id;
    } finally {
      dispatch(setModuleLoading({ module: 'teams', loading: false }));
    }
  }
);

// 异步操作 - 资源
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async () => {
    const resources = await resourceService.getAll();
    return resources;
  }
);

export const addResource = createAsyncThunk(
  'resources/addResource',
  async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newResource = await resourceService.create(resource);
    return newResource;
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, updates }: { id: string; updates: Partial<Resource> }) => {
    const updatedResource = await resourceService.update(id, updates);
    return updatedResource;
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id: string) => {
    await resourceService.delete(id);
    return id;
  }
);

// 异步操作 - 资源预定
export const fetchResourceBookings = createAsyncThunk(
  'resources/fetchResourceBookings',
  async (resourceId?: string) => {
    const bookings = await resourceService.getBookings(resourceId);
    return bookings;
  }
);

export const addResourceBooking = createAsyncThunk(
  'resources/addResourceBooking',
  async (booking: Omit<ResourceBooking, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBooking = await resourceService.createBooking(booking);
    return newBooking;
  }
);

export const updateResourceBooking = createAsyncThunk(
  'resources/updateResourceBooking',
  async ({ id, updates }: { id: string; updates: Partial<ResourceBooking> }) => {
    const updatedBooking = await resourceService.updateBooking(id, updates);
    return updatedBooking;
  }
);

export const deleteResourceBooking = createAsyncThunk(
  'resources/deleteResourceBooking',
  async (id: string) => {
    await resourceService.deleteBooking(id);
    return id;
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeams: (state, action: PayloadAction<string[]>) => {
      state.selectedTeamIds = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 团队相关
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取团队列表失败';
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t.id !== action.payload);
        state.selectedTeamIds = state.selectedTeamIds.filter(id => id !== action.payload);
      })
      
      // 资源相关
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      .addCase(addResource.fulfilled, (state, action) => {
        state.resources.push(action.payload);
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(r => r.id !== action.payload);
      })
      
      // 资源预定相关
      .addCase(fetchResourceBookings.fulfilled, (state, action) => {
        state.resourceBookings = action.payload;
      })
      .addCase(addResourceBooking.fulfilled, (state, action) => {
        state.resourceBookings.push(action.payload);
      })
      .addCase(updateResourceBooking.fulfilled, (state, action) => {
        const index = state.resourceBookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.resourceBookings[index] = action.payload;
        }
      })
      .addCase(deleteResourceBooking.fulfilled, (state, action) => {
        state.resourceBookings = state.resourceBookings.filter(b => b.id !== action.payload);
      });
  },
});

export const { 
  setSelectedTeams, 
  clearError 
} = teamsSlice.actions;

export default teamsSlice.reducer;