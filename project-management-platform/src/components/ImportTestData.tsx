import React, { useState } from 'react';
import { Card, Button, message, Space, Statistic, Row, Col, Divider, Alert } from 'antd';
import { DatabaseOutlined, ImportOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { db } from '../services/database';
import { importTestData, clearTestData } from '../data/testData';
import { getDatabaseStats } from '../services/database';

interface ImportTestDataProps {
  className?: string;
}

const ImportTestData: React.FC<ImportTestDataProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [imported, setImported] = useState(false);

  // 获取数据库统计信息
  const fetchStats = async () => {
    try {
      const currentStats = await getDatabaseStats();
      setStats(currentStats);
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 导入测试数据
  const handleImport = async () => {
    setLoading(true);
    try {
      await importTestData(db);
      message.success('测试数据导入成功！');
      setImported(true);
      await fetchStats();
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入测试数据失败，请检查控制台错误信息');
    } finally {
      setLoading(false);
    }
  };

  // 清空测试数据
  const handleClear = async () => {
    setLoading(true);
    try {
      await clearTestData(db);
      message.success('测试数据清空成功！');
      setImported(false);
      await fetchStats();
    } catch (error) {
      console.error('清空失败:', error);
      message.error('清空测试数据失败，请检查控制台错误信息');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取统计信息
  React.useEffect(() => {
    fetchStats();
  }, []);

  const dataSummary = [
    { label: '业务线', count: stats?.businessLines || 0, color: '#1890ff' },
    { label: '角色', count: stats?.roles || 0, color: '#52c41a' },
    { label: '团队', count: stats?.teams || 0, color: '#722ed1' },
    { label: '成员', count: stats?.members || 0, color: '#fa8c16' },
    { label: '项目', count: stats?.projects || 0, color: '#eb2f96' },
    { label: '任务', count: stats?.tasks || 0, color: '#13c2c2' },
    { label: '资源', count: stats?.resources || 0, color: '#a0d911' },
    { label: '资源预订', count: stats?.resourceBookings || 0, color: '#fa541c' },
    { label: '效能指标', count: stats?.performanceMetrics || 0, color: '#2f54eb' }
  ];

  return (
    <div className={className}>
      <Card title={
        <Space>
          <DatabaseOutlined />
          <span>测试数据管理</span>
        </Space>
      }>
        <Alert
          message="功能说明"
          description="此工具用于导入和清空测试数据，帮助您快速体验项目管理平台的所有功能，包括甘特图视图、任务看板、效能分析等。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {dataSummary.map((item, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Statistic
                title={item.label}
                value={item.count}
                valueStyle={{ color: item.color }}
                prefix={<DatabaseOutlined />}
              />
            </Col>
          ))}
        </Row>

        <Divider />

        <Space size="large">
          <Button
            type="primary"
            icon={<ImportOutlined />}
            loading={loading}
            onClick={handleImport}
            size="large"
            disabled={imported}
          >
            {imported ? '已导入测试数据' : '导入测试数据'}
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            loading={loading}
            onClick={handleClear}
            size="large"
            disabled={!imported}
          >
            清空测试数据
          </Button>

          {imported && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={fetchStats}
            >
              刷新统计
            </Button>
          )}
        </Space>

        {imported && (
          <Alert
            message="导入成功"
            description="测试数据已成功导入！现在您可以：1) 访问任务看板查看甘特图功能 2) 查看成员效能分析 3) 测试资源预订功能"
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ImportTestData;