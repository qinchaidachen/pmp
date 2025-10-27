import { useCallback, useContext, useEffect } from 'react';
import { createContext, useContext as useReactContext } from 'react';

export interface ErrorContextType {
  errors: ErrorLog[];
  addError: (error: Error, context?: ErrorContext) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  getErrorById: (id: string) => ErrorLog | undefined;
}

// 创建ErrorContext
export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export interface ErrorContext {
  componentStack?: string;
  level?: 'page' | 'component' | 'global';
  timestamp?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface ErrorLog {
  id: string;
  error: Error;
  context: ErrorContext;
  timestamp: Date;
  resolved: boolean;
  retryCount?: number;
}

let globalErrorHandler: ((error: Error, context?: ErrorContext) => void) | null = null;

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);

  const handleError = useCallback((error: Error, context: ErrorContext = {}) => {
    // 添加默认上下文信息
    const enrichedContext: ErrorContext = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
      url: context.url || window.location.href,
      userAgent: context.userAgent || navigator.userAgent,
    };

    // 调用全局错误处理器
    if (globalErrorHandler) {
      globalErrorHandler(error, enrichedContext);
    }

    // 添加到错误上下文
    if (context) {
      context.addError(error, enrichedContext);
    }

    // 发送错误到监控服务（如果配置了）
    if (typeof window !== 'undefined' && (window as any).__ERROR_MONITOR__) {
      (window as any).__ERROR_MONITOR__(error, enrichedContext);
    }
  }, [context]);

  const setGlobalErrorHandler = useCallback((handler: (error: Error, context?: ErrorContext) => void) => {
    globalErrorHandler = handler;
  }, []);

  return {
    handleError,
    setGlobalErrorHandler,
    errors: context?.errors || [],
    removeError: context?.removeError || (() => {}),
    clearErrors: context?.clearErrors || (() => {}),
    getErrorById: context?.getErrorById || (() => undefined),
  };
};

// React错误处理Hook
export const useErrorHandlerHook = () => {
  const errorHandler = useErrorHandler();

  useEffect(() => {
    // 设置全局未捕获错误处理器
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
      error.stack = event.reason?.stack || '';
      errorHandler.handleError(error, {
        level: 'global',
        type: 'unhandledRejection',
        reason: event.reason,
      });
    };

    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack || '';
      errorHandler.handleError(error, {
        level: 'global',
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // 添加事件监听器
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // 清理函数
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [errorHandler]);

  return errorHandler;
};

// 错误边界Hook
export const useErrorBoundary = () => {
  const errorHandler = useErrorHandler();

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    errorHandler.handleError(error, {
      level: 'component',
      componentStack: errorInfo?.componentStack,
      ...errorInfo,
    });
  }, [errorHandler]);

  return { captureError };
};