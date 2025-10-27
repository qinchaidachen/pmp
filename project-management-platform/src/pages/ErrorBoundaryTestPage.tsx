import React from 'react';
import { Button, Card, Space, Typography, Alert } from 'antd';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ErrorBoundary } from '../components/ErrorBoundary';

const { Title, Paragraph } = Typography;

// 测试组件
const TestComponent: React.FC = () => {
  const { handleError } = useErrorHandler();

  const throwError = () => {
    throw new Error('这是一个测试错误！');
  };

  const handleAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('异步错误测试')), 1000);
      });
    } catch (error) {
      handleError(error as Error, {
        level: 'component',
        componentName: 'TestComponent',
        action: 'handleAsyncError',
      });
    }
  };

  return (
    <Card>
      <Title level={4}>错误边界测试</Title>
      <Paragraph>点击下面的按钮来测试错误边界功能。</Paragraph>
      <Space>
        <Button type="primary" danger onClick={throwError}>
          触发同步错误
        </Button>
        <Button onClick={handleAsyncError}>
          触发异步错误
        </Button>
      </Space>
    </Card>
  );
};

const ErrorBoundaryTestPage: React.FC = () => {
  return (
    <div className="p-6">
      <Title level={2}>错误边界测试页面</Title>
      
      <Alert
        message="测试说明"
        description="这个页面用于测试错误边界组件的功能。点击按钮会触发不同类型的错误。"
        type="info"
        showIcon
        className="mb-6"
      />

      <Space direction="vertical" size="large" className="w-full">
        <TestComponent />
        
        <ErrorBoundary level="component">
          <TestComponent />
        </ErrorBoundary>
      </Space>
    </div>
  );
};

export default ErrorBoundaryTestPage;