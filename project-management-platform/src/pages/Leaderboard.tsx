import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Tag, 
  Progress, 
  Space, 
  Button,
  Tabs,
  List,
  Divider,
  Tooltip,
  Badge
} from 'antd';
import { 
  TrophyOutlined, 
  CrownOutlined, 
  StarOutlined, 
  FireOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppDispatch, useAppSelector } from '../stores';
import { fetchPerformanceMetrics } from '../stores/slices/performanceSlice';
import { fetchMembers } from '../stores/slices/membersSlice';
import { fetchTasks } from '../stores/slices/tasksSlice';
import { fetchTeams } from '../stores/slices/teamsSlice';
import { performanceService } from '../services/performanceService';
import { PerformanceMetric, TaskStatus } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Leaderboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { metrics, loading } = useAppSelector(state => state.performance);
  const { members } = useAppSelector(state => state.members);
  const { teams } = useAppSelector(state => state.teams);
  const { tasks } = useAppSelector(state => state.tasks);

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'efficiencyScore' | 'velocity' | 'qualityScore'>('efficiencyScore');
  const [selectedType, setSelectedType] = useState<'member' | 'team'>('member');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchTeams());
    dispatch(fetchTasks());
    loadLeaderboardData();
  }, [dispatch, selectedPeriod, selectedType, selectedMetric, dateRange]);

  const loadLeaderboardData = async () => {
    try {
      const data = await performanceService.getLeaderboard(
        selectedPeriod,
        selectedType,
        selectedMetric,
        50
      );
      setLeaderboardData(data);
    } catch (error) {
      console.error('加载排行榜数据失败:', error);
    }
  };

  // 获取排名变化趋势
  const getRankingTrend = (targetId: string) => {
    // 这里可以实现排名变化趋势的逻辑
    // 目前返回模拟数据
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      trends.push({
        date: date.format('MM-DD'),
        rank: Math.floor(Math.random() * 10) + 1,
        score: Math.random() * 3 + 1
      });
    }
    return trends;
  };

  // 排名趋势图表
  const getRankingTrendChartOption = (targetId: string) => {
    const trendData = getRankingTrend(targetId);
    
    return {
      title: {
        text: '排名趋势',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'normal' }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: trendData.map(t => t.date)
      },
      yAxis: [
        {
          type: 'value',
          name: '排名',
          inverse: true, // 排名越小越好，所以反转
          max: 10,
          min: 1
        },
        {
          type: 'value',
          name: '分数',
          position: 'right'
        }
      ],
      series: [
        {
          name: '排名',
          type: 'line',
          yAxisIndex: 0,
          data: trendData.map(t => t.rank),
          smooth: true,
          lineStyle: { color: '#1890ff' },
          areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
        },
        {
          name: '分数',
          type: 'line',
          yAxisIndex: 1,
          data: trendData.map(t => t.score.toFixed(2)),
          smooth: true,
          lineStyle: { color: '#52c41a' }
        }
      ]
    };
  };

  // 获取排名徽章
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <CrownOutlined style={{ color: '#faad14', fontSize: '20px' }} />;
    } else if (rank === 2) {
      return <StarOutlined style={{ color: '#c0c0c0', fontSize: '18px' }} />;
    } else if (rank === 3) {
      return <StarOutlined style={{ color: '#cd7f32', fontSize: '18px' }} />;
    } else {
      return <span className="text-gray-500 font-medium">#{rank}</span>;
    }
  };

  // 获取排名变化图标
  const getRankChangeIcon = (currentRank: number, previousRank: number) => {
    if (currentRank < previousRank) {
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    } else if (currentRank > previousRank) {
      return <FallOutlined style={{ color: '#ff4d4f' }} />;
    } else {
      return <span style={{ color: '#d9d9d9' }}>—</span>;
    }
  };

  // 个人排行榜表格列
  const memberColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index: number) => (
        <div className="flex items-center justify-center">
          {getRankBadge(index + 1)}
        </div>
      ),
    },
    {
      title: '成员',
      key: 'member',
      render: (_, record: PerformanceMetric) => {
        const member = members.find(m => m.id === record.targetId);
        if (!member) return <Text type="secondary">未知成员</Text>;
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar icon={<UserOutlined />} />
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-gray-500">{member.role}</div>
            </div>
          </div>
        );
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
      render: (velocity: number) => (
        <div className="flex items-center space-x-1">
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <Text strong>{velocity.toFixed(1)}</Text>
          <Text type="secondary" className="text-sm">SP/周</Text>
        </div>
      ),
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
      render: (percentile: number) => (
        <div className="flex items-center space-x-1">
          <StarOutlined style={{ color: '#faad14' }} />
          <Text strong>{percentile.toFixed(1)}%</Text>
        </div>
      ),
    },
  ];

  // 团队排行榜表格列
  const teamColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index: number) => (
        <div className="flex items-center justify-center">
          {getRankBadge(index + 1)}
        </div>
      ),
    },
    {
      title: '团队',
      key: 'team',
      render: (_, record: PerformanceMetric) => {
        const team = teams.find(t => t.id === record.targetId);
        if (!team) return <Text type="secondary">未知团队</Text>;
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <div className="font-medium">{team.name}</div>
              <div className="text-sm text-gray-500">{team.memberIds.length} 名成员</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '团队效率',
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
      title: '团队速率',
      dataIndex: 'velocity',
      key: 'velocity',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.velocity - b.velocity,
      render: (velocity: number) => (
        <div className="flex items-center space-x-1">
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <Text strong>{velocity.toFixed(1)}</Text>
          <Text type="secondary" className="text-sm">SP/周</Text>
        </div>
      ),
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
  ];

  // 获取前三名数据
  const getTopThree = () => {
    return leaderboardData.slice(0, 3);
  };

  const topThree = getTopThree();

  return (
    <div className="leaderboard">
      <div className="page-header mb-6">
        <Title level={2}>效能排行榜</Title>
        <Text type="secondary">团队和个人效能排名展示，激励持续改进</Text>
      </div>

      {/* 控制面板 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6} md={4}>
            <div>
              <Text strong>排行榜类型</Text>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                className="w-full mt-1"
                size="small"
              >
                <Option value="member">个人排行</Option>
                <Option value="team">团队排行</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={6} md={4}>
            <div>
              <Text strong>时间周期</Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
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

          <Col xs={24} sm={6} md={4}>
            <div>
              <Text strong>排序指标</Text>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                className="w-full mt-1"
                size="small"
              >
                <Option value="efficiencyScore">效率分数</Option>
                <Option value="velocity">工作速率</Option>
                <Option value="qualityScore">质量分数</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={6} md={8}>
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
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={loadLeaderboardData}
                loading={loading}
              >
                刷新排行
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 领奖台 */}
      {topThree.length > 0 && (
        <Card className="mb-6">
          <Title level={4} className="text-center mb-4">
            <TrophyOutlined className="mr-2" />
            {selectedType === 'member' ? '个人效能榜' : '团队效能榜'}
          </Title>
          
          <Row gutter={[16, 16]} justify="center" align="bottom">
            {topThree.map((item, index) => {
              const target = selectedType === 'member' 
                ? members.find(m => m.id === item.targetId)
                : teams.find(t => t.id === item.targetId);
              
              if (!target) return null;

              return (
                <Col key={item.id} xs={24} sm={8}>
                  <Card className={`text-center ${index === 0 ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' : 
                    index === 1 ? 'bg-gradient-to-b from-gray-50 to-gray-100' : 
                    'bg-gradient-to-b from-orange-50 to-orange-100'}`}>
                    <div className="py-4">
                      <div className="mb-4">
                        {index === 0 && <CrownOutlined style={{ fontSize: '48px', color: '#faad14' }} />}
                        {index === 1 && <StarOutlined style={{ fontSize: '42px', color: '#c0c0c0' }} />}
                        {index === 2 && <StarOutlined style={{ fontSize: '42px', color: '#cd7f32' }} />}
                      </div>
                      
                      <div className="mb-3">
                        {selectedType === 'member' ? (
                          <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        ) : (
                          <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <Text strong className="text-lg">
                          {'name' in target ? target.name : '未知'}
                        </Text>
                      </div>
                      
                      <div className="mb-2">
                        <Text type="secondary">
                          {'role' in target ? target.role : `${target.memberIds?.length || 0} 名成员`}
                        </Text>
                      </div>
                      
                      <div className="mb-2">
                        <Text strong className="text-xl text-blue-600">
                          {item.efficiencyScore.toFixed(2)}
                        </Text>
                        <Text type="secondary" className="text-sm ml-1">效率分数</Text>
                      </div>
                      
                      <div className="mb-2">
                        <Tag color="gold">第 {index + 1} 名</Tag>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        完成 {item.storyPointsCompleted} SP | {item.tasksCompleted} 任务
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* 排行榜表格 */}
      <Card>
        <Tabs defaultActiveKey="ranking">
          <TabPane tab={<span><TrophyOutlined />完整排行</span>} key="ranking">
            <Table
              columns={selectedType === 'member' ? memberColumns : teamColumns}
              dataSource={leaderboardData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          
          <TabPane tab={<span><LineChartOutlined />趋势分析</span>} key="trend">
            <Row gutter={[16, 16]}>
              {leaderboardData.slice(0, 6).map((item) => {
                const target = selectedType === 'member' 
                  ? members.find(m => m.id === item.targetId)
                  : teams.find(t => t.id === item.targetId);
                
                if (!target) return null;

                return (
                  <Col xs={24} lg={12} key={item.id}>
                    <Card size="small">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {selectedType === 'member' ? (
                            <Avatar icon={<UserOutlined />} />
                          ) : (
                            <Avatar icon={<TeamOutlined />} />
                          )}
                          <div>
                            <Text strong>{'name' in target ? target.name : '未知'}</Text>
                            <div className="text-xs text-gray-500">
                              {'role' in target ? target.role : `${target.memberIds?.length || 0} 名成员`}
                            </div>
                          </div>
                        </div>
                        <Tag color="blue">#{leaderboardData.findIndex(d => d.id === item.id) + 1}</Tag>
                      </div>
                      <ReactECharts 
                        option={getRankingTrendChartOption(item.targetId)} 
                        style={{ height: '200px' }}
                        opts={{ renderer: 'canvas' }}
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Leaderboard;