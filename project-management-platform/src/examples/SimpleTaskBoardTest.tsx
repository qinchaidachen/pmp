import React from 'react';
import { TaskBoard } from 'developer-task-board';
import 'developer-task-board/style.css';
import type { Task, Member, BoardConfig } from 'developer-task-board';

// 简化的测试组件
const SimpleTaskBoardTest: React.FC = () => {
  const tasks: Task[] = [
    {
      id: 't1',
      title: '测试任务1',
      memberId: 'm1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      status: 'inProgress',
    },
    {
      id: 't2',
      title: '测试任务2',
      memberId: 'm2',
      startDate: new Date('2024-01-03'),
      endDate: new Date('2024-01-08'),
      status: 'pending',
    },
  ];

  const members: Member[] = [
    { id: 'm1', name: '张三', role: '前端工程师' },
    { id: 'm2', name: '李四', role: '后端工程师' },
  ];

  const config: BoardConfig = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Developer Task Board 集成测试</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <TaskBoard
          config={config}
          tasks={tasks}
          members={members}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onCellClick={(memberId, date) => console.log('Cell clicked:', memberId, date)}
        />
      </div>
    </div>
  );
};

export default SimpleTaskBoardTest;