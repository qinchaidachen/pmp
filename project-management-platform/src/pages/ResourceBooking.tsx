import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch, 
  Tag, 
  Space, 
  message, 
  Popconfirm,
  Typography,
  Tabs,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../stores';
import { 
  fetchResources, 
  addResource, 
  updateResource, 
  deleteResource 
} from '../stores/slices/resourcesSlice';
import { 
  fetchResourceBookings, 
  addResourceBooking, 
  updateResourceBooking, 
  deleteResourceBooking 
} from '../stores/slices/resourceBookingsSlice';
import { fetchMembers } from '../stores/slices/membersSlice';
import { Resource, ResourceBooking as ResourceBookingType, ResourceType } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ResourceBooking: React.FC = () => {
  const dispatch = useAppDispatch();
  const { resources, resourceBookings, loading: resourcesLoading } = useAppSelector(state => state.teams);
  const { members, loading: membersLoading } = useAppSelector(state => state.members);
  
  const [activeTab, setActiveTab] = useState('resources');
  const [resourceModalVisible, setResourceModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingBooking, setEditingBooking] = useState<ResourceBookingType | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  
  const [resourceForm] = Form.useForm();
  const [bookingForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchResourceBookings());
    dispatch(fetchMembers());
  }, [dispatch]);

  // 资源管理
  const handleResourceSubmit = async (values: any) => {
    try {
      if (editingResource) {
        await dispatch(updateResource({ id: editingResource.id, updates: values }));
        message.success('资源更新成功');
      } else {
        await dispatch(addResource(values));
        message.success('资源添加成功');
      }
      setResourceModalVisible(false);
      setEditingResource(null);
      resourceForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleResourceEdit = (resource: Resource) => {
    setEditingResource(resource);
    resourceForm.setFieldsValue(resource);
    setResourceModalVisible(true);
  };

  const handleResourceDelete = async (id: string) => {
    try {
      await dispatch(deleteResource(id));
      message.success('资源删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 预定管理
  const handleBookingSubmit = async (values: any) => {
    try {
      const bookingData = {
        ...values,
        startDate: values.timeRange[0].toDate(),
        endDate: values.timeRange[1].toDate(),
      };
      delete bookingData.timeRange;

      if (editingBooking) {
        await dispatch(updateResourceBooking({ id: editingBooking.id, updates: bookingData }));
        message.success('预定更新成功');
      } else {
        await dispatch(addResourceBooking(bookingData));
        message.success('预定创建成功');
      }
      setBookingModalVisible(false);
      setEditingBooking(null);
      bookingForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBookingEdit = (booking: ResourceBookingType) => {
    setEditingBooking(booking);
    bookingForm.setFieldsValue({
      ...booking,
      timeRange: [dayjs(booking.startDate), dayjs(booking.endDate)],
    });
    setBookingModalVisible(true);
  };

  const handleBookingDelete = async (id: string) => {
    try {
      await dispatch(deleteResourceBooking(id));
      message.success('预定删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 资源表格列
  const resourceColumns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Resource) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ResourceType) => {
        const typeMap = {
          [ResourceType.MEETING_ROOM]: { text: '会议室', color: 'blue' },
          [ResourceType.TEST_DEVICE]: { text: '测试设备', color: 'green' },
          [ResourceType.OTHER]: { text: '其他', color: 'orange' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location ? <Tag icon={<EnvironmentOutlined />}>{location}</Tag> : '-',
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => capacity ? `${capacity}人` : '-',
    },
    {
      title: '状态',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'success' : 'error'} icon={isAvailable ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
          {isAvailable ? '可用' : '不可用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Resource) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleResourceEdit(record)}
          />
          <Popconfirm
            title="确定删除这个资源吗？"
            onConfirm={() => handleResourceDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 预定表格列
  const bookingColumns = [
    {
      title: '预定标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ResourceBookingType) => (
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: '资源',
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (resourceId: string) => {
        const resource = resources.find(r => r.id === resourceId);
        return resource ? <Tag color="blue">{resource.name}</Tag> : '-';
      },
    },
    {
      title: '预定人',
      dataIndex: 'memberId',
      key: 'memberId',
      render: (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return member ? (
          <div className="flex items-center space-x-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{member.name}</span>
          </div>
        ) : '-';
      },
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record: ResourceBookingType) => (
        <div>
          <div className="text-sm">
            {record.startDate.toLocaleDateString()} {record.startDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500">
            至 {record.endDate.toLocaleDateString()} {record.endDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ResourceBookingType['status']) => {
        const statusMap = {
          confirmed: { text: '已确认', color: 'success' },
          pending: { text: '待确认', color: 'warning' },
          cancelled: { text: '已取消', color: 'error' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: ResourceBookingType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleBookingEdit(record)}
          />
          <Popconfirm
            title="确定删除这个预定吗？"
            onConfirm={() => handleBookingDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取资源的当前预定
  const getResourceBookings = (resourceId: string) => {
    return resourceBookings.filter(booking => booking.resourceId === resourceId);
  };

  // 统计信息
  const stats = {
    totalResources: resources.length,
    availableResources: resources.filter(r => r.isAvailable).length,
    totalBookings: resourceBookings.length,
    confirmedBookings: resourceBookings.filter(b => b.status === 'confirmed').length,
  };

  return (
    <div className="resource-booking">
      <div className="page-header mb-6">
        <Title level={2}>资源预定</Title>
        <Text type="secondary">管理会议室、测试设备等资源的预定</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总资源数"
              value={stats.totalResources}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="可用资源"
              value={stats.availableResources}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总预定数"
              value={stats.totalBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已确认预定"
              value={stats.confirmedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><CalendarOutlined />资源管理</span>} 
            key="resources"
          >
            <div className="tab-content">
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>资源列表</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingResource(null);
                    resourceForm.resetFields();
                    setResourceModalVisible(true);
                  }}
                >
                  添加资源
                </Button>
              </div>

              <Table
                columns={resourceColumns}
                dataSource={resources}
                rowKey="id"
                loading={resourcesLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </div>
          </TabPane>

          <TabPane 
            tab={<span><ClockCircleOutlined />预定管理</span>} 
            key="bookings"
          >
            <div className="tab-content">
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>预定列表</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingBooking(null);
                    bookingForm.resetFields();
                    setBookingModalVisible(true);
                  }}
                >
                  创建预定
                </Button>
              </div>

              <Table
                columns={bookingColumns}
                dataSource={resourceBookings}
                rowKey="id"
                loading={resourcesLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </div>
          </TabPane>

          <TabPane 
            tab={<span><EnvironmentOutlined />日历视图</span>} 
            key="calendar"
          >
            <div className="tab-content">
              <Alert
                message="日历视图"
                description="日历视图功能开发中，将提供可视化的资源预定时间线。"
                type="info"
                showIcon
                className="mb-4"
              />
              <div className="text-center py-8 text-gray-500">
                <CalendarOutlined className="text-4xl mb-4" />
                <div>日历视图开发中...</div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 资源编辑模态框 */}
      <Modal
        title={editingResource ? '编辑资源' : '添加资源'}
        open={resourceModalVisible}
        onCancel={() => {
          setResourceModalVisible(false);
          setEditingResource(null);
          resourceForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          onFinish={handleResourceSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="资源名称"
                rules={[{ required: true, message: '请输入资源名称' }]}
              >
                <Input placeholder="请输入资源名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="资源类型"
                rules={[{ required: true, message: '请选择资源类型' }]}
              >
                <Select placeholder="请选择资源类型">
                  <Option value={ResourceType.MEETING_ROOM}>会议室</Option>
                  <Option value={ResourceType.TEST_DEVICE}>测试设备</Option>
                  <Option value={ResourceType.OTHER}>其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="资源描述"
          >
            <Input.TextArea placeholder="请输入资源描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="位置"
              >
                <Input placeholder="请输入位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="容量"
              >
                <Input type="number" placeholder="请输入容量" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isAvailable"
            label="可用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="可用" unCheckedChildren="不可用" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setResourceModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingResource ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预定编辑模态框 */}
      <Modal
        title={editingBooking ? '编辑预定' : '创建预定'}
        open={bookingModalVisible}
        onCancel={() => {
          setBookingModalVisible(false);
          setEditingBooking(null);
          bookingForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={bookingForm}
          layout="vertical"
          onFinish={handleBookingSubmit}
        >
          <Form.Item
            name="title"
            label="预定标题"
            rules={[{ required: true, message: '请输入预定标题' }]}
          >
            <Input placeholder="请输入预定标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="预定描述"
          >
            <Input.TextArea placeholder="请输入预定描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="resourceId"
                label="选择资源"
                rules={[{ required: true, message: '请选择资源' }]}
              >
                <Select placeholder="请选择资源" showSearch>
                  {resources.filter(r => r.isAvailable).map(resource => (
                    <Option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="memberId"
                label="预定人"
                rules={[{ required: true, message: '请选择预定人' }]}
              >
                <Select placeholder="请选择预定人" showSearch>
                  {members.filter(m => m.isActive).map(member => (
                    <Option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="timeRange"
            label="预定时间"
            rules={[{ required: true, message: '请选择预定时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="预定状态"
            initialValue="pending"
          >
            <Select>
              <Option value="pending">待确认</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setBookingModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBooking ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResourceBooking;