import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Member } from '../../types';
import { memberService } from '../../services/memberService';
import { setModuleLoading } from './loadingSlice';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  selectedMemberIds: string[];
}

const initialState: MembersState = {
  members: [],
  loading: false,
  error: null,
  selectedMemberIds: [],
};

// 异步操作
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (_, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'members', loading: true }));
    try {
      const members = await memberService.getAll();
      return members;
    } finally {
      dispatch(setModuleLoading({ module: 'members', loading: false }));
    }
  }
);

export const addMember = createAsyncThunk(
  'members/addMember',
  async (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'members', loading: true }));
    try {
      const newMember = await memberService.create(member);
      return newMember;
    } finally {
      dispatch(setModuleLoading({ module: 'members', loading: false }));
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, updates }: { id: string; updates: Partial<Member> }, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'members', loading: true }));
    try {
      const updatedMember = await memberService.update(id, updates);
      return updatedMember;
    } finally {
      dispatch(setModuleLoading({ module: 'members', loading: false }));
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id: string, { dispatch }) => {
    dispatch(setModuleLoading({ module: 'members', loading: true }));
    try {
      await memberService.delete(id);
      return id;
    } finally {
      dispatch(setModuleLoading({ module: 'members', loading: false }));
    }
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setSelectedMembers: (state, action: PayloadAction<string[]>) => {
      state.selectedMemberIds = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取成员列表
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取成员列表失败';
      })
      // 添加成员
      .addCase(addMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      .addCase(addMember.rejected, (state, action) => {
        state.error = action.error.message || '添加成员失败';
      })
      // 更新成员
      .addCase(updateMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.error = action.error.message || '更新成员失败';
      })
      // 删除成员
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m.id !== action.payload);
        state.selectedMemberIds = state.selectedMemberIds.filter(id => id !== action.payload);
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.error = action.error.message || '删除成员失败';
      });
  },
});

export const { setSelectedMembers, clearError } = membersSlice.actions;
export default membersSlice.reducer;