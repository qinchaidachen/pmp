import React, { useState } from 'react';
import { Card, Button, Space, Typography, message } from 'antd';
import { TaskBoard } from 'developer-task-board';
import 'developer-task-board/style.css';
import type { Task, Member, BoardConfig } from 'developer-task-board';

const { Title } = Typography;

const DeveloperTaskBoardDemo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      title: '用户界面设计',
      memberId: 'm1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      status: 'inProgress',
      description: '设计用户登录界面和主要功能页面',
    },
    {
      id: 't2',
      title: '后端API开发',
      memberId: 'm2',
      startDate: new Date('2024-01-02'),
      endDate: new Date('2024-01-08'),
      status: 'pending',
      description: '开发用户认证和任务管理API',
    },
    {
      id: 't3',
      title: '数据库设计',
      memberId: 'm3',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-03'),
      status: 'completed',
      description: '设计项目数据库结构和关系',
    },
    {
      id: 't4',
      title: '前端组件开发',
      memberId: 'm1',
      startDate: new Date('2024-01-06'),
      endDate: new Date('2024-01-12'),
      status: 'pending',
      description: '开发可复用的React组件库',
    },
    {
      id: 't5',
      title: 'API测试',
      memberId: 'm2',
      startDate: new Date('2024-01-09'),
      endDate: new Date('2024-01-11'),
      status: 'blocked',
      description: '对后端API进行全面测试',
    },
  ]);

  const [members] = useState<Member[]>([
    { id: 'm1', name: '张三', role: '前端工程师' },
    { id: 'm2', name: '李四', role: '后端工程师' },
    { id: 'm3', name: '王五', role: '数据库工程师' },
  ]);

  const [config] = useState<BoardConfig>({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
  });

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    message.info(`点击了任务: ${task.title}`);
    console.log('Task clicked:', task);
  };

  // 处理单元格点击
  const handleCellClick = (memberId: string, date: Date) => {
    message.info(`为 ${members.find(m => m.id === memberId)?.name} 在 ${date.toLocaleDateString()} 创建任务`);
    console.log('Cell clicked:', memberId, date);
  };

  // 添加示例任务
  const addSampleTask = () => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: `新任务 ${Date.now()}`,
      memberId: 'm1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      description: '这是一个示例任务',
    };
    setTasks(prev => [...prev, newTask]);
    message.success('添加了示例任务');
  };

  return (
    <div className="developer-task-board-demo">
      <div className="demo-header mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3}>Developer Task Board 演示</Title>
            <p>这是一个独立的甘特图任务看板组件演示</p>
          </div>
          <Space>
            <Button type="primary" onClick={addSampleTask}>
              添加示例任务
            </Button>
          </Space>
        </div>
      </div>

      {/* 甘特图组件 */}
      <Card title="甘特图任务看板" className="mb-6">
        <TaskBoard
          config={config}
          tasks={tasks}
          members={members}
          onTaskClick={handleTaskClick}
          onCellClick={handleCellClick}
        />
      </Card>

      {/* 数据展示 */}
      <Card title="当前数据" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 任务列表 */}
          <div>
            <h4 className="font-semibold mb-3">任务列表 ({tasks.length})</h4>
            <div className="space-y-2">
              {tasks.map(task => {
                const member = members.find(m => m.id === task.memberId);
                return (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{task.title}</h5>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>负责人: {member?.name}</span>
                      <span>{task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 成员列表 */}
          <div>
            <h4 className="font-semibold mb-3">团队成员 ({members.length})</h4>
            <div className="space-y-2">
              {members.map(member => {
                const memberTasks = tasks.filter(t => t.memberId === member.id);
                const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
                return (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{member.name}</h5>
                      <span className="text-sm text-gray-500">{member.role}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>总任务: {memberTasks.length}</p>
                      <p>已完成: {completedTasks}</p>
                      <p>进行中: {memberTasks.filter(t => t.status === 'inProgress').length}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 功能说明 */}
      <Card title="功能特性">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">交互功能</h4>
            <ul className="text-sm space-y-1">
              <li>• 点击任务查看详情</li>
              <li>• 点击空白区域创建任务</li>
              <li>• 拖拽调整任务时间</li>
              <li>• 实时状态更新</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">视图特性</h4>
            <ul className="text-sm space-y-1">
              <li>• 甘特图时间线显示</li>
              <li>• 成员任务分配视图</li>
              <li>• 任务依赖关系</li>
              <li>• 进度可视化</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">数据管理</h4>
            <ul className="text-sm space-y-1">
              <li>• TypeScript类型支持</li>
              <li>• 响应式设计</li>
              <li>• 自定义主题</li>
              <li>• 事件回调支持</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeveloperTaskBoardDemo;