/**
 * 响应式组件测试文件
 * 用于验证响应式功能是否正常工作
 */

import React, { useState } from 'react';
import { Button, Space, Typography, Card } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import {
  ResponsiveLayout,
  ResponsiveTable,
  ResponsiveChart,
  useResponsive,
  useResponsiveValue,
} from '../Responsive';

const { Title, Text } = Typography;

// 测试数据
const testData = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: '前端工程师',
    department: '技术部',
    status: 'active',
    score: 95,
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'UI设计师',
    department: '设计部',
    status: 'active',
    score: 88,
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: '产品经理',
    department: '产品部',
    status: 'inactive',
    score: 92,
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '后端工程师',
    department: '技术部',
    status: 'active',
    score: 85,
  },
];

const ResponsiveTest: React.FC = () => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // 响应式表格列配置
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      hideOnMobile: true,
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
      hideOnTablet: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
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
      render: (score: number) => (
        <Text type={score >= 90 ? 'success' : score >= 80 ? 'warning' : 'danger'}>
          {score}分
        </Text>
      ),
    },
  ];

  // 表格操作
  const tableActions = {
    view: (record: typeof testData[0]) => {
      console.log('查看用户:', record.name);
    },
    edit: (record: typeof testData[0]) => {
      console.log('编辑用户:', record.name);
    },
    delete: (record: typeof testData[0]) => {
      console.log('删除用户:', record.name);
    },
  };

  // 侧边栏菜单
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
  ];

  // 响应式值
  const cardColumns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  });

  const chartHeight = useResponsiveValue({
    mobile: 300,
    tablet: 350,
    desktop: 400,
  });

  return (
    <ResponsiveLayout
      sidebar={{
        user: {
          name: '测试用户',
          role: '系统管理员',
        },
        menuItems,
        onUserMenuClick: (key) => {
          console.log('用户菜单点击:', key);
        },
      }}
      header={{
        title: '响应式组件测试',
        subtitle: '测试各种响应式组件的功能',
        actions: (
          <Space>
            <Button type="primary">新建项目</Button>
            <Button>导入数据</Button>
          </Space>
        ),
        breadcrumbs: [
          { title: '首页', path: '/' },
          { title: '响应式测试', path: '/responsive-test' },
        ],
      }}
    >
      <div className="space-y-6">
        {/* 设备信息显示 */}
        <Card size="small">
          <Title level={4}>当前设备信息</Title>
          <Space direction="vertical">
            <Text>设备类型: {currentBreakpoint}</Text>
            <Text>是否为移动端: {isMobile ? '是' : '否'}</Text>
            <Text>是否为平板: {isTablet ? '是' : '否'}</Text>
            <Text>卡片列数: {cardColumns}</Text>
            <Text>图表高度: {chartHeight}px</Text>
          </Space>
        </Card>

        {/* 响应式卡片网格 */}
        <Card title="响应式卡片网格" size="small">
          <div className="grid gap-4" style={{ 
            gridTemplateColumns: `repeat(${cardColumns}, 1fr)` 
          }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} size="small">
                <Title level={5}>卡片 {item}</Title>
                <Text type="secondary">这是一个响应式卡片</Text>
              </Card>
            ))}
          </div>
        </Card>

        {/* 响应式表格 */}
        <ResponsiveTable
          title="用户列表"
          columns={columns}
          dataSource={testData}
          rowKey="id"
          actions={tableActions}
          pagination={{
            current: 1,
            pageSize: 10,
            total: testData.length,
          }}
          onRefresh={() => {
            console.log('表格刷新');
          }}
          onExport={() => {
            console.log('表格导出');
          }}
        />

        {/* 响应式图表 */}
        <ResponsiveChart
          title="数据趋势图"
          subtitle="展示业务数据的变化趋势"
          height={chartHeight}
          actions={{
            period: {
              value: selectedPeriod,
              options: [
                { label: '最近7天', value: '7d' },
                { label: '最近30天', value: '30d' },
                { label: '最近90天', value: '90d' },
              ],
              onChange: setSelectedPeriod,
            },
            refresh: () => {
              console.log('图表刷新');
            },
            export: () => {
              console.log('图表导出');
            },
          }}
        >
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded">
            <div className="text-center">
              <Title level={3} type="secondary">📊</Title>
              <Text type="secondary">这里可以放置你的图表组件</Text>
              <br />
              <Text type="secondary" className="text-sm">
                (如 ECharts、Chart.js、Recharts 等)
              </Text>
            </div>
          </div>
        </ResponsiveChart>

        {/* 功能测试区域 */}
        <Card title="功能测试" size="small">
          <Space wrap>
            <Button 
              onClick={() => {
                console.log('测试按钮被点击');
                alert('响应式组件工作正常！');
              }}
            >
              测试响应式功能
            </Button>
            <Button 
              type="primary"
              onClick={() => {
                window.location.reload();
              }}
            >
              重新加载页面
            </Button>
          </Space>
          
          <div className="mt-4">
            <Text type="secondary">
              请调整浏览器窗口大小来测试响应式效果。
              在移动设备上，侧边栏将变为抽屉式导航，
              表格将转换为卡片布局。
            </Text>
          </div>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default ResponsiveTest;