import React, { useState } from 'react';
import { Card, Button, Space, DatePicker, Select, Switch, Row, Col, Typography, message } from 'antd';
import { UnifiedTaskBoard } from '../components/TaskBoard/UnifiedTaskBoard';
import { Task } from '../types';
import 'developer-task-board/style.css';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TaskBoardPage: React.FC = () => {
  const [defaultView, setDefaultView] = useState<'table' | 'gantt'>('table');

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    message.info(`点击了任务: ${task.title}`);
    // 这里可以添加更多交互逻辑，比如打开详情模态框
  };

  // 处理任务创建
  const handleTaskCreate = (memberId: string, date: Date) => {
    console.log('Create task for member:', memberId, 'at date:', date);
    message.info(`为成员 ${memberId} 在 ${date.toLocaleDateString()} 创建新任务`);
    // 这里可以添加创建任务的逻辑
  };

  return (
    <div className="task-board-page">
      <div className="page-header mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>任务看板</Title>
            <p>支持表格式和甘特图两种视图模式的任务管理</p>
          </div>
          <div className="view-selector">
            <Space>
              <span className="text-sm text-gray-500">默认视图:</span>
              <Select
                value={defaultView}
                onChange={setDefaultView}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="table">表格式</Option>
                <Option value="gantt">甘特图</Option>
              </Select>
            </Space>
          </div>
        </div>
      </div>

      {/* 统一任务看板 */}
      <UnifiedTaskBoard
        onTaskClick={handleTaskClick}
        onTaskCreate={handleTaskCreate}
        editable={true}
        defaultView={defaultView}
      />

      {/* 功能说明 */}
      <Card title="功能说明" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">表格式看板</h4>
            <ul className="text-sm space-y-1">
              <li>• 传统表格形式展示任务</li>
              <li>• 适合详细的信息查看和编辑</li>
              <li>• 支持按日期和成员分组</li>
              <li>• 直观的任务状态显示</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">甘特图看板</h4>
            <ul className="text-sm space-y-1">
              <li>• 甘特图形式展示时间线</li>
              <li>• 直观显示任务进度和依赖</li>
              <li>• 适合项目规划和跟踪</li>
              <li>• 支持拖拽调整时间</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">通用操作</h4>
            <ul className="text-sm space-y-1">
              <li>• 点击任务查看详情</li>
              <li>• 点击空白区域创建任务</li>
              <li>• 实时数据同步</li>
              <li>• 支持任务状态更新</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskBoardPage;