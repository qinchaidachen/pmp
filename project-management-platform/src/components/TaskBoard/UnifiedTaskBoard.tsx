import React, { useState } from 'react';
import { Card, Button, Tabs, Space, Tooltip, message } from 'antd';
import { 
  TableOutlined, 
  ScheduleOutlined, 
  ReloadOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../stores';
import { fetchTasks } from '../../stores/slices/tasksSlice';
import { fetchMembers } from '../../stores/slices/membersSlice';
import { fetchProjects } from '../../stores/slices/projectsSlice';
import { Task, Member } from '../../types';

// 导入两种看板组件
import TaskBoard from './TaskBoard';
import GanttTaskBoard from './GanttTaskBoard';

// 导入Loading组件
import { useLoading } from '../../hooks/useLoading';

interface UnifiedTaskBoardProps {
  onTaskClick?: (task: Task) => void;
  onTaskCreate?: (memberId: string, date: Date) => void;
  editable?: boolean;
  defaultView?: 'table' | 'gantt';
}

export const UnifiedTaskBoard: React.FC<UnifiedTaskBoardProps> = ({
  onTaskClick,
  onTaskCreate,
  editable = true,
  defaultView = 'table',
}) => {
  const dispatch = useAppDispatch();
  const { ui } = useAppSelector(state => state.ui);
  
  // 使用loading hook
  const { setModule, getModuleSelector } = useLoading();
  const tasksLoadingFromStore = useAppSelector(getModuleSelector('tasks'));
  
  const [activeView, setActiveView] = useState<'table' | 'gantt'>(defaultView);
  const [refreshKey, setRefreshKey] = useState(0);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setModule('unified-board', true);
      await Promise.all([
        dispatch(fetchTasks()).unwrap(),
        dispatch(fetchMembers()).unwrap(),
        dispatch(fetchProjects()).unwrap()
      ]);
      setRefreshKey(prev => prev + 1);
      message.success('数据刷新成功');
    } catch (error) {
      message.error('数据刷新失败');
    } finally {
      setModule('unified-board', false);
    }
  };

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // 处理任务创建
  const handleTaskCreate = (memberId: string, date: Date) => {
    if (onTaskCreate) {
      onTaskCreate(memberId, date);
    }
  };

  const tabItems = [
    {
      key: 'table',
      label: (
        <span className="flex items-center gap-2">
          <TableOutlined />
          表格式看板
        </span>
      ),
      children: (
        <div key={`table-${refreshKey}`}>
          <TaskBoard
            onTaskClick={handleTaskClick}
            onCellClick={(member: Member, date: Date) => handleTaskCreate(member.id, date)}
            editable={editable}
          />
        </div>
      ),
    },
    {
      key: 'gantt',
      label: (
        <span className="flex items-center gap-2">
          <ScheduleOutlined />
          甘特图看板
        </span>
      ),
      children: (
        <div key={`gantt-${refreshKey}`}>
          <GanttTaskBoard
            onTaskClick={handleTaskClick}
            onTaskCreate={handleTaskCreate}
            editable={editable}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="unified-task-board">
      {/* 看板头部 */}
      <div className="board-header mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">任务看板</h2>
            <div className="view-stats text-sm text-gray-500">
              支持表格式和甘特图两种视图模式
            </div>
          </div>
          
          <div className="board-actions">
            <Space>
              <Tooltip title="刷新数据">
                <Button 
                  type="text" 
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={tasksLoadingFromStore}
                />
              </Tooltip>
              
              <Tooltip title="设置">
                <Button 
                  type="text" 
                  icon={<SettingOutlined />}
                  onClick={() => {
                    message.info('设置功能开发中...');
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      </div>

      {/* 标签页容器 */}
      <Card 
        className="board-container"
        bodyStyle={{ padding: 0 }}
        styles={{
          header: { padding: '16px 24px' }
        }}
      >
        <Tabs
          activeKey={activeView}
          onChange={(key) => setActiveView(key as 'table' | 'gantt')}
          items={tabItems}
          size="large"
          className="board-tabs"
        />
      </Card>

      {/* 功能说明 */}
      <div className="feature-info mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card size="small" className="feature-card">
          <div className="flex items-start gap-3">
            <TableOutlined className="text-blue-500 text-lg mt-1" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">表格式看板</h4>
              <p className="text-sm text-gray-600 mb-0">
                传统的表格形式展示任务，适合详细的任务信息查看和编辑。
                支持按日期和成员进行任务管理。
              </p>
            </div>
          </div>
        </Card>
        
        <Card size="small" className="feature-card">
          <div className="flex items-start gap-3">
            <ScheduleOutlined className="text-green-500 text-lg mt-1" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">甘特图看板</h4>
              <p className="text-sm text-gray-600 mb-0">
                甘特图形式展示任务时间线，直观显示任务进度和依赖关系。
                适合项目规划和进度跟踪。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedTaskBoard;