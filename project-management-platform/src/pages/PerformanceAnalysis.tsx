import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Button, 
  Table, 
  Progress, 
  Statistic, 
  Typography, 
  Space, 
  Alert,
  Tag,
  Tooltip,
  message
} from 'antd';
import { 
  TrophyOutlined, 
  CalculatorOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppDispatch, useAppSelector } from '../stores';
import { 
  fetchPerformanceMetrics, 
  calculatePerformanceMetrics, 
  recalculateAllMetrics 
} from '../stores/slices/performanceSlice';
import { fetchMembers } from '../stores/slices/membersSlice';
import { fetchTasks } from '../stores/slices/tasksSlice';
import { PerformanceMetric } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PerformanceAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    metrics, 
    loading, 
    selectedPeriod, 
    selectedTargetType, 
    lastCalculated 
  } = useAppSelector(state => state.performance);
  const { members } = useAppSelector(state => state.members);
  const { tasks } = useAppSelector(state => state.tasks);

  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [targetType, setTargetType] = useState<'member' | 'team' | 'all'>('member');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5分钟

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchTasks());
    dispatch(fetchPerformanceMetrics({ 
      period: analysisPeriod, 
      targetType 
    }));
  }, [dispatch, analysisPeriod, targetType]);

  // 自动刷新机制
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        handleRecalculate();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // 手动重新计算
  const handleRecalculate = useCallback(async () => {
    try {
      if (dateRange) {
        await dispatch(calculatePerformanceMetrics({ 
          period: analysisPeriod, 
          dateRange: {
            start: dateRange[0].toDate(),
            end: dateRange[1].toDate()
          }
        }));
      } else {
        await dispatch(recalculateAllMetrics());
      }
      message.success('效能指标重新计算完成');
    } catch (error) {
      message.error('效能指标计算失败');
    }
  }, [dispatch, analysisPeriod, dateRange]);

  // 获取效能分析数据
  const getFilteredMetrics = () => {
    let filtered = metrics;
    
    if (targetType !== 'all') {
      filtered = filtered.filter(m => m.targetType === targetType);
    }

    if (dateRange) {
      filtered = filtered.filter(m => 
        m.date >= dateRange[0].toDate() && m.date <= dateRange[1].toDate()
      );
    }

    return filtered;
  };

  const filteredMetrics = getFilteredMetrics();

  // 计算总体统计
  const getOverallStats = () => {
    if (filteredMetrics.length === 0) {
      return {
        avgEfficiency: 0,
        avgVelocity: 0,
        avgQuality: 0,
        totalCompleted: 0,
        topPerformer: null
      };
    }

    const avgEfficiency = filteredMetrics.reduce((sum, m) => sum + m.efficiencyScore, 0) / filteredMetrics.length;
    const avgVelocity = filteredMetrics.reduce((sum, m) => sum + m.velocity, 0) / filteredMetrics.length;
    const avgQuality = filteredMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / filteredMetrics.length;
    const totalCompleted = filteredMetrics.reduce((sum, m) => sum + m.tasksCompleted, 0);
    const topPerformer = filteredMetrics.reduce((best, current) => 
      current.efficiencyScore > best.efficiencyScore ? current : best
    );

    return {
      avgEfficiency,
      avgVelocity,
      avgQuality,
      totalCompleted,
      topPerformer
    };
  };

  const overallStats = getOverallStats();

  // 效率分布图表
  const getEfficiencyDistributionOption = () => {
    const efficiencyRanges = [
      { name: '优秀 (>2.0)', min: 2.0, max: Infinity, color: '#52c41a' },
      { name: '良好 (1.5-2.0)', min: 1.5, max: 2.0, color: '#1890ff' },
      { name: '一般 (1.0-1.5)', min: 1.0, max: 1.5, color: '#faad14' },
      { name: '较差 (<1.0)', min: 0, max: 1.0, color: '#ff4d4f' }
    ];

    const distribution = efficiencyRanges.map(range => ({
      name: range.name,
      value: filteredMetrics.filter(m => 
        m.efficiencyScore >= range.min && m.efficiencyScore < range.max
      ).length
    }));

    return {
      title: {
        text: '效率分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '效率分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: distribution,
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
  };

  // 效能趋势图
  const getPerformanceTrendOption = () => {
    const timeData = filteredMetrics
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .reduce((acc, metric) => {
        const dateKey = metric.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, efficiency: [], velocity: [] };
        }
        acc[dateKey].efficiency.push(metric.efficiencyScore);
        acc[dateKey].velocity.push(metric.velocity);
        return acc;
      }, {} as Record<string, any>);

    const dates = Object.keys(timeData).sort();
    const efficiencyData = dates.map(date => {
      const values = timeData[date].efficiency;
      return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    });
    const velocityData = dates.map(date => {
      const values = timeData[date].velocity;
      return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    });

    return {
      title: {
        text: '效能趋势',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['平均效率', '平均速率'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: dates.map(date => dayjs(date).format('MM-DD'))
      },
      yAxis: [
        {
          type: 'value',
          name: '效率分数',
          position: 'left'
        },
        {
          type: 'value',
          name: '速率(SP/周)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '平均效率',
          type: 'line',
          data: efficiencyData,
          smooth: true,
          lineStyle: { color: '#1890ff' }
        },
        {
          name: '平均速率',
          type: 'line',
          yAxisIndex: 1,
          data: velocityData,
          smooth: true,
          lineStyle: { color: '#52c41a' }
        }
      ]
    };
  };

  // 表格列定义
  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, record: PerformanceMetric, index: number) => (
        <div className="flex items-center">
          {index < 3 ? (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
              index === 0 ? 'bg-yellow-500' : 
              index === 1 ? 'bg-gray-400' : 
              'bg-orange-400'
            }`}>
              {index + 1}
            </div>
          ) : (
            <span className="text-gray-500">{index + 1}</span>
          )}
        </div>
      ),
    },
    {
      title: targetType === 'member' ? '成员' : '团队',
      key: 'target',
      render: (_, record: PerformanceMetric) => {
        if (record.targetType === 'member') {
          const member = members.find(m => m.id === record.targetId);
          return member ? (
            <div className="flex items-center space-x-2">
              <Text strong>{member.name}</Text>
              <Text type="secondary" className="text-sm">{member.role}</Text>
            </div>
          ) : '未知成员';
        } else {
          return <Text strong>团队 {record.targetId}</Text>;
        }
      },
    },
    {
      title: '效率分数',
      dataIndex: 'efficiencyScore',
      key: 'efficiencyScore',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.efficiencyScore - b.efficiencyScore,
      render: (score: number) => (
        <div className="flex items-center space-x-2">
          <Progress 
            percent={Math.min(score * 20, 100)} 
            size="small" 
            showInfo={false}
            strokeColor={score >= 2.0 ? '#52c41a' : score >= 1.5 ? '#1890ff' : score >= 1.0 ? '#faad14' : '#ff4d4f'}
          />
          <Text strong>{score.toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: '速率',
      dataIndex: 'velocity',
      key: 'velocity',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.velocity - b.velocity,
      render: (velocity: number) => `${velocity.toFixed(1)} SP/周`,
    },
    {
      title: '完成故事点',
      dataIndex: 'storyPointsCompleted',
      key: 'storyPointsCompleted',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.storyPointsCompleted - b.storyPointsCompleted,
    },
    {
      title: '投入人天',
      dataIndex: 'personDaysInvested',
      key: 'personDaysInvested',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.personDaysInvested - b.personDaysInvested,
    },
    {
      title: '完成任务',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.tasksCompleted - b.tasksCompleted,
    },
    {
      title: '平均周期',
      dataIndex: 'avgTaskCycleTime',
      key: 'avgTaskCycleTime',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.avgTaskCycleTime - b.avgTaskCycleTime,
      render: (hours: number) => `${hours.toFixed(1)}小时`,
    },
    {
      title: '质量分数',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.qualityScore - b.qualityScore,
      render: (score: number) => (
        <Tag color={score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'}>
          {score.toFixed(1)}
        </Tag>
      ),
    },
    {
      title: '百分位',
      dataIndex: 'percentile',
      key: 'percentile',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.percentile - b.percentile,
      render: (percentile: number) => `${percentile.toFixed(1)}%`,
    },
  ];

  return (
    <div className="performance-analysis">
      <div className="page-header mb-6">
        <Title level={2}>AI效能分析</Title>
        <Text type="secondary">基于数据驱动的智能效能分析和优化建议</Text>
      </div>

      {/* 控制面板 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong>分析周期</Text>
              <Select
                value={analysisPeriod}
                onChange={setAnalysisPeriod}
                className="w-full mt-1"
                size="small"
              >
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="quarter">本季度</Option>
                <Option value="year">本年</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong>分析对象</Text>
              <Select
                value={targetType}
                onChange={setTargetType}
                className="w-full mt-1"
                size="small"
              >
                <Option value="member">个人</Option>
                <Option value="team">团队</Option>
                <Option value="all">全部</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={8} md={8}>
            <div>
              <Text strong>时间范围</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full mt-1"
                size="small"
              />
            </div>
          </Col>

          <Col xs={24} sm={24} md={4}>
            <div className="text-right">
              <Space>
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={handleRecalculate}
                  loading={loading}
                >
                  重新计算
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        {lastCalculated && (
          <Alert
            message={`最后计算时间: ${lastCalculated.toLocaleString()}`}
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </Card>

      {/* 统计概览 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均效率"
              value={overallStats.avgEfficiency}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均速率"
              value={overallStats.avgVelocity}
              precision={1}
              suffix="SP/周"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均质量"
              value={overallStats.avgQuality}
              precision={1}
              suffix="分"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总完成任务"
              value={overallStats.totalCompleted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts 
              option={getEfficiencyDistributionOption()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts 
              option={getPerformanceTrendOption()} 
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 效能排行榜 */}
      <Card title={<div className="flex items-center"><TrophyOutlined className="mr-2" />效能排行榜</div>}>
        <Table
          columns={columns}
          dataSource={filteredMetrics.sort((a, b) => b.efficiencyScore - a.efficiencyScore)}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default PerformanceAnalysis;