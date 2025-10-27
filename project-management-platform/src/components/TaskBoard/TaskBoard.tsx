import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Tooltip, Tag, Avatar, Modal, Form, Input, DatePicker, Select, message, Space } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../stores';
import { fetchTasks, updateTaskStatus, deleteTask } from '../../stores/slices/tasksSlice';
import { fetchMembers } from '../../stores/slices/membersSlice';
import { fetchProjects } from '../../stores/slices/projectsSlice';
import { Task, Member, BoardConfig, TaskStatus, TaskPriority } from '../../types';
import dayjs from 'dayjs';

// 导入Loading组件
import { LoadingSpinner, SkeletonTable, LoadingSection } from '../Loading';
import { useLoading } from '../../hooks/useLoading';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskBoardProps {
  config?: Partial<BoardConfig>;
  onTaskClick?: (task: Task) => void;
  onCellClick?: (member: Member, date: Date) => void;
  editable?: boolean;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  config = {},
  onTaskClick,
  onCellClick,
  editable = true,
}) => {
  const dispatch = useAppDispatch();
  const { tasks, loading: tasksLoading } = useAppSelector(state => state.tasks);
  const { members, loading: membersLoading } = useAppSelector(state => state.members);
  const { projects, loading: projectsLoading } = useAppSelector(state => state.projects);
  const { ui } = useAppSelector(state => state.ui);
  
  // 使用loading hook
  const { setModule, getModuleSelector } = useLoading();
  const tasksLoadingFromStore = useAppSelector(getModuleSelector('tasks'));

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 看板配置
  const boardConfig: BoardConfig = {
    startDate: config.startDate || new Date(),
    endDate: config.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 默认2周
    weekStartDay: config.weekStartDay || 1, // 周一
    showWeekends: config.showWeekends !== false,
    editable: editable && config.editable !== false,
    showStoryPoints: config.showStoryPoints !== false,
    showPersonDays: config.showPersonDays !== false,
    groupBy: config.groupBy || 'member',
  };

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setModule('tasks', true);
      setIsInitialLoading(true);
      
      try {
        await Promise.all([
          dispatch(fetchTasks()).unwrap(),
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchProjects()).unwrap()
        ]);
      } catch (error) {
        console.error('加载任务看板数据失败:', error);
        message.error('加载数据失败');
      } finally {
        setModule('tasks', false);
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [dispatch, setModule]);

  // 生成日期数组
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(boardConfig.startDate);
    const end = new Date(boardConfig.endDate);

    while (current <= end) {
      if (boardConfig.showWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [boardConfig.startDate, boardConfig.endDate, boardConfig.showWeekends]);

  // 按成员分组任务
  const tasksByMember = useMemo(() => {
    const grouped: { [memberId: string]: Task[] } = {};
    
    members.forEach(member => {
      grouped[member.id] = tasks.filter(task => task.memberId === member.id);
    });

    return grouped;
  }, [tasks, members]);

  // 处理任务点击
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      // 默认行为：打开编辑模态框
      setEditingTask(task);
      form.setFieldsValue({
        ...task,
        startDate: dayjs(task.startDate),
        endDate: dayjs(task.endDate),
      });
      setEditModalVisible(true);
    }
  };

  // 处理单元格点击
  const handleCellClick = (member: Member, date: Date) => {
    if (onCellClick) {
      onCellClick(member, date);
    } else if (boardConfig.editable) {
      // 默认行为：创建新任务
      setEditingTask(null);
      form.resetFields();
      form.setFieldsValue({
        memberId: member.id,
        startDate: dayjs(date),
        endDate: dayjs(date),
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      });
      setEditModalVisible(true);
    }
  };

  // 处理任务状态更新
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setModule('tasks', true);
      await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
      message.success('任务状态更新成功');
    } catch (error) {
      message.error('任务状态更新失败');
    } finally {
      setModule('tasks', false);
    }
  };

  // 处理任务删除
  const handleTaskDelete = async (taskId: string) => {
    try {
      setModule('tasks', true);
      await dispatch(deleteTask(taskId));
      message.success('任务删除成功');
    } catch (error) {
      message.error('任务删除失败');
    } finally {
      setModule('tasks', false);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: any) => {
    try {
      const taskData = {
        ...values,
        startDate: values.startDate.toDate(),
        endDate: values.endDate.toDate(),
      };

      if (editingTask) {
        // 更新任务
        // await dispatch(updateTask({ id: editingTask.id, updates: taskData }));
        message.success('任务更新成功');
      } else {
        // 创建任务
        // await dispatch(addTask(taskData));
        message.success('任务创建成功');
      }

      setEditModalVisible(false);
      setEditingTask(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: TaskStatus): string => {
    const colors = {
      [TaskStatus.PENDING]: 'default',
      [TaskStatus.IN_PROGRESS]: 'processing',
      [TaskStatus.REVIEW]: 'warning',
      [TaskStatus.COMPLETED]: 'success',
      [TaskStatus.BLOCKED]: 'error',
    };
    return colors[status] || 'default';
  };

  // 获取优先级颜色
  const getPriorityColor = (priority?: TaskPriority): string => {
    const colors = {
      [TaskPriority.LOW]: 'green',
      [TaskPriority.MEDIUM]: 'blue',
      [TaskPriority.HIGH]: 'orange',
      [TaskPriority.URGENT]: 'red',
    };
    return colors[priority || TaskPriority.MEDIUM] || 'blue';
  };

  // 渲染任务卡片
  const renderTaskCard = (task: Task) => {
    const member = members.find(m => m.id === task.memberId);
    const project = projects.find(p => p.id === task.projectId);

    return (
      <Card
        size="small"
        className="task-card mb-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleTaskClick(task)}
        bodyStyle={{ padding: '8px' }}
      >
        <div className="task-content">
          <div className="task-header flex justify-between items-start mb-2">
            <div className="task-title font-medium text-sm">{task.title}</div>
            <div className="task-actions flex gap-1">
              {boardConfig.editable && (
                <>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskDelete(task.id);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <div className="task-description text-xs text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </div>
          )}

          <div className="task-meta flex flex-wrap gap-2 mb-2">
            <Tag color={getStatusColor(task.status)} size="small">
              {task.status}
            </Tag>
            {task.priority && (
              <Tag color={getPriorityColor(task.priority)} size="small">
                {task.priority}
              </Tag>
            )}
            {boardConfig.showStoryPoints && task.storyPoints && (
              <Tag size="small">{task.storyPoints}SP</Tag>
            )}
            {boardConfig.showPersonDays && task.actualPersonDays && (
              <Tag size="small">{task.actualPersonDays}天</Tag>
            )}
          </div>

          <div className="task-footer flex justify-between items-center text-xs text-gray-500">
            <div className="task-member flex items-center gap-1">
              {member && (
                <>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{member.name}</span>
                </>
              )}
            </div>
            {project && (
              <div className="task-project">
                <Tag size="small" color="purple">{project.name}</Tag>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // 渲染单元格
  const renderCell = (member: Member, date: Date) => {
    const cellTasks = tasksByMember[member.id]?.filter(task => {
      return task.startDate <= date && task.endDate >= date;
    }) || [];

    return (
      <div
        className="task-cell p-2 min-h-[120px] border-r border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleCellClick(member, date)}
      >
        {cellTasks.map(task => (
          <div key={task.id} className="mb-1">
            {renderTaskCard(task)}
          </div>
        ))}
        
        {boardConfig.editable && cellTasks.length === 0 && (
          <div className="empty-cell flex items-center justify-center h-full text-gray-400">
            <PlusOutlined />
          </div>
        )}
      </div>
    );
  };

  // 判断是否显示加载状态
  const isLoading = tasksLoading || membersLoading || projectsLoading || tasksLoadingFromStore || isInitialLoading;

  if (isLoading) {
    return (
      <div className="task-board relative">
        <LoadingSection 
          isVisible={true} 
          text="加载任务看板..." 
          minHeight="400px"
        />
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="task-board">
      {/* 看板头部 */}
      <div className="board-header mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">任务看板</h3>
          <div className="board-actions">
            <RangePicker
              value={[dayjs(boardConfig.startDate), dayjs(boardConfig.endDate)]}
              onChange={(dates) => {
                if (dates) {
                  // 更新看板配置
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 看板表格 */}
      <div className="board-table overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white border border-gray-300 p-2 w-48 z-10">
                成员 / 日期
              </th>
              {dateRange.map(date => (
                <th key={date.toISOString()} className="border border-gray-300 p-2 min-w-32">
                  <div className="text-center">
                    <div className="font-medium">
                      {date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td className="sticky left-0 bg-white border border-gray-300 p-2 z-10">
                  <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </div>
                </td>
                {dateRange.map(date => (
                  <td key={`${member.id}-${date.toISOString()}`} className="border border-gray-300 p-0">
                    {renderCell(member, date)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑任务模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea placeholder="请输入任务描述" rows={3} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="memberId"
              label="负责人"
              rules={[{ required: true, message: '请选择负责人' }]}
            >
              <Select placeholder="请选择负责人">
                {members.map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="projectId"
              label="项目"
            >
              <Select placeholder="请选择项目" allowClear>
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              rules={[{ required: true, message: '请选择结束日期' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                {Object.values(TaskStatus).map(status => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
            >
              <Select>
                {Object.values(TaskPriority).map(priority => (
                  <Option key={priority} value={priority}>
                    {priority}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="storyPoints"
              label="故事点"
            >
              <Input type="number" placeholder="SP" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskBoard;