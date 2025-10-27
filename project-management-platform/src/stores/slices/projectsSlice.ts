import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { projectService } from '../../services/projectService';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProjectIds: string[];
  currentProjectId: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  selectedProjectIds: [],
  currentProjectId: null,
};

// 异步操作
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const projects = await projectService.getAll();
    return projects;
  }
);

export const addProject = createAsyncThunk(
  'projects/addProject',
  async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject = await projectService.create(project);
    return newProject;
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
    const updatedProject = await projectService.update(id, updates);
    return updatedProject;
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string) => {
    await projectService.delete(id);
    return id;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProjects: (state, action: PayloadAction<string[]>) => {
      state.selectedProjectIds = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取项目列表
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取项目列表失败';
      })
      // 添加项目
      .addCase(addProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.error = action.error.message || '添加项目失败';
      })
      // 更新项目
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.error.message || '更新项目失败';
      })
      // 删除项目
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        state.selectedProjectIds = state.selectedProjectIds.filter(id => id !== action.payload);
        if (state.currentProjectId === action.payload) {
          state.currentProjectId = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.error.message || '删除项目失败';
      });
  },
});

export const { 
  setSelectedProjects, 
  setCurrentProject, 
  clearError 
} = projectsSlice.actions;

export default projectsSlice.reducer;