import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Typography, Select, DatePicker, Tabs, Spin, Button, Tooltip } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useAppDispatch, useAppSelector } from '../stores';
import { fetchTasks } from '../stores/slices/tasksSlice';
import { fetchMembers } from '../stores/slices/membersSlice';
import { fetchProjects } from '../stores/slices/projectsSlice';
import { fetchPerformanceMetrics } from '../stores/slices/performanceSlice';
import { Task, TaskStatus } from '../types';
import dayjs from 'dayjs';

// 导入Loading组件
import { LoadingSpinner, SkeletonDashboard, LoadingOverlay } from '../components/Loading';
import { useLoading, createAsyncAction } from '../hooks/useLoading';
import { setModuleLoading } from '../stores/slices/loadingSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 性能监控配置
interface PerformanceMetrics {
  renderTime: number;
  dataSize: number;
  chartType: string;
  timestamp: number;
}

// 图表缓存配置
interface ChartCache {
  [key: string]: {
    option: any;
    timestamp: number;
    dataSize: number;
  };
}

// 懒加载配置
interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
}

// 虚拟滚动配置
interface VirtualScrollConfig {
  itemHeight: number;
  visibleCount: number;
}

const PERFORMANCE_THRESHOLD = 16; // 60fps
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const LAZY_LOAD_THRESHOLD = 0.1; // 10%可见时加载
const CHART_PAGE_SIZE = 50; // 图表数据分页大小
const VIRTUAL_SCROLL_ITEM_HEIGHT = 60;
const VIRTUAL_SCROLL_VISIBLE_COUNT = 10;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  const { members } = useAppSelector(state => state.members);
  const { projects } = useAppSelector(state => state.projects);
  const { teams } = useAppSelector(state => state.teams);
  const { metrics } = useAppSelector(state => state.performance);
  
  // 使用新的loading hook
  const { 
    globalLoading, 
    setModule, 
    setOperation, 
    getModuleSelector 
  } = useLoading();
  
  const dashboardLoading = useAppSelector(getModuleSelector('dashboard'));

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  
  // 性能优化状态
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState<Set<string>>(new Set());
  const [chartCache, setChartCache] = useState<ChartCache>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [virtualScrollIndex, setVirtualScrollIndex] = useState(0);

  // 引用管理
  const chartRefs = useRef<{[key: string]: any}>({});
  const performanceObserver = useRef<IntersectionObserver | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // 懒加载配置
  const lazyLoadConfig: LazyLoadConfig = {
    threshold: LAZY_LOAD_THRESHOLD,
    rootMargin: '50px'
  };

  // 虚拟滚动配置
  const virtualScrollConfig: VirtualScrollConfig = {
    itemHeight: VIRTUAL_SCROLL_ITEM_HEIGHT,
    visibleCount: VIRTUAL_SCROLL_VISIBLE_COUNT
  };

  // 性能监控函数
  const recordPerformance = useCallback((chartType: string, dataSize: number, renderTime: number) => {
    const metric: PerformanceMetrics = {
      renderTime,
      dataSize,
      chartType,
      timestamp: Date.now()
    };
    
    setPerformanceMetrics(prev => {
      const updated = [...prev, metric].slice(-100); // 保留最近100条记录
      return updated;
    });

    // 如果渲染时间过长，记录警告
    if (renderTime > PERFORMANCE_THRESHOLD) {
      console.warn(`Chart ${chartType} render time exceeded threshold: ${renderTime}ms`);
    }
  }, []);

  // 缓存管理
  const getCachedChart = useCallback((chartKey: string) => {
    const cached = chartCache[chartKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.option;
    }
    return null;
  }, [chartCache]);

  const setCachedChart = useCallback((chartKey: string, option: any, dataSize: number) => {
    setChartCache(prev => ({
      ...prev,
      [chartKey]: {
        option,
        timestamp: Date.now(),
        dataSize
      }
    }));
  }, []);

  // 懒加载观察器
  useEffect(() => {
    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
    }

    performanceObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const chartId = entry.target.getAttribute('data-chart-id');
          if (chartId) {
            if (entry.isIntersecting) {
              setVisibleCharts(prev => new Set([...prev, chartId]));
            } else {
              setVisibleCharts(prev => {
                const newSet = new Set(prev);
                newSet.delete(chartId);
                return newSet;
              });
            }
          }
        });
      },
      {
        threshold: lazyLoadConfig.threshold,
        rootMargin: lazyLoadConfig.rootMargin
      }
    );

    // 观察所有图表容器
    const chartContainers = document.querySelectorAll('[data-chart-id]');
    chartContainers.forEach(container => {
      performanceObserver.current?.observe(container);
    });

    return () => {
      performanceObserver.current?.disconnect();
    };
  }, [lazyLoadConfig.threshold, lazyLoadConfig.rootMargin]);

  // 自动刷新管理
  useEffect(() => {
    if (isAutoRefresh) {
      refreshTimer.current = setInterval(() => {
        dispatch(fetchTasks());
        dispatch(fetchPerformanceMetrics({ 
          period: selectedPeriod as any, 
          targetType: 'all' 
        }));
      }, 30000); // 30秒刷新一次
    } else {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    }

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [isAutoRefresh, selectedPeriod, dispatch]);

  // 数据获取（使用loading状态管理）
  useEffect(() => {
    const fetchDashboardData = async () => {
      setModule('dashboard', true);
      const startTime = performance.now();
      
      try {
        // 并行获取所有数据
        await Promise.all([
          dispatch(fetchTasks()).unwrap(),
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchProjects()).unwrap(),
          dispatch(fetchPerformanceMetrics({ 
            period: selectedPeriod as any, 
            targetType: 'all' 
          })).unwrap()
        ]);
        
        const endTime = performance.now();
        recordPerformance('data-fetch', tasks.length + members.length + projects.length, endTime - startTime);
      } catch (error) {
        console.error('获取仪表板数据失败:', error);
      } finally {
        setModule('dashboard', false);
      }
    };

    fetchDashboardData();
  }, [dispatch, selectedPeriod, recordPerformance, setModule, tasks.length, members.length, projects.length]);

  // 数据分页处理
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * CHART_PAGE_SIZE;
    const endIndex = startIndex + CHART_PAGE_SIZE;
    
    return {
      tasks: tasks.slice(startIndex, endIndex),
      members: members.slice(startIndex, endIndex),
      projects: projects.slice(startIndex, endIndex),
      metrics: metrics.slice(startIndex, endIndex)
    };
  }, [tasks, members, projects, metrics, currentPage]);

  // 虚拟滚动数据
  const virtualScrollData = useMemo(() => {
    const startIndex = virtualScrollIndex;
    const endIndex = startIndex + virtualScrollConfig.visibleCount;
    
    return {
      tasks: tasks.slice(startIndex, endIndex),
      totalItems: tasks.length,
      visibleStart: startIndex,
      visibleEnd: endIndex
    };
  }, [tasks, virtualScrollIndex, virtualScrollConfig.visibleCount]);

  // 计算统计数据（优化版本）
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.isActive).length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      totalMembers: activeMembers,
      totalProjects: projects.length,
      activeProjects,
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
    };
  }, [members, projects, tasks]);

  // 获取最近的任务（虚拟滚动优化）
  const recentTasks = useMemo(() => {
    return virtualScrollData.tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [virtualScrollData.tasks]);

  // 获取高效率成员（分页优化）
  const topPerformers = useMemo(() => {
    return paginatedData.metrics
      .filter(m => m.targetType === 'member')
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 5);
  }, [paginatedData.metrics]);

  // 优化的图表配置
  const getOptimizedChartConfig = useCallback((chartType: string) => {
    return {
      animation: chartType !== 'pie', // 饼图不启用动画以提升性能
      animationDuration: 300,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 300,
      animationEasingUpdate: 'cubicOut',
      progressive: 2000, // 启用渐进式渲染
      progressiveThreshold: 3000,
      progressiveChunkMode: 'mod',
      lazyUpdate: true,
      useDirtyRect: true, // 启用脏矩形优化
      // 禁用不必要的交互以提升性能
      emphasis: {
        disabled: chartType === 'pie'
      },
      hoverAnimation: chartType !== 'pie',
      animationDelay: (idx: number) => idx * 5, // 减少动画延迟
    };
  }, []);

  // 任务状态分布图表（缓存优化）
  const getTaskStatusChartOption = useCallback(() => {
    const chartKey = 'task-status-distribution';
    const cached = getCachedChart(chartKey);
    if (cached) return cached;

    const startTime = performance.now();
    
    const statusData = [
      { name: '待处理', value: tasks.filter(t => t.status === TaskStatus.PENDING).length, itemStyle: { color: '#d9d9d9' } },
      { name: '进行中', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, itemStyle: { color: '#1890ff' } },
      { name: '评审中', value: tasks.filter(t => t.status === TaskStatus.REVIEW).length, itemStyle: { color: '#faad14' } },
      { name: '已完成', value: tasks.filter(t => t.status === TaskStatus.COMPLETED).length, itemStyle: { color: '#52c41a' } },
      { name: '已阻塞', value: tasks.filter(t => t.status === TaskStatus.BLOCKED).length, itemStyle: { color: '#ff4d4f' } },
    ];

    const option = {
      ...getOptimizedChartConfig('pie'),
      title: {
        text: '任务状态分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '任务状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: statusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    const endTime = performance.now();
    recordPerformance('task-status-chart', statusData.length, endTime - startTime);
    setCachedChart(chartKey, option, statusData.length);
    
    return option;
  }, [tasks, getCachedChart, setCachedChart, getOptimizedChartConfig, recordPerformance]);

  // 项目燃尽图（懒加载优化）
  const getBurndownChartOption = useCallback(() => {
    const chartKey = 'burndown-chart';
    const cached = getCachedChart(chartKey);
    if (cached) return cached;

    const startTime = performance.now();
    
    const activeProject = projects.find(p => p.status === 'active');
    if (!activeProject) {
      return {
        title: { text: '项目燃尽图', left: 'center' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: []
      };
    }

    const projectTasks = paginatedData.tasks.filter(t => t.projectId === activeProject.id);
    const totalStoryPoints = projectTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    
    // 生成燃尽图数据
    const days = [];
    const remainingPoints = [];
    const current = new Date(activeProject.startDate);
    const end = new Date(activeProject.endDate);
    
    while (current <= end) {
      days.push(current.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      const completedPoints = projectTasks
        .filter(t => t.status === TaskStatus.COMPLETED && t.completedAt && t.completedAt <= current)
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      remainingPoints.push(totalStoryPoints - completedPoints);
      current.setDate(current.getDate() + 1);
    }

    const option = {
      ...getOptimizedChartConfig('line'),
      title: {
        text: `项目燃尽图 - ${activeProject.name}`,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: days
      },
      yAxis: {
        type: 'value',
        name: '剩余故事点'
      },
      series: [
        {
          name: '剩余故事点',
          type: 'line',
          data: remainingPoints,
          smooth: true,
          lineStyle: { color: '#1890ff' },
          areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
        }
      ]
    };

    const endTime = performance.now();
    recordPerformance('burndown-chart', days.length, endTime - startTime);
    setCachedChart(chartKey, option, days.length);
    
    return option;
  }, [projects, paginatedData.tasks, getCachedChart, setCachedChart, getOptimizedChartConfig, recordPerformance]);

  // 团队效率对比图（数据分页优化）
  const getTeamEfficiencyChartOption = useCallback(() => {
    const chartKey = 'team-efficiency-chart';
    const cached = getCachedChart(chartKey);
    if (cached) return cached;

    const startTime = performance.now();
    
    const teamEfficiency = teams.map(team => {
      const teamTasks = paginatedData.tasks.filter(t => t.teamId === team.id);
      const completedTasks = teamTasks.filter(t => t.status === TaskStatus.COMPLETED);
      const totalStoryPoints = teamTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      const completedStoryPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      const efficiency = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;
      
      return {
        name: team.name,
        value: efficiency.toFixed(1)
      };
    });

    const option = {
      ...getOptimizedChartConfig('bar'),
      title: {
        text: '团队效率对比',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: teamEfficiency.map(t => t.name),
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '完成率(%)',
        max: 100
      },
      series: [
        {
          name: '完成率',
          type: 'bar',
          data: teamEfficiency.map(t => t.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    };

    const endTime = performance.now();
    recordPerformance('team-efficiency-chart', teamEfficiency.length, endTime - startTime);
    setCachedChart(chartKey, option, teamEfficiency.length);
    
    return option;
  }, [teams, paginatedData.tasks, getCachedChart, setCachedChart, getOptimizedChartConfig, recordPerformance]);

  // 个人任务完成情况（虚拟滚动优化）
  const getPersonalPerformanceChartOption = useCallback(() => {
    const chartKey = 'personal-performance-chart';
    const cached = getCachedChart(chartKey);
    if (cached) return cached;

    const startTime = performance.now();
    
    const memberPerformance = virtualScrollData.tasks
      .filter((_, index) => index < VIRTUAL_SCROLL_VISIBLE_COUNT) // 只渲染可见项
      .map(task => {
        const member = members.find(m => m.id === task.memberId);
        if (!member) return null;
        
        const memberTasks = paginatedData.tasks.filter(t => t.memberId === member.id);
        const completedTasks = memberTasks.filter(t => t.status === TaskStatus.COMPLETED);
        const totalTasks = memberTasks.length;
        const completedCount = completedTasks.length;
        const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
        
        return {
          name: member.name,
          total: totalTasks,
          completed: completedCount,
          rate: completionRate
        };
      })
      .filter(Boolean);

    const option = {
      ...getOptimizedChartConfig('bar'),
      title: {
        text: '个人任务完成情况',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['总任务', '已完成'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: memberPerformance.map(m => m.name),
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '任务数量'
      },
      series: [
        {
          name: '总任务',
          type: 'bar',
          data: memberPerformance.map(m => m.total),
          itemStyle: { color: '#d9d9d9' }
        },
        {
          name: '已完成',
          type: 'bar',
          data: memberPerformance.map(m => m.completed),
          itemStyle: { color: '#52c41a' }
        }
      ]
    };

    const endTime = performance.now();
    recordPerformance('personal-performance-chart', memberPerformance.length, endTime - startTime);
    setCachedChart(chartKey, option, memberPerformance.length);
    
    return option;
  }, [virtualScrollData.tasks, members, paginatedData.tasks, getCachedChart, setCachedChart, getOptimizedChartConfig, recordPerformance]);

  // 渲染性能优化的图表组件
  const renderOptimizedChart = useCallback((chartId: string, getOption: () => any, height: string = '300px') => {
    const isVisible = visibleCharts.has(chartId);
    
    if (!isVisible) {
      return (
        <div 
          data-chart-id={chartId}
          className="flex items-center justify-center bg-gray-50"
          style={{ height }}
        >
          <Text type="secondary">图表将在可见时加载...</Text>
        </div>
      );
    }

    return (
      <div data-chart-id={chartId}>
        <ReactECharts 
          option={getOption()} 
          style={{ height }}
          opts={{ renderer: 'canvas' }}
          showLoading={isLoading}
          loadingOption={{
            text: '加载中...',
            color: '#1890ff',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.8)',
          }}
          onChartReady={(chart) => {
            chartRefs.current[chartId] = chart;
          }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  }, [visibleCharts, isLoading]);

  // 性能监控面板
  const renderPerformancePanel = () => {
    const avgRenderTime = performanceMetrics.length > 0 
      ? performanceMetrics.reduce((sum, m) => sum + m.renderTime, 0) / performanceMetrics.length 
      : 0;
    
    const slowCharts = performanceMetrics.filter(m => m.renderTime > PERFORMANCE_THRESHOLD);
    
    return (
      <Card title="性能监控" size="small" className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic 
              title="平均渲染时间" 
              value={avgRenderTime.toFixed(2)} 
              suffix="ms"
              valueStyle={{ color: avgRenderTime > PERFORMANCE_THRESHOLD ? '#ff4d4f' : '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="监控图表数" 
              value={performanceMetrics.length}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="慢图表数" 
              value={slowCharts.length}
              valueStyle={{ color: slowCharts.length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  // 虚拟滚动列表组件
  const renderVirtualScrollList = () => {
    const { totalItems, visibleStart, visibleEnd } = virtualScrollData;
    
    return (
      <div 
        style={{ height: totalItems * virtualScrollConfig.itemHeight, position: 'relative' }}
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          const newIndex = Math.floor(scrollTop / virtualScrollConfig.itemHeight);
          setVirtualScrollIndex(newIndex);
        }}
      >
        <div style={{ 
          transform: `translateY(${visibleStart * virtualScrollConfig.itemHeight}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}>
          {virtualScrollData.tasks.slice(0, VIRTUAL_SCROLL_VISIBLE_COUNT).map((task, index) => {
            const member = members.find(m => m.id === task.memberId);
            return (
              <div 
                key={task.id}
                style={{ 
                  height: virtualScrollConfig.itemHeight,
                  padding: '8px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Avatar icon={<UserOutlined />} size="small" />
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {member?.name || '未知成员'}
                  </div>
                </div>
                <Tag color={getTaskStatusColor(task.status)}>
                  {getTaskStatusText(task.status)}
                </Tag>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getTaskStatusColor = (status: TaskStatus): string => {
    const colors = {
      [TaskStatus.PENDING]: 'default',
      [TaskStatus.IN_PROGRESS]: 'processing',
      [TaskStatus.REVIEW]: 'warning',
      [TaskStatus.COMPLETED]: 'success',
      [TaskStatus.BLOCKED]: 'error',
    };
    return colors[status] || 'default';
  };

  const getTaskStatusText = (status: TaskStatus): string => {
    const texts = {
      [TaskStatus.PENDING]: '待处理',
      [TaskStatus.IN_PROGRESS]: '进行中',
      [TaskStatus.REVIEW]: '评审中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.BLOCKED]: '已阻塞',
    };
    return texts[status] || status;
  };

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    setOperation('dashboard-refresh', true, '正在刷新数据...');
    
    const refreshData = async () => {
      try {
        await Promise.all([
          dispatch(fetchTasks()).unwrap(),
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchProjects()).unwrap(),
          dispatch(fetchPerformanceMetrics({ 
            period: selectedPeriod as any, 
            targetType: 'all' 
          })).unwrap()
        ]);
      } catch (error) {
        console.error('刷新数据失败:', error);
      } finally {
        setOperation('dashboard-refresh', false);
      }
    };

    refreshData();
  }, [dispatch, selectedPeriod, setOperation]);

  // 判断是否显示骨架屏
  const showSkeleton = dashboardLoading || globalLoading;

  return (
    <div className="dashboard relative">
      {/* 全局加载覆盖层 */}
      <LoadingOverlay 
        isVisible={globalLoading} 
        text="正在加载仪表板..." 
        backdrop={true}
      />
      
      <div className="page-header mb-6">
        <Title level={2}>数据看板</Title>
        <div className="flex justify-between items-center">
          <Text type="secondary">多维度数据分析和可视化（性能优化版）</Text>
          <div className="flex space-x-4">
            <Tooltip title={isAutoRefresh ? "关闭自动刷新" : "开启自动刷新"}>
              <Button
                type={isAutoRefresh ? "primary" : "default"}
                icon={isAutoRefresh ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                {isAutoRefresh ? '自动刷新中' : '自动刷新'}
              </Button>
            </Tooltip>
            <Tooltip title="手动刷新数据">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={dashboardLoading}
              >
                刷新
              </Button>
            </Tooltip>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 120 }}
              disabled={dashboardLoading}
            >
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="quarter">本季度</Option>
              <Option value="year">本年</Option>
            </Select>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 150 }}
              disabled={dashboardLoading}
            >
              <Option value="all">所有项目</Option>
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* 骨架屏或实际内容 */}
      {showSkeleton ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* 性能监控面板 */}
          {renderPerformancePanel()}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃成员"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃项目"
              value={stats.activeProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="任务完成率"
              value={stats.completionRate}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域（懒加载优化） */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 任务状态分布 */}
        <Col xs={24} lg={12}>
          <Card>
            {renderOptimizedChart('task-status-chart', getTaskStatusChartOption)}
          </Card>
        </Col>

        {/* 项目燃尽图 */}
        <Col xs={24} lg={12}>
          <Card>
            {renderOptimizedChart('burndown-chart', getBurndownChartOption)}
          </Card>
        </Col>

        {/* 团队效率对比 */}
        <Col xs={24} lg={12}>
          <Card>
            {renderOptimizedChart('team-efficiency-chart', getTeamEfficiencyChartOption)}
          </Card>
        </Col>

        {/* 个人任务完成情况 */}
        <Col xs={24} lg={12}>
          <Card>
            {renderOptimizedChart('personal-performance-chart', getPersonalPerformanceChartOption)}
          </Card>
        </Col>
      </Row>

      {/* 详细信息区域 */}
      <Row gutter={[16, 16]}>
        {/* 最近任务（虚拟滚动优化） */}
        <Col xs={24} lg={12}>
          <Card title="最近任务" className="h-full">
            <List
              dataSource={recentTasks}
              renderItem={(task) => {
                const member = members.find(m => m.id === task.memberId);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div className="flex justify-between items-center">
                          <span>{task.title}</span>
                          <Tag color={getTaskStatusColor(task.status)}>
                            {getTaskStatusText(task.status)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div>{member?.name || '未知成员'}</div>
                          <div className="text-xs text-gray-500">
                            {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* 效能排行（分页优化） */}
        <Col xs={24} lg={12}>
          <Card title={<div className="flex items-center"><TrophyOutlined className="mr-2" />效能排行</div>} className="h-full">
            <List
              dataSource={topPerformers}
              renderItem={(metric, index) => {
                const member = members.find(m => m.id === metric.targetId);
                if (!member) return null;
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="relative">
                          <Avatar icon={<UserOutlined />} />
                          {index < 3 && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              'bg-orange-400'
                            }`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                      }
                      title={member.name}
                      description={
                        <div>
                          <div>效率分数: {metric.efficiencyScore.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            完成故事点: {metric.storyPointsCompleted} | 
                            投入人天: {metric.personDaysInvested}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 虚拟滚动演示区域 */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card title="虚拟滚动演示（大数据量优化）" extra={
            <div>
              <Text type="secondary">当前显示: {virtualScrollData.visibleStart + 1}-{virtualScrollData.visibleEnd} / {virtualScrollData.totalItems}</Text>
            </div>
          }>
            <div style={{ height: '400px', overflow: 'auto' }}>
              {renderVirtualScrollList()}
            </div>
          </Card>
        </Col>
      </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;