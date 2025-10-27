import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { ErrorInfo } from 'react';

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  retry: () => void;
  retryCount: number;
  maxRetries: number;
  title?: string;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  retry,
  retryCount,
  maxRetries,
  title = '出现了一些问题',
  showDetails = false,
}) => {
  const [showDetailsState, setShowDetailsState] = useState(showDetails);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 添加延迟改善用户体验
      retry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const formatErrorMessage = (error: Error): string => {
    return error.message || '未知错误';
  };

  const formatStackTrace = (error: Error): string => {
    return error.stack || '无堆栈信息';
  };

  const formatComponentStack = (errorInfo?: ErrorInfo | null): string => {
    return errorInfo?.componentStack || '无组件堆栈信息';
  };

  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
        {/* 头部 */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-red-800">{title}</h2>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 错误信息 */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bug className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-2">错误详情</h3>
                  <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded border">
                    {formatErrorMessage(error)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleRetry}
              disabled={!canRetry || isRetrying}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                canRetry && !isRetrying
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? '重试中...' : canRetry ? `重试 (${retryCount}/${maxRetries})` : '达到最大重试次数'}
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </button>

            <button
              onClick={() => setShowDetailsState(!showDetailsState)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {showDetailsState ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  隐藏详情
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  显示详情
                </>
              )}
            </button>
          </div>

          {/* 错误详情 */}
          {showDetailsState && (
            <div className="space-y-4">
              {/* 堆栈跟踪 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">堆栈跟踪</h4>
                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-48">
                  {formatStackTrace(error)}
                </pre>
              </div>

              {/* 组件堆栈 */}
              {errorInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">组件堆栈</h4>
                  <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-48">
                    {formatComponentStack(errorInfo)}
                  </pre>
                </div>
              )}

              {/* 错误ID和时间戳 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">错误信息</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">错误ID:</span> {Date.now()}-{Math.random().toString(36).substr(2, 9)}</p>
                  <p><span className="font-medium">时间戳:</span> {new Date().toLocaleString()}</p>
                  <p><span className="font-medium">用户代理:</span> {navigator.userAgent}</p>
                </div>
              </div>
            </div>
          )}

          {/* 帮助文本 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">提示:</span> 如果问题持续存在，请尝试刷新页面或联系技术支持。
              提供上述错误信息有助于我们更好地帮助您解决问题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};