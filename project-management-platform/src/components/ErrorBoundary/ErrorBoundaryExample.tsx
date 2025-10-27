import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert } from 'antd';
import { 
  ErrorBoundary, 
  ErrorFallback, 
  useErrorHandler,
  logError,
  logWarn,
  logInfo 
} from './index';

const { Title, Paragraph } = Typography;

// 示例错误组件
const BuggyComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('这是一个测试错误！');
  }

  return (
    <Card>
      <Title level={4}>易出错的组件</Title>
      <Paragraph>这个组件会在点击按钮后抛出错误。</Paragraph>
      <Button 
        type="primary" 
        danger
        onClick={() => setShouldThrow(true)}
      >
        触发错误
      </Button>
    </Card>
  );
};

// 使用Hook的组件
const HookExample: React.FC = () => {
  const { handleError } = useErrorHandler();

  const triggerError = () => {
    try {
      // 模拟一个错误
      throw new Error('通过Hook捕获的错误');
    } catch (error) {
      handleError(error as Error, {
        level: 'component',
        componentName: 'HookExample',
        action: 'triggerError',
      });
    }
  };

  const triggerPromiseError = () => {
    // 模拟Promise错误
    Promise.reject(new Error('未处理的Promise错误'));
  };

  return (
    <Card>
      <Title level={4}>Hook 示例</Title>
      <Paragraph>演示如何使用错误处理Hook。</Paragraph>
      <Space>
        <Button onClick={triggerError}>触发同步错误</Button>
        <Button onClick={triggerPromiseError}>触发Promise错误</Button>
      </Space>
    </Card>
  );
};

// 自定义错误边界示例
const CustomErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Card className="border-red-200 bg-red-50">
    <Alert
      message="自定义错误界面"
      description={`错误信息: ${error.message}`}
      type="error"
      showIcon
      action={
        <Button size="small" onClick={retry}>
          重试
        </Button>
      }
    />
  </Card>
);

// 嵌套错误边界示例
const NestedExample: React.FC = () => {
  return (
    <ErrorBoundary level="component">
      <div className="space-y-4">
        <Card>
          <Title level={4}>嵌套错误边界</Title>
          <Paragraph>外层错误边界会捕获内层组件的错误。</Paragraph>
        </Card>
        
        <ErrorBoundary level="component">
          <BuggyComponent />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

// 日志记录示例
const LoggingExample: React.FC = () => {
  const logExamples = () => {
    // 记录不同级别的日志
    logInfo('这是一条信息日志');
    logWarn('这是一条警告日志');
    logError(new Error('这是一条错误日志'), {
      level: 'component',
      source: 'LoggingExample',
    });
  };

  return (
    <Card>
      <Title level={4}>日志记录示例</Title>
      <Paragraph>演示如何记录不同级别的日志。</Paragraph>
      <Button onClick={logExamples}>生成日志</Button>
    </Card>
  );
};

export const ErrorBoundaryExample: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <Title level={2}>错误边界组件示例</Title>
      
      <Paragraph>
        这个页面展示了如何使用错误边界系统的各个功能。
        点击下面的按钮来测试不同的错误场景。
      </Paragraph>

      <Space direction="vertical" size="large" className="w-full">
        {/* 基础错误边界 */}
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>

        {/* 使用自定义Fallback */}
        <ErrorBoundary fallback={CustomErrorFallback}>
          <BuggyComponent />
        </ErrorBoundary>

        {/* Hook示例 */}
        <HookExample />

        {/* 嵌套错误边界 */}
        <NestedExample />

        {/* 日志记录示例 */}
        <LoggingExample />
      </Space>

      <Alert
        message="提示"
        description="在生产环境中，错误边界会优雅地处理错误并显示用户友好的错误界面。"
        type="info"
        showIcon
      />
    </div>
  );
};