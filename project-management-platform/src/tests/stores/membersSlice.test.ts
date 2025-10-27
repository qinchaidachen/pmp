import membersReducer, {
  MembersState,
  fetchMembers,
  addMember,
  updateMember,
  deleteMember,
  toggleMemberSelection,
  clearSelectedMembers,
} from '../../stores/slices/membersSlice';
import { mockMembers } from '../mocks/data';

describe('membersSlice', () => {
  let initialState: MembersState;

  beforeEach(() => {
    initialState = {
      members: [],
      loading: false,
      error: null,
      selectedMemberIds: [],
    };
  });

  describe('reducers', () => {
    it('应该处理toggleMemberSelection', () => {
      const state1 = membersReducer(initialState, toggleMemberSelection('user1'));
      expect(state1.selectedMemberIds).toEqual(['user1']);

      const state2 = membersReducer(state1, toggleMemberSelection('user1'));
      expect(state2.selectedMemberIds).toEqual([]);
    });

    it('应该处理clearSelectedMembers', () => {
      const stateWithSelection = {
        ...initialState,
        selectedMemberIds: ['user1', 'user2'],
      };
      const state = membersReducer(stateWithSelection, clearSelectedMembers());
      expect(state.selectedMemberIds).toEqual([]);
    });
  });

  describe('async thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('fetchMembers', () => {
      it('应该处理fetchMembers fulfilled', async () => {
        const mockMemberService = {
          getAll: jest.fn().mockResolvedValue(mockMembers),
        };

        jest.doMock('../../services/memberService', () => ({
          memberService: mockMemberService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchMembers()(dispatch, getState, undefined);
        expect(result.payload).toEqual(mockMembers);
      });

      it('应该处理fetchMembers rejected', async () => {
        const error = new Error('获取成员失败');
        const mockMemberService = {
          getAll: jest.fn().mockRejectedValue(error),
        };

        jest.doMock('../../services/memberService', () => ({
          memberService: mockMemberService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchMembers()(dispatch, getState, undefined);
        expect(result.payload).toEqual('获取成员失败');
      });
    });

    describe('addMember', () => {
      it('应该处理addMember fulfilled', async () => {
        const newMemberData = {
          name: '新成员',
          email: 'new@example.com',
          role: 'developer' as const,
          avatar: 'https://example.com/avatar.jpg',
          status: 'active' as const,
          joinDate: new Date(),
          lastActive: new Date(),
          skills: ['React'],
          workload: 50,
        };

        const createdMember = {
          ...newMemberData,
          id: 'new-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockMemberService = {
          create: jest.fn().mockResolvedValue(createdMember),
        };

        jest.doMock('../../services/memberService', () => ({
          memberService: mockMemberService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await addMember(newMemberData)(dispatch, getState, undefined);
        expect(result.payload).toEqual(createdMember);
      });
    });

    describe('updateMember', () => {
      it('应该处理updateMember fulfilled', async () => {
        const updateData = { name: '更新的成员名称' };
        const updatedMember = { ...mockMembers[0], ...updateData };

        const mockMemberService = {
          update: jest.fn().mockResolvedValue(updatedMember),
        };

        jest.doMock('../../services/memberService', () => ({
          memberService: mockMemberService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await updateMember({ id: 'user1', updates: updateData })(dispatch, getState, undefined);
        expect(result.payload).toEqual(updatedMember);
      });
    });

    describe('deleteMember', () => {
      it('应该处理deleteMember fulfilled', async () => {
        const mockMemberService = {
          delete: jest.fn().mockResolvedValue(undefined),
        };

        jest.doMock('../../services/memberService', () => ({
          memberService: mockMemberService,
        }));

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await deleteMember('user1')(dispatch, getState, undefined);
        expect(result.payload).toEqual('user1');
      });
    });
  });

  describe('extraReducers', () => {
    it('应该处理fetchMembers pending', () => {
      const action = { type: fetchMembers.pending.type };
      const state = membersReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('应该处理fetchMembers fulfilled', () => {
      const action = {
        type: fetchMembers.fulfilled.type,
        payload: mockMembers,
      };
      const state = membersReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.members).toEqual(mockMembers);
    });

    it('应该处理fetchMembers rejected', () => {
      const action = {
        type: fetchMembers.rejected.type,
        payload: '获取成员失败',
      };
      const state = membersReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('获取成员失败');
    });

    it('应该处理addMember fulfilled', () => {
      const newMember = {
        ...mockMembers[0],
        id: 'new-id',
        name: '新成员',
      };
      const action = {
        type: addMember.fulfilled.type,
        payload: newMember,
      };
      const state = membersReducer(initialState, action);
      expect(state.members).toContain(newMember);
    });

    it('应该处理updateMember fulfilled', () => {
      const initialStateWithMembers = {
        ...initialState,
        members: mockMembers,
      };
      const updatedMember = {
        ...mockMembers[0],
        name: '更新的成员',
      };
      const action = {
        type: updateMember.fulfilled.type,
        payload: updatedMember,
      };
      const state = membersReducer(initialStateWithMembers, action);
      expect(state.members[0].name).toBe('更新的成员');
    });

    it('应该处理deleteMember fulfilled', () => {
      const initialStateWithMembers = {
        ...initialState,
        members: mockMembers,
      };
      const action = {
        type: deleteMember.fulfilled.type,
        payload: 'user1',
      };
      const state = membersReducer(initialStateWithMembers, action);
      expect(state.members).toHaveLength(1);
      expect(state.members[0].id).toBe('user2');
    });
  });
});