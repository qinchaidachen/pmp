import React, { useEffect } from 'react';
import { TaskBoard } from '../components/TaskBoard';
import { Task, Member, BoardConfig, TaskStatus, TaskPriority } from '../types';
import { useAppDispatch, useAppSelector } from '../stores';
import { fetchTasks } from '../stores/slices/tasksSlice';
import { fetchMembers } from '../stores/slices/membersSlice';
import { fetchProjects } from '../stores/slices/projectsSlice';
import { message } from 'antd';

/**
 * TaskBoard 使用示例
 * 展示如何在应用中使用TaskBoard组件
 */

export const TaskBoardExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  const { members } = useAppSelector(state => state.members);
  const { projects } = useAppSelector(state => state.projects);

  // 加载数据
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchMembers());
    dispatch(fetchProjects());
  }, [dispatch]);

  // 看板配置
  const config: BoardConfig = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    weekStartDay: 1, // Monday
    showWeekends: true,
    editable: true,
    showStoryPoints: true,
    showPersonDays: true,
    groupBy: 'member',
  };

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    message.info(`任务: ${task.title}\n状态: ${task.status}\n描述: ${task.description || '无'}`);
  };

  // 处理单元格点击
  const handleCellClick = (member: Member, date: Date) => {
    console.log('Cell clicked:', member, date);
    message.info(`成员: ${member.name}\n日期: ${date.toLocaleDateString()}\n点击创建新任务`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>任务看板 - 示例</h1>
      <p>这是一个任务看板示例，展示了团队成员在两周内的任务分配情况。</p>
      
      <TaskBoard
        config={config}
        onTaskClick={handleTaskClick}
        onCellClick={handleCellClick}
        editable={true}
      />

      {/* 数据统计 */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>数据统计</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <strong>成员数量:</strong> {members.length}
          </div>
          <div>
            <strong>任务数量:</strong> {tasks.length}
          </div>
          <div>
            <strong>项目数量:</strong> {projects.length}
          </div>
          <div>
            <strong>进行中任务:</strong> {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
          </div>
          <div>
            <strong>已完成任务:</strong> {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
          </div>
          <div>
            <strong>待处理任务:</strong> {tasks.filter(t => t.status === TaskStatus.PENDING).length}
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e6f7ff', borderRadius: '8px' }}>
        <h3>功能说明</h3>
        <ul>
          <li><strong>任务点击:</strong> 点击任务卡片可以查看任务详情或编辑任务</li>
          <li><strong>单元格点击:</strong> 点击空白单元格可以创建新任务</li>
          <li><strong>状态管理:</strong> 任务状态包括：待处理、进行中、评审中、已完成、阻塞</li>
          <li><strong>优先级:</strong> 支持低、中、高、紧急四个优先级</li>
          <li><strong>故事点:</strong> 可以为任务分配故事点来估算工作量</li>
          <li><strong>时间范围:</strong> 看板显示指定时间范围内的任务分配</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskBoardExample;