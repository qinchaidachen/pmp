import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import TeamManagement from '../../pages/TeamManagement';
import { mockMembers, mockTeams } from '../mocks/data';

// Mock useAppSelector and useAppDispatch
jest.mock('../../stores', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => {
    const state = {
      members: {
        members: mockMembers,
        loading: false,
        error: null,
        selectedMemberIds: [],
      },
      teams: {
        teams: mockTeams,
        loading: false,
        error: null,
        selectedTeamIds: [],
      },
      ui: {
        theme: 'light',
        sidebarCollapsed: false,
      },
    };
    return selector(state);
  },
}));

// Mock slices
jest.mock('../../stores/slices/membersSlice', () => ({
  fetchMembers: jest.fn(),
  addMember: jest.fn(),
  updateMember: jest.fn(),
  deleteMember: jest.fn(),
}));

jest.mock('../../stores/slices/teamsSlice', () => ({
  fetchTeams: jest.fn(),
  addTeam: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
}));

// Mock Loading components
jest.mock('../../components/Loading', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  SkeletonTable: () => <div data-testid="skeleton-table">Loading Table...</div>,
  LoadingSection: ({ children }: any) => <div data-testid="loading-section">{children}</div>,
}));

// Mock useLoading hook
jest.mock('../../hooks/useLoading', () => ({
  useLoading: () => ({
    setModule: jest.fn(),
    getModuleSelector: () => () => false,
  }),
}));

describe('TeamManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染TeamManagement组件', () => {
    render(<TeamManagement />);

    expect(screen.getByText('团队管理')).toBeInTheDocument();
  });

  it('应该显示成员Tab', () => {
    render(<TeamManagement />);

    expect(screen.getByText('成员管理')).toBeInTheDocument();
  });

  it('应该显示团队Tab', () => {
    render(<TeamManagement />);

    expect(screen.getByText('团队管理')).toBeInTheDocument();
  });

  it('应该显示成员列表', () => {
    render(<TeamManagement />);

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('应该显示团队列表', () => {
    render(<TeamManagement />);

    expect(screen.getByText('前端开发团队')).toBeInTheDocument();
  });

  it('应该显示添加成员按钮', () => {
    render(<TeamManagement />);

    expect(screen.getByText('添加成员')).toBeInTheDocument();
  });

  it('应该显示添加团队按钮', () => {
    render(<TeamManagement />);

    expect(screen.getByText('添加团队')).toBeInTheDocument();
  });

  it('应该处理添加成员按钮点击', async () => {
    render(<TeamManagement />);

    const addMemberButton = screen.getByText('添加成员');
    fireEvent.click(addMemberButton);

    await waitFor(() => {
      expect(screen.getByText('添加成员')).toBeInTheDocument();
    });
  });

  it('应该处理添加团队按钮点击', async () => {
    render(<TeamManagement />);

    // 切换到团队Tab
    fireEvent.click(screen.getByText('团队管理'));

    const addTeamButton = screen.getByText('添加团队');
    fireEvent.click(addTeamButton);

    await waitFor(() => {
      expect(screen.getByText('添加团队')).toBeInTheDocument();
    });
  });

  it('应该显示成员信息', () => {
    render(<TeamManagement />);

    expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
    expect(screen.getByText('lisi@example.com')).toBeInTheDocument();
    expect(screen.getByText('开发者')).toBeInTheDocument();
    expect(screen.getByText('设计师')).toBeInTheDocument();
  });

  it('应该显示成员状态标签', () => {
    render(<TeamManagement />);

    expect(screen.getByText('活跃')).toBeInTheDocument();
  });

  it('应该显示成员技能标签', () => {
    render(<TeamManagement />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('UI/UX')).toBeInTheDocument();
  });

  it('应该显示成员工作负载', () => {
    render(<TeamManagement />);

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('应该显示团队成员数量统计', () => {
    render(<TeamManagement />);

    expect(screen.getByText('团队数量')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('应该显示成员数量统计', () => {
    render(<TeamManagement />);

    expect(screen.getByText('成员总数')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('应该显示活跃成员统计', () => {
    render(<TeamManagement />);

    expect(screen.getByText('活跃成员')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('应该处理Tab切换', () => {
    render(<TeamManagement />);

    // 默认在成员Tab
    expect(screen.getByText('添加成员')).toBeInTheDocument();

    // 切换到团队Tab
    fireEvent.click(screen.getByText('团队管理'));
    expect(screen.getByText('添加团队')).toBeInTheDocument();

    // 切换回成员Tab
    fireEvent.click(screen.getByText('成员管理'));
    expect(screen.getByText('添加成员')).toBeInTheDocument();
  });

  it('应该处理加载状态', () => {
    const mockUseAppSelector = require('../../stores').useAppSelector;
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        members: { members: [], loading: true, error: null, selectedMemberIds: [] },
        teams: { teams: [], loading: false, error: null, selectedTeamIds: [] },
        ui: { theme: 'light', sidebarCollapsed: false },
      };
      return selector(state);
    });

    render(<TeamManagement />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('应该处理空成员列表', () => {
    const mockUseAppSelector = require('../../stores').useAppSelector;
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        members: { members: [], loading: false, error: null, selectedMemberIds: [] },
        teams: { teams: [], loading: false, error: null, selectedTeamIds: [] },
        ui: { theme: 'light', sidebarCollapsed: false },
      };
      return selector(state);
    });

    render(<TeamManagement />);

    expect(screen.getByText('暂无成员数据')).toBeInTheDocument();
  });

  it('应该处理空团队列表', () => {
    const mockUseAppSelector = require('../../stores').useAppSelector;
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        members: { members: mockMembers, loading: false, error: null, selectedMemberIds: [] },
        teams: { teams: [], loading: false, error: null, selectedTeamIds: [] },
        ui: { theme: 'light', sidebarCollapsed: false },
      };
      return selector(state);
    });

    render(<TeamManagement />);

    // 切换到团队Tab
    fireEvent.click(screen.getByText('团队管理'));

    expect(screen.getByText('暂无团队数据')).toBeInTheDocument();
  });
});