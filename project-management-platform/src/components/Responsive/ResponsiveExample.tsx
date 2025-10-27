/**
 * 响应式设计组件使用示例
 * 展示如何在项目中使用响应式组件和hooks
 */

import React, { useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  ResponsiveLayout,
  ResponsiveTable,
  ResponsiveChart,
  useResponsive,
  useResponsiveValue,
  useTouchGestures,
  type ResponsiveTableProps,
} from './index';

const { Title, Text } = Typography;

// 示例数据
const sampleData = [
  {
    id: '1',
    name: '张三',
    role: '项目经理',
    department: '技术部',
    status: 'active',
    score: 95,
  },
  {
    id: '2',
    name: '李四',
    role: '开发工程师',
    department: '技术部',
    status: 'active',
    score: 88,
  },
  {
    id: '3',
    name: '王五',
    role: 'UI设计师',
    department: '设计部',
    status: 'inactive',
    score: 92,
  },
];

const ResponsiveExample: React.FC = () => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // 响应式表格列配置
  const columns: ResponsiveTableProps<typeof sampleData[0]>['columns'] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '职位',
      dataIndex: 'role',
      key: 'role',
      hideOnMobile: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      hideOnMobile: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Text type={status === 'active' ? 'success' : 'secondary'}>
          {status === 'active' ? '在职' : '离职'}
        </Text>
      ),
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      sorter: true,
      render: (score) => (
        <Text type={score >= 90 ? 'success' : score >= 80 ? 'warning' : 'danger'}>
          {score}分
        </Text>
      ),
    },
  ];

  // 表格操作配置
  const tableActions = {
    view: (record: typeof sampleData[0]) => {
      message.info(`查看 ${record.name} 的详情`);
    },
    edit: (record: typeof sampleData[0]) => {
      message.info(`编辑 ${record.name} 的信息`);
    },
    delete: (record: typeof sampleData[0]) => {
      message.warning(`删除 ${record.name}`);
    },
  };

  // 图表期间选项
  const periodOptions = [
    { label: '最近7天', value: '7d' },
    { label: '最近30天', value: '30d' },
    { label: '最近90天', value: '90d' },
  ];

  // 触摸手势示例
  const { elementRef, swipeDirection, isLongPress } = useTouchGestures({
    threshold: 50,
  });

  React.useEffect(() => {
    if (swipeDirection) {
      message.info(`检测到${swipeDirection}滑动`);
    }
    if (isLongPress) {
      message.info('检测到长按操作');
    }
  }, [swipeDirection, isLongPress]);

  // 响应式值示例
  const cardColumns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  });

  // 侧边栏菜单配置
  const sidebarMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
  ];

  // 头部操作按钮
  const headerActions = (
    <Space>
      <Button type="primary">新建</Button>
      <Button>导入</Button>
      <Button>导出</Button>
    </Space>
  );

  // 面包屑导航
  const breadcrumbs = [
    { title: '首页', path: '/' },
    { title: '响应式示例', path: '/responsive-example' },
  ];

  return (
    <ResponsiveLayout
      sidebar={{
        user: {
          name: '张三',
          role: '系统管理员',
        },
        menuItems: sidebarMenuItems,
        onUserMenuClick: (key) => {
          message.info(`用户菜单: ${key}`);
        },
      }}
      header={{
        title: '响应式设计示例',
        subtitle: '展示响应式组件的使用方法',
        actions: headerActions,
        breadcrumbs,
      }}
    >
      <div ref={elementRef} className="space-y-6">
        {/* 响应式信息展示 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <Title level={4}>当前设备信息</Title>
          <Space direction="vertical">
            <Text>设备类型: {currentBreakpoint}</Text>
            <Text>是否为移动端: {isMobile ? '是' : '否'}</Text>
            <Text>是否为平板: {isTablet ? '是' : '否'}</Text>
            <Text>卡片列数: {cardColumns}</Text>
          </Space>
        </div>

        {/* 响应式卡片网格 */}
        <div className="grid gap-4" style={{ 
          gridTemplateColumns: `repeat(${cardColumns}, 1fr)` 
        }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-4 rounded-lg border">
              <Title level={5}>卡片 {item}</Title>
              <Text type="secondary">这是一个响应式卡片</Text>
            </div>
          ))}
        </div>

        {/* 响应式表格 */}
        <ResponsiveTable
          title="用户列表"
          columns={columns}
          dataSource={sampleData}
          rowKey="id"
          actions={tableActions}
          pagination={{
            current: 1,
            pageSize: 10,
            total: sampleData.length,
          }}
          onRefresh={() => {
            message.success('数据已刷新');
          }}
          onExport={() => {
            message.success('数据已导出');
          }}
        />

        {/* 响应式图表 */}
        <ResponsiveChart
          title="数据趋势"
          subtitle="展示业务数据的变化趋势"
          height={400}
          actions={{
            period: {
              value: selectedPeriod,
              options: periodOptions,
              onChange: setSelectedPeriod,
            },
            refresh: () => {
              message.success('图表已刷新');
            },
            export: () => {
              message.success('图表已导出');
            },
          }}
        >
          <div className="h-full flex items-center justify-center bg-gray-50 rounded">
            <Text type="secondary">这里可以放置图表组件（如ECharts、Chart.js等）</Text>
          </div>
        </ResponsiveChart>

        {/* 触摸手势示例 */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <Title level={4}>触摸手势示例</Title>
          <Text>请在移动设备上尝试滑动或长按此区域</Text>
          <div 
            className="mt-4 h-32 bg-white rounded border-2 border-dashed border-gray-300 
                       flex items-center justify-center cursor-pointer"
            ref={elementRef}
          >
            <Text type="secondary">滑动或长按这里测试手势</Text>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ResponsiveExample;