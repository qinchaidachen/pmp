import React from 'react';
import { TaskBoard } from '../src/components/TaskBoard';
import { Task, Member, BoardConfig } from '../src/types';

/**
 * Basic usage example of TaskBoard component
 * This example demonstrates the minimal setup required to use the TaskBoard
 */

// Sample team members
const members: Member[] = [
  {
    id: 'm1',
    name: '张三',
    role: '前端工程师',
  },
  {
    id: 'm2',
    name: '李四',
    role: '后端工程师',
  },
  {
    id: 'm3',
    name: '王五',
    role: 'UI设计师',
  },
  {
    id: 'm4',
    name: '赵六',
    role: '测试工程师',
  },
];

// Sample tasks
const tasks: Task[] = [
  {
    id: 't1',
    title: '登录页面开发',
    memberId: 'm1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-03'),
    status: 'completed',
    description: '实现用户登录界面和表单验证',
  },
  {
    id: 't2',
    title: 'API接口开发',
    memberId: 'm2',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-05'),
    status: 'inProgress',
    description: '开发用户认证相关的后端API',
  },
  {
    id: 't3',
    title: '登录页面设计',
    memberId: 'm3',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02'),
    status: 'completed',
    description: '设计登录页面的UI原型',
  },
  {
    id: 't4',
    title: '首页组件开发',
    memberId: 'm1',
    startDate: new Date('2024-01-04'),
    endDate: new Date('2024-01-08'),
    status: 'inProgress',
    description: '开发应用首页的React组件',
  },
  {
    id: 't5',
    title: '数据库设计',
    memberId: 'm2',
    startDate: new Date('2024-01-06'),
    endDate: new Date('2024-01-10'),
    status: 'pending',
    description: '设计用户和权限相关的数据库表结构',
  },
  {
    id: 't6',
    title: '登录测试',
    memberId: 'm4',
    startDate: new Date('2024-01-04'),
    endDate: new Date('2024-01-05'),
    status: 'review',
    description: '测试登录功能的各种场景',
  },
  {
    id: 't7',
    title: '图标设计',
    memberId: 'm3',
    startDate: new Date('2024-01-03'),
    endDate: new Date('2024-01-06'),
    status: 'inProgress',
    description: '设计应用所需的图标资源',
  },
  {
    id: 't8',
    title: '集成测试',
    memberId: 'm4',
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-01-12'),
    status: 'pending',
    description: '进行系统集成测试',
  },
];

// Board configuration
const config: BoardConfig = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  weekStartDay: 1, // Monday
  showWeekends: true,
  editable: false,
};

/**
 * Basic example component
 */
export const BasicExample: React.FC = () => {
  // Handle task click
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    alert(`任务: ${task.title}\n状态: ${task.status}\n描述: ${task.description}`);
  };

  // Handle empty cell click
  const handleCellClick = (member: Member, date: Date) => {
    console.log('Cell clicked:', member, date);
    alert(`成员: ${member.name}\n日期: ${date.toLocaleDateString()}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>任务看板 - 基础示例</h1>
      <p>这是一个基础的任务看板示例，展示了团队成员在两周内的任务分配情况。</p>
      
      <TaskBoard
        config={config}
        tasks={tasks}
        members={members}
        onTaskClick={handleTaskClick}
        onCellClick={handleCellClick}
      />
    </div>
  );
};

export default BasicExample;
