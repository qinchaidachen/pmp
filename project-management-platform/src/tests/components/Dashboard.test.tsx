import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import { mockTasks, mockMembers, mockProjects } from '../mocks/data';

// Mock components and services
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
      performance: {
        metrics: {},
        loading: false,
        error: null,
      },
      loading: {
        modules: {},
      },
    };
    return selector(state);
  },
}));

jest.mock('echarts-for-react', () => {
  return function MockECharts() {
    return <div data-testid="mock-echarts">ECharts Component</div>;
  };
});

jest.mock('../../components/Loading', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  SkeletonDashboard: () => <div data-testid="skeleton-dashboard">Loading Dashboard...</div>,
  LoadingOverlay: ({ children }: any) => <div data-testid="loading-overlay">{children}</div>,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染Dashboard组件', async () => {
    const Dashboard = require('../../pages/Dashboard').default;
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('项目管理仪表板')).toBeInTheDocument();
    });
  });

  it('应该显示统计卡片', async () => {
    const Dashboard = require('../../pages/Dashboard').default;
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('总任务数')).toBeInTheDocument();
      expect(screen.getByText('总项目数')).toBeInTheDocument();
      expect(screen.getByText('团队成员')).toBeInTheDocument();
      expect(screen.getByText('完成率')).toBeInTheDocument();
    });
  });

  it('应该显示任务状态统计', async () => {
    const Dashboard = require('../../pages/Dashboard').default;
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('待办任务')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });
  });

  it('应该显示图表', async () => {
    const Dashboard = require('../../pages/Dashboard').default;
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-echarts')).toBeInTheDocument();
    });
  });

  it('应该处理加载状态', async () => {
    const { useAppSelector } = require('../../stores');
    useAppSelector.mockImplementation((selector: any) => {
      const state = {
        tasks: { tasks: [], loading: true, error: null, selectedTaskIds: [], filters: {}, sortOptions: { field: 'startDate', direction: 'asc' } },
        members: { members: [], loading: false, error: null, selectedMemberIds: [] },
        projects: { projects: [], loading: false, error: null, selectedProjectIds: [], currentProjectId: null },
        performance: { metrics: {}, loading: false, error: null },
        loading: { modules: { tasks: true } },
      };
      return selector(state);
    });

    const Dashboard = require('../../pages/Dashboard').default;
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});