import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import { mockTasks, mockMembers, mockProjects } from '../mocks/data';

// Mock all services and components
jest.mock('../../stores', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
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
      teams: {
        teams: [],
        loading: false,
        error: null,
        selectedTeamIds: [],
      },
      performance: {
        metrics: {},
        loading: false,
        error: null,
      },
      resources: {
        resources: [],
        loading: false,
        error: null,
        selectedResourceIds: [],
      },
      ui: {
        theme: 'light',
        sidebarCollapsed: false,
      },
      loading: {
        modules: {},
      },
      error: {
        hasError: false,
        error: null,
        errorInfo: null,
      },
    })),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
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
      teams: {
        teams: [],
        loading: false,
        error: null,
        selectedTeamIds: [],
      },
      performance: {
        metrics: {},
        loading: false,
        error: null,
      },
      resources: {
        resources: [],
        loading: false,
        error: null,
        selectedResourceIds: [],
      },
      ui: {
        theme: 'light',
        sidebarCollapsed: false,
      },
      loading: {
        modules: {},
      },
      error: {
        hasError: false,
        error: null,
        errorInfo: null,
      },
    };
    return selector(state);
  },
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div>{children}</div>,
  Routes: ({ children }: any) => <div>{children}</div>,
  Route: ({ element }: any) => element,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('echarts-for-react', () => {
  return function MockECharts() {
    return <div data-testid="mock-echarts">ECharts Component</div>;
  };
});

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard and TaskBoard Integration', () => {
    it('Dashboard应该正确显示从Redux store获取的数据', async () => {
      const Dashboard = require('../../pages/Dashboard').default;
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('项目管理仪表板')).toBeInTheDocument();
        expect(screen.getByText('总任务数')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // 2个任务
        expect(screen.getByText('总项目数')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // 1个项目
        expect(screen.getByText('团队成员')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // 2个成员
      });
    });

    it('Dashboard应该显示任务状态统计', async () => {
      const Dashboard = require('../../pages/Dashboard').default;
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('待办任务')).toBeInTheDocument();
        expect(screen.getByText('进行中')).toBeInTheDocument();
        expect(screen.getByText('已完成')).toBeInTheDocument();
      });
    });

    it('Dashboard应该显示图表组件', async () => {
      const Dashboard = require('../../pages/Dashboard').default;
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-echarts')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('应该在组件间正确处理错误状态', async () => {
      const { useAppSelector } = require('../../stores');
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          tasks: { tasks: [], loading: false, error: '任务加载失败', selectedTaskIds: [], filters: {}, sortOptions: { field: 'startDate', direction: 'asc' } },
          members: { members: [], loading: false, error: null, selectedMemberIds: [] },
          projects: { projects: [], loading: false, error: null, selectedProjectIds: [], currentProjectId: null },
          teams: { teams: [], loading: false, error: null, selectedTeamIds: [] },
          performance: { metrics: {}, loading: false, error: null },
          resources: { resources: [], loading: false, error: null, selectedResourceIds: [] },
          ui: { theme: 'light', sidebarCollapsed: false },
          loading: { modules: {} },
          error: { hasError: false, error: null, errorInfo: null },
        };
        return selector(state);
      });

      const Dashboard = require('../../pages/Dashboard').default;
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('任务加载失败')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Integration', () => {
    it('应该在组件间正确处理加载状态', async () => {
      const { useAppSelector } = require('../../stores');
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          tasks: { tasks: [], loading: true, error: null, selectedTaskIds: [], filters: {}, sortOptions: { field: 'startDate', direction: 'asc' } },
          members: { members: [], loading: true, error: null, selectedMemberIds: [] },
          projects: { projects: [], loading: true, error: null, selectedProjectIds: [], currentProjectId: null },
          teams: { teams: [], loading: false, error: null, selectedTeamIds: [] },
          performance: { metrics: {}, loading: false, error: null },
          resources: { resources: [], loading: false, error: null, selectedResourceIds: [] },
          ui: { theme: 'light', sidebarCollapsed: false },
          loading: { modules: { tasks: true, members: true, projects: true } },
          error: { hasError: false, error: null, errorInfo: null },
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
});