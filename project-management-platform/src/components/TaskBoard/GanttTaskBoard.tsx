import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Tooltip, message, Space, Switch, Select } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { TaskBoard } from 'developer-task-board';
import 'developer-task-board/style.css';
import { useAppSelector, useAppDispatch } from '../../stores';
import { fetchTasks, updateTaskStatus, deleteTask } from '../../stores/slices/tasksSlice';
import { fetchMembers } from '../../stores/slices/membersSlice';
import { fetchProjects } from '../../stores/slices/projectsSlice';
import { Task, Member, Project, TaskStatus } from '../../types';
import dayjs from 'dayjs';

// 导入Loading组件
import { LoadingSpinner, SkeletonTable, LoadingSection } from '../Loading';
import { useLoading } from '../../hooks/useLoading';

interface GanttTaskBoardProps {
  config?: {
    startDate?: Date;
    endDate?: Date;
    showWeekends?: boolean;
    editable?: boolean;
  };
  onTaskClick?: (task: Task) => void;
  onTaskCreate?: (memberId: string, date: Date) => void;
  editable?: boolean;
}

export const GanttTaskBoard: React.FC<GanttTaskBoardProps> = ({
  config = {},
  onTaskClick,
  onTaskCreate,
  editable = true,
}) => {
  const dispatch = useAppDispatch();
  const { tasks, loading: tasksLoading } = useAppSelector(state => state.tasks);
  const { members, loading: membersLoading } = useAppSelector(state => state.members);
  const { projects, loading: projectsLoading } = useAppSelector(state => state.projects);
  
  // 使用loading hook
  const { setModule, getModuleSelector } = useLoading();
  const tasksLoadingFromStore = useAppSelector(getModuleSelector('tasks'));

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showWeekends, setShowWeekends] = useState(config.showWeekends ?? true);
  const [error, setError] = useState<string | null>(null);

  // 看板配置
  const boardConfig = useMemo(() => {
    const now = new Date();
    
    // 确保日期有效
    let startDate = config.startDate;
    let endDate = config.endDate;
    
    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }
    
    if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);
    }
    
    // 确保开始日期不晚于结束日期
    if (startDate > endDate) {
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return {
      startDate,
      endDate,
      showWeekends,
      editable: editable && config.editable !== false,
    };
  }, [config.startDate, config.endDate, showWeekends, editable, config.editable]);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setModule('gantt-tasks', true);
      setIsInitialLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          dispatch(fetchTasks()).unwrap(),
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchProjects()).unwrap()
        ]);
      } catch (error) {
        console.error('加载甘特图数据失败:', error);
        setError('加载数据失败，请刷新页面重试');
        message.error('加载数据失败');
      } finally {
        setModule('gantt-tasks', false);
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [dispatch, setModule]);

  // 转换数据格式以适配developer-task-board
  const ganttTasks = useMemo(() => {
    return tasks.map(task => {
      const member = members.find(m => m.id === task.memberId);
      const project = projects.find(p => p.id === task.projectId);
      
      // 确保status字段有有效值
      const status = task.status || 'pending';
      
      return {
        id: task.id,
        title: task.title || '未命名任务',
        memberId: task.memberId,
        startDate: new Date(task.startDate || new Date()),
        endDate: new Date(task.endDate || new Date()),
        status: status.toLowerCase() as 'pending' | 'inProgress' | 'review' | 'completed' | 'blocked',
        description: task.description || '',
        priority: task.priority?.toLowerCase() || 'medium',
        storyPoints: task.storyPoints || 0,
        actualPersonDays: task.actualPersonDays || 0,
        // 扩展字段
        memberName: member?.name || '未知成员',
        memberRole: member?.role || '未知角色',
        projectName: project?.name || '未知项目',
      };
    });
  }, [tasks, members, projects]);

  const ganttMembers = useMemo(() => {
    return members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
    }));
  }, [members]);

  // 处理任务点击
  const handleTaskClick = (task: any) => {
    if (onTaskClick && task && task.id) {
      // 转换回原始格式
      const originalTask = tasks.find(t => t.id === task.id);
      if (originalTask) {
        onTaskClick(originalTask);
      }
    }
  };

  // 处理单元格点击（创建新任务）
  const handleCellClick = (memberId: string, date: Date) => {
    if (onTaskCreate && memberId && date && date instanceof Date && !isNaN(date.getTime())) {
      onTaskCreate(memberId, date);
    }
  };

  // 处理任务状态更新
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setModule('gantt-tasks', true);
      const statusMap: { [key: string]: TaskStatus } = {
        'pending': TaskStatus.PENDING,
        'inprogress': TaskStatus.IN_PROGRESS,
        'review': TaskStatus.REVIEW,
        'completed': TaskStatus.COMPLETED,
        'blocked': TaskStatus.BLOCKED,
      };
      
      await dispatch(updateTaskStatus({ 
        id: taskId, 
        status: statusMap[newStatus] || TaskStatus.PENDING 
      }));
      message.success('任务状态更新成功');
    } catch (error) {
      message.error('任务状态更新失败');
    } finally {
      setModule('gantt-tasks', false);
    }
  };

  // 处理任务删除
  const handleTaskDelete = async (taskId: string) => {
    try {
      setModule('gantt-tasks', true);
      await dispatch(deleteTask(taskId));
      message.success('任务删除成功');
    } catch (error) {
      message.error('任务删除失败');
    } finally {
      setModule('gantt-tasks', false);
    }
  };

  // 判断是否显示加载状态
  const isLoading = tasksLoading || membersLoading || projectsLoading || tasksLoadingFromStore || isInitialLoading;

  // 显示错误状态
  if (error) {
    return (
      <div className="gantt-task-board">
        <Card>
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold mb-2">加载失败</div>
            <div className="text-sm mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="gantt-task-board relative">
        <LoadingSection 
          isVisible={true} 
          text="加载甘特图..." 
          minHeight="400px"
        />
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="gantt-task-board">
      {/* 看板头部 */}
      <div className="board-header mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">甘特图任务看板</h3>
            <div className="view-controls flex items-center gap-2">
              <span className="text-sm text-gray-500">视图:</span>
              <Select
                value={viewMode}
                onChange={setViewMode}
                size="small"
                style={{ width: 80 }}
              >
                <Select.Option value="week">周视图</Select.Option>
                <Select.Option value="month">月视图</Select.Option>
              </Select>
            </div>
          </div>
          
          <div className="board-actions flex items-center gap-4">
            <div className="weekend-toggle flex items-center gap-2">
              <span className="text-sm text-gray-500">显示周末:</span>
              <Switch 
                size="small"
                checked={showWeekends}
                onChange={setShowWeekends}
              />
            </div>
            
            <Tooltip title="看板设置">
              <Button 
                type="text" 
                icon={<SettingOutlined />}
                onClick={() => {
                  // 可以打开设置模态框
                  message.info('功能开发中...');
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 甘特图组件 */}
      <div className="gantt-container bg-white rounded-lg shadow-sm border">
        {ganttTasks.length > 0 ? (
          <TaskBoard
            config={boardConfig}
            tasks={ganttTasks}
            members={ganttMembers}
            onTaskClick={handleTaskClick}
            onCellClick={handleCellClick}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg">暂无任务数据</div>
            <div className="text-sm mt-2">请先导入测试数据或创建任务</div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="statistics mt-4 grid grid-cols-4 gap-4">
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {ganttTasks.filter(t => t.status === 'inprogress').length}
            </div>
            <div className="text-sm text-gray-500">进行中</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {ganttTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">已完成</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {ganttTasks.filter(t => t.status === 'review').length}
            </div>
            <div className="text-sm text-gray-500">待审核</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {ganttTasks.filter(t => t.status === 'blocked').length}
            </div>
            <div className="text-sm text-gray-500">已阻塞</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GanttTaskBoard;