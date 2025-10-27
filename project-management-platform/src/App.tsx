import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Provider } from 'react-redux';
import { store } from './stores';
import { DatabaseMigrationManager } from './utils/databaseMigration';
import { initializeDatabase } from './services/database';

// 错误边界组件
import { ErrorProvider, ErrorBoundary } from './components/ErrorBoundary';
import { useErrorHandlerHook } from './components/ErrorBoundary';

// 页面组件
import Dashboard from './pages/Dashboard';
import TaskBoardPage from './pages/TaskBoardPage';
import TeamManagement from './pages/TeamManagement';
import ResourceBooking from './pages/ResourceBooking';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import DataImportExport from './components/DataImportExport/DataImportExport';
import ImportTestData from './components/ImportTestData';
import Leaderboard from './pages/Leaderboard';
import TaskBoardExample from './examples/TaskBoardExample';
import ErrorBoundaryTestPage from './pages/ErrorBoundaryTestPage';

// 布局组件
import MainLayout from './components/Layout/MainLayout';

// 样式
import './App.css';

// 内部App组件，使用Hook
const AppContent: React.FC = () => {
  // 初始化全局错误处理
  useErrorHandlerHook();

  useEffect(() => {
    // 初始化应用
    const initializeApp = async () => {
      try {
        // 初始化数据库
        await initializeDatabase();
        
        // 执行数据库迁移
        await DatabaseMigrationManager.runMigrations();
        
        console.log('应用初始化完成');
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* 默认路由 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 主要功能页面 - 每个路由都用错误边界包装 */}
          <Route 
            path="/dashboard" 
            element={
              <ErrorBoundary level="page">
                <Dashboard />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/taskboard" 
            element={
              <ErrorBoundary level="page">
                <TaskBoardPage />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/team" 
            element={
              <ErrorBoundary level="page">
                <TeamManagement />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/resources" 
            element={
              <ErrorBoundary level="page">
                <ResourceBooking />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ErrorBoundary level="page">
                <PerformanceAnalysis />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ErrorBoundary level="page">
                <Leaderboard />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/data" 
            element={
              <ErrorBoundary level="page">
                <DataImportExport />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/test-data" 
            element={
              <ErrorBoundary level="page">
                <ImportTestData />
              </ErrorBoundary>
            } 
          />
          
          {/* 示例页面 */}
          <Route 
            path="/example/taskboard" 
            element={
              <ErrorBoundary level="page">
                <TaskBoardExample />
              </ErrorBoundary>
            } 
          />
          
          {/* 错误边界测试页面 */}
          <Route 
            path="/test/error-boundary" 
            element={
              <ErrorBoundary level="page">
                <ErrorBoundaryTestPage />
              </ErrorBoundary>
            } 
          />
          
          {/* 404页面 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorProvider>
        <ConfigProvider locale={zhCN}>
          <AntdApp>
            {/* 全局错误边界 */}
            <ErrorBoundary level="global">
              <AppContent />
            </ErrorBoundary>
          </AntdApp>
        </ConfigProvider>
      </ErrorProvider>
    </Provider>
  );
};

export default App;