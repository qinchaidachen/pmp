import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { TaskBoard } from '../../components/TaskBoard/TaskBoard';
import { mockTasks, mockMembers, mockProjects } from '../mocks/data';

// Mock useAppSelector and useAppDispatch
jest.mock('../../stores', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => {
    const state = {
      tasks: {
        tasks: mockTasks,
        loading: false,
        error: null,
        selectedTaskIds: [],
        filters: {},
        sortOptions: { field: 'startDate', direction: 'asc' },
      },
      members: {
        members: mockMembers,
        loading: false,
        error: null,
        selectedMemberIds: [],
      },
      projects: {
        projects: mockProjects,
        loading: false,
        error: null,
        selectedProjectIds: [],
        currentProjectId: null,
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
jest.mock('../../stores/slices/tasksSlice', () => ({
  fetchTasks: jest.fn(),
  updateTaskStatus: jest.fn(),
  deleteTask: jest.fn(),
}));

jest.mock('../../stores/slices/membersSlice', () => ({
  fetchMembers: jest.fn(),
}));

jest.mock('../../stores/slices/projectsSlice', () => ({
  fetchProjects: jest.fn(),
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

describe('TaskBoard', () => {
  const mockOnTaskClick = jest.fn();
  const mockOnCellClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染TaskBoard组件', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('任务看板')).toBeInTheDocument();
  });

  it('应该显示任务列表', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('测试任务1')).toBeInTheDocument();
    expect(screen.getByText('测试任务2')).toBeInTheDocument();
  });

  it('应该显示团队成员列表', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('应该显示任务状态标签', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('待办')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('应该显示任务优先级', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('高')).toBeInTheDocument();
    expect(screen.getByText('中')).toBeInTheDocument();
  });

  it('应该处理任务点击事件', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    const taskCard = screen.getByText('测试任务1').closest('.ant-card');
    fireEvent.click(taskCard!);

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('应该显示编辑按钮', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    expect(screen.getAllByText('编辑')).toHaveLength(2);
  });

  it('应该显示删除按钮', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    expect(screen.getAllByText('删除')).toHaveLength(2);
  });

  it('应该处理编辑按钮点击', async () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    const editButtons = screen.getAllByText('编辑');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('编辑任务')).toBeInTheDocument();
    });
  });

  it('应该处理删除按钮点击', async () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    const deleteButtons = screen.getAllByText('删除');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });
  });

  it('应该显示添加任务按钮', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    expect(screen.getByText('添加任务')).toBeInTheDocument();
  });

  it('应该处理添加任务按钮点击', async () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={true}
      />
    );

    const addButton = screen.getByText('添加任务');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('新建任务')).toBeInTheDocument();
    });
  });

  it('应该处理加载状态', () => {
    const mockUseAppSelector = require('../../stores').useAppSelector;
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        tasks: { tasks: [], loading: true, error: null, selectedTaskIds: [], filters: {}, sortOptions: { field: 'startDate', direction: 'asc' } },
        members: { members: [], loading: false, error: null, selectedMemberIds: [] },
        projects: { projects: [], loading: false, error: null, selectedProjectIds: [], currentProjectId: null },
        ui: { theme: 'light', sidebarCollapsed: false },
      };
      return selector(state);
    });

    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('应该处理空任务列表', () => {
    const mockUseAppSelector = require('../../stores').useAppSelector;
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        tasks: { tasks: [], loading: false, error: null, selectedTaskIds: [], filters: {}, sortOptions: { field: 'startDate', direction: 'asc' } },
        members: { members: [], loading: false, error: null, selectedMemberIds: [] },
        projects: { projects: [], loading: false, error: null, selectedProjectIds: [], currentProjectId: null },
        ui: { theme: 'light', sidebarCollapsed: false },
      };
      return selector(state);
    });

    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
      />
    );

    expect(screen.getByText('暂无任务数据')).toBeInTheDocument();
  });

  it('应该禁用编辑功能当editable为false', () => {
    render(
      <TaskBoard
        onTaskClick={mockOnTaskClick}
        onCellClick={mockOnCellClick}
        editable={false}
      />
    );

    expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    expect(screen.queryByText('删除')).not.toBeInTheDocument();
    expect(screen.queryByText('添加任务')).not.toBeInTheDocument();
  });
});