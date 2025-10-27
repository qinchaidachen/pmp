import React, { useState, useEffect } from 'react';
import { Button, Card, message } from 'antd';
import { 
  LoadingSpinner, 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonList, 
  SkeletonChart, 
  SkeletonDashboard,
  LoadingOverlay, 
  LoadingSection 
} from '../components/Loading';
import { useLoading, createAsyncAction } from '../hooks/useLoading';
import { useAppDispatch, useAppSelector } from '../stores';
import { fetchTasks } from '../stores/slices/tasksSlice';

export const LoadingExamples: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  const { setModule, setOperation, getModuleSelector } = useLoading();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSection, setShowSection] = useState(false);

  // 使用loading hook示例
  const dashboardLoading = useAppSelector(getModuleSelector('dashboard'));

  // 创建带loading状态的异步操作
  const fetchDataWithLoading = createAsyncAction(
    'fetch-data',
    async (delay: number = 2000) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return { success: true, data: '数据加载完成' };
    },
    setOperation
  );

  // 模拟数据加载
  const handleLoadData = async () => {
    setModule('dashboard', true);
    try {
      await dispatch(fetchTasks()).unwrap();
      message.success('数据加载成功');
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setModule('dashboard', false);
    }
  };

  // 模拟异步操作
  const handleAsyncOperation = async () => {
    const result = await fetchDataWithLoading(3000);
    message.success(result.data);
  };

  return (
    <div className="p-6 space-y-8">
      <Card title="Loading组件使用示例">
        
        {/* 1. LoadingSpinner 示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">1. LoadingSpinner 加载旋转器</h3>
          <div className="flex gap-4 items-center">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" text="加载中..." />
            <LoadingSpinner size="lg" color="primary" text="正在处理..." />
            <LoadingSpinner size="xl" color="secondary" text="请稍候" />
          </div>
        </div>

        {/* 2. Skeleton 骨架屏示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">2. Skeleton 骨架屏组件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">基本骨架屏</h4>
              <Skeleton width="100%" height="20px" />
              <Skeleton width="80%" height="16px" className="mt-2" />
              <Skeleton width="60%" height="16px" className="mt-2" />
            </div>
            <div>
              <h4 className="font-medium mb-2">文本骨架屏</h4>
              <Skeleton variant="text" lines={3} />
            </div>
          </div>
        </div>

        {/* 3. 预定义骨架屏组件 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">3. 预定义骨架屏组件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">卡片骨架屏</h4>
              <SkeletonCard />
            </div>
            <div>
              <h4 className="font-medium mb-2">表格骨架屏</h4>
              <SkeletonTable rows={3} cols={4} />
            </div>
            <div>
              <h4 className="font-medium mb-2">列表骨架屏</h4>
              <SkeletonList items={2} />
            </div>
            <div>
              <h4 className="font-medium mb-2">图表骨架屏</h4>
              <SkeletonChart />
            </div>
          </div>
        </div>

        {/* 4. LoadingOverlay 示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">4. LoadingOverlay 加载覆盖层</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={() => setShowOverlay(true)}>显示全局覆盖层</Button>
              <Button onClick={() => setShowSection(true)}>显示局部覆盖层</Button>
            </div>
            
            {/* 全局覆盖层 */}
            <LoadingOverlay 
              isVisible={showOverlay} 
              text="正在处理您的请求..." 
              backdrop={true}
            />
            
            {/* 局部覆盖层 */}
            <div className="relative h-64 border border-gray-300 rounded">
              <div className="p-4">
                <h4 className="font-medium">内容区域</h4>
                <p className="text-gray-600">这里是一些内容...</p>
              </div>
              <LoadingSection 
                isVisible={showSection} 
                text="加载中..." 
                minHeight="200px"
              />
            </div>
          </div>
        </div>

        {/* 5. 实际应用示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">5. 实际应用示例</h3>
          
          {/* 模拟数据加载 */}
          <div className="mb-4">
            <Button 
              type="primary" 
              onClick={handleLoadData}
              loading={dashboardLoading}
            >
              加载任务数据
            </Button>
            <span className="ml-4 text-sm text-gray-600">
              当前任务数: {tasks.length}
            </span>
          </div>

          {/* 模拟异步操作 */}
          <div className="mb-4">
            <Button onClick={handleAsyncOperation}>
              执行异步操作
            </Button>
          </div>

          {/* 条件渲染骨架屏 */}
          <div className="border rounded p-4">
            <h4 className="font-medium mb-4">条件渲染示例</h4>
            {dashboardLoading ? (
              <SkeletonDashboard />
            ) : (
              <div className="space-y-4">
                <p>这里显示实际内容...</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                    <div className="text-sm text-gray-600">总任务</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tasks.filter(t => t.status === 'COMPLETED').length}
                    </div>
                    <div className="text-sm text-gray-600">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                    </div>
                    <div className="text-sm text-gray-600">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {tasks.filter(t => t.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-gray-600">待处理</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. 自定义样式示例 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">6. 自定义样式示例</h3>
          <div className="flex gap-4 items-center">
            <LoadingSpinner 
              size="lg" 
              color="white" 
              text="自定义样式" 
              className="bg-blue-600 px-4 py-2 rounded"
            />
            <Skeleton 
              width="200px" 
              height="40px" 
              className="bg-gradient-to-r from-blue-200 to-purple-200"
            />
          </div>
        </div>

      </Card>

      {/* 关闭按钮 */}
      <div className="text-center">
        <Button 
          onClick={() => {
            setShowOverlay(false);
            setShowSection(false);
          }}
        >
          关闭覆盖层
        </Button>
      </div>
    </div>
  );
};

export default LoadingExamples;