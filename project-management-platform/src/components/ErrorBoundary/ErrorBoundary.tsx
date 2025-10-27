import React from 'react';
import { ErrorFallback } from './ErrorFallback';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private readonly maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // 更新状态包含错误信息
    this.setState({
      errorInfo,
    });

    // 调用全局错误处理器
    const errorHandler = useErrorHandler();
    errorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
    });

    // 调用自定义错误处理
    if (onError) {
      onError(error, errorInfo);
    }

    // 记录错误日志
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // 达到最大重试次数，刷新页面
      window.location.reload();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback: Fallback, children } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} retry={this.handleRetry} />;
      }
      
      return (
        <ErrorFallback 
          error={error} 
          errorInfo={errorInfo}
          retry={this.handleRetry}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
        />
      );
    }

    return children;
  }
}