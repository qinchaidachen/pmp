import React, { useState, useEffect } from 'react';
import { db, getPerformanceReport, maintenanceUtils } from '../services/database';

interface PerformanceData {
  averageQueryTime: number;
  slowQueries: any[];
  recentQueries: any[];
  totalQueries: number;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const report = getPerformanceReport();
      setPerformanceData(report);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('获取性能数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setIsLoading(true);
    try {
      await maintenanceUtils.optimize();
      await fetchPerformanceData();
      alert('数据库优化完成！');
    } catch (error) {
      console.error('数据库优化失败:', error);
      alert('数据库优化失败！');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPerformanceData = () => {
    maintenanceUtils.clearPerformanceData();
    fetchPerformanceData();
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // 每30秒自动刷新
    const interval = setInterval(fetchPerformanceData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    return ms < 1 ? `${(ms * 1000).toFixed(2)}μs` : `${ms.toFixed(2)}ms`;
  };

  const getQueryTimeColor = (time: number) => {
    if (time < 10) return 'text-green-600';
    if (time < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据库性能监控</h1>
        <p className="text-gray-600">
          最后更新: {lastUpdate.toLocaleString()}
        </p>
      </div>

      {/* 性能概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">平均查询时间</h3>
          <p className={`text-2xl font-bold ${getQueryTimeColor(performanceData?.averageQueryTime || 0)}`}>
            {formatTime(performanceData?.averageQueryTime || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">总查询数</h3>
          <p className="text-2xl font-bold text-blue-600">
            {performanceData?.totalQueries || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">慢查询数</h3>
          <p className="text-2xl font-bold text-orange-600">
            {performanceData?.slowQueries.length || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">最近查询</h3>
          <p className="text-2xl font-bold text-purple-600">
            {performanceData?.recentQueries.length || 0}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={fetchPerformanceData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '刷新中...' : '刷新数据'}
        </button>

        <button
          onClick={handleOptimizeDatabase}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? '优化中...' : '优化数据库'}
        </button>

        <button
          onClick={handleClearPerformanceData}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          清理性能数据
        </button>
      </div>

      {/* 慢查询列表 */}
      {performanceData?.slowQueries && performanceData.slowQueries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">慢查询记录</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    表名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    查询时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    结果数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间戳
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.slowQueries.map((query, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.table}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getQueryTimeColor(query.queryTime)}`}>
                      {formatTime(query.queryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.resultCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(query.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 最近查询 */}
      {performanceData?.recentQueries && performanceData.recentQueries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">最近查询</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    表名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    查询时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    结果数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    使用索引
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.recentQueries.map((query, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.table}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getQueryTimeColor(query.queryTime)}`}>
                      {formatTime(query.queryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {query.resultCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        query.indexed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {query.indexed ? '是' : '否'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {(!performanceData || performanceData.totalQueries === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无性能数据</p>
          <p className="text-gray-400 mt-2">开始使用应用程序以收集性能数据</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;