import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Avatar, 
  Tag, 
  Space, 
  message, 
  Popconfirm,
  Typography,
  Tabs,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  TeamOutlined,
  SafetyCertificateOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../stores';
import { 
  fetchMembers, 
  addMember, 
  updateMember, 
  deleteMember 
} from '../stores/slices/membersSlice';
import { 
  fetchTeams, 
  addTeam, 
  updateTeam, 
  deleteTeam 
} from '../stores/slices/teamsSlice';
import { Member, Team, Role, BusinessLine } from '../types';

// 导入Loading组件
import { LoadingSpinner, SkeletonTable, LoadingSection } from '../components/Loading';
import { useLoading } from '../hooks/useLoading';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const TeamManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members, loading: membersLoading } = useAppSelector(state => state.members);
  const { teams, loading: teamsLoading } = useAppSelector(state => state.teams);
  
  // 使用loading hook
  const { setModule, getModuleSelector } = useLoading();
  const teamsLoadingFromStore = useAppSelector(getModuleSelector('teams'));
  const membersLoadingFromStore = useAppSelector(getModuleSelector('members'));
  
  const [activeTab, setActiveTab] = useState('members');
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [memberForm] = Form.useForm();
  const [teamForm] = Form.useForm();

  useEffect(() => {
    const loadData = async () => {
      setModule('teams', true);
      setModule('members', true);
      setIsInitialLoading(true);
      
      try {
        await Promise.all([
          dispatch(fetchMembers()).unwrap(),
          dispatch(fetchTeams()).unwrap()
        ]);
      } catch (error) {
        console.error('加载团队管理数据失败:', error);
        message.error('加载数据失败');
      } finally {
        setModule('teams', false);
        setModule('members', false);
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [dispatch, setModule]);

  // 成员管理
  const handleMemberSubmit = async (values: any) => {
    try {
      setModule('members', true);
      if (editingMember) {
        await dispatch(updateMember({ id: editingMember.id, updates: values }));
        message.success('成员更新成功');
      } else {
        await dispatch(addMember(values));
        message.success('成员添加成功');
      }
      setMemberModalVisible(false);
      setEditingMember(null);
      memberForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setModule('members', false);
    }
  };

  const handleMemberEdit = (member: Member) => {
    setEditingMember(member);
    memberForm.setFieldsValue(member);
    setMemberModalVisible(true);
  };

  const handleMemberDelete = async (id: string) => {
    try {
      setModule('members', true);
      await dispatch(deleteMember(id));
      message.success('成员删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setModule('members', false);
    }
  };

  // 团队管理
  const handleTeamSubmit = async (values: any) => {
    try {
      setModule('teams', true);
      if (editingTeam) {
        await dispatch(updateTeam({ id: editingTeam.id, updates: values }));
        message.success('团队更新成功');
      } else {
        await dispatch(addTeam(values));
        message.success('团队添加成功');
      }
      setTeamModalVisible(false);
      setEditingTeam(null);
      teamForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setModule('teams', false);
    }
  };

  const handleTeamEdit = (team: Team) => {
    setEditingTeam(team);
    teamForm.setFieldsValue(team);
    setTeamModalVisible(true);
  };

  const handleTeamDelete = async (id: string) => {
    try {
      setModule('teams', true);
      await dispatch(deleteTeam(id));
      message.success('团队删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setModule('teams', false);
    }
  };

  // 成员表格列
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Member) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '团队',
      dataIndex: 'teamId',
      key: 'teamId',
      render: (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? <Tag color="green">{team.name}</Tag> : <Text type="secondary">未分配</Text>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Member) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleMemberEdit(record)}
          />
          <Popconfirm
            title="确定删除这个成员吗？"
            onConfirm={() => handleMemberDelete(record.id)}
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

  // 团队表格列
  const teamColumns = [
    {
      title: '团队名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Team) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: '成员数量',
      key: 'memberCount',
      render: (_, record: Team) => record.memberIds.length,
    },
    {
      title: '项目数量',
      key: 'projectCount',
      render: (_, record: Team) => record.projectIds.length,
    },
    {
      title: '业务线',
      dataIndex: 'businessLineId',
      key: 'businessLineId',
      render: (businessLineId: string) => {
        // 这里可以显示业务线信息
        return businessLineId ? <Tag color="purple">业务线</Tag> : <Text type="secondary">未分配</Text>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Team) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleTeamEdit(record)}
          />
          <Popconfirm
            title="确定删除这个团队吗？"
            onConfirm={() => handleTeamDelete(record.id)}
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

  // 判断是否显示加载状态
  const isLoading = membersLoading || teamsLoading || membersLoadingFromStore || teamsLoadingFromStore || isInitialLoading;

  if (isLoading) {
    return (
      <div className="team-management relative">
        <LoadingSection 
          isVisible={true} 
          text="加载团队管理..." 
          minHeight="400px"
        />
        <div className="space-y-6">
          {/* 统计卡片骨架屏 */}
          <Row gutter={16}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* 表格骨架屏 */}
          <Card>
            <SkeletonTable rows={8} cols={5} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="team-management">
      <div className="page-header mb-6">
        <Title level={2}>团队管理</Title>
        <Text type="secondary">管理团队成员、角色和组织结构</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总成员数"
              value={members.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="活跃成员"
              value={members.filter(m => m.isActive).length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="团队数量"
              value={teams.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><UserOutlined />成员管理</span>} 
            key="members"
          >
            <div className="tab-content">
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>成员列表</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingMember(null);
                    memberForm.resetFields();
                    setMemberModalVisible(true);
                  }}
                >
                  添加成员
                </Button>
              </div>

              <Table
                columns={memberColumns}
                dataSource={members}
                rowKey="id"
                loading={membersLoading}
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
            tab={<span><TeamOutlined />团队管理</span>} 
            key="teams"
          >
            <div className="tab-content">
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>团队列表</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTeam(null);
                    teamForm.resetFields();
                    setTeamModalVisible(true);
                  }}
                >
                  添加团队
                </Button>
              </div>

              <Table
                columns={teamColumns}
                dataSource={teams}
                rowKey="id"
                loading={teamsLoading}
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
            tab={<span><SafetyCertificateOutlined />角色管理</span>} 
            key="roles"
          >
            <div className="tab-content">
              <Title level={4}>角色管理</Title>
              <Text type="secondary">角色管理功能开发中...</Text>
            </div>
          </TabPane>

          <TabPane 
            tab={<span><BankOutlined />业务线管理</span>} 
            key="business-lines"
          >
            <div className="tab-content">
              <Title level={4}>业务线管理</Title>
              <Text type="secondary">业务线管理功能开发中...</Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 成员编辑模态框 */}
      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={memberModalVisible}
        onCancel={() => {
          setMemberModalVisible(false);
          setEditingMember(null);
          memberForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={memberForm}
          layout="vertical"
          onFinish={handleMemberSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="前端工程师">前端工程师</Option>
                  <Option value="后端工程师">后端工程师</Option>
                  <Option value="UI设计师">UI设计师</Option>
                  <Option value="测试工程师">测试工程师</Option>
                  <Option value="产品经理">产品经理</Option>
                  <Option value="项目经理">项目经理</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teamId"
                label="所属团队"
              >
                <Select placeholder="请选择团队" allowClear>
                  {teams.map(team => (
                    <Option key={team.id} value={team.id}>
                      {team.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="状态"
                valuePropName="checked"
              >
                <Switch checkedChildren="活跃" unCheckedChildren="非活跃" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setMemberModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMember ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 团队编辑模态框 */}
      <Modal
        title={editingTeam ? '编辑团队' : '添加团队'}
        open={teamModalVisible}
        onCancel={() => {
          setTeamModalVisible(false);
          setEditingTeam(null);
          teamForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={teamForm}
          layout="vertical"
          onFinish={handleTeamSubmit}
        >
          <Form.Item
            name="name"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input placeholder="请输入团队名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="团队描述"
          >
            <Input.TextArea placeholder="请输入团队描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="businessLineId"
            label="所属业务线"
          >
            <Select placeholder="请选择业务线" allowClear>
              {/* 这里可以添加业务线选项 */}
              <Option value="web-dev">Web开发</Option>
              <Option value="mobile-dev">移动开发</Option>
              <Option value="data-ai">数据分析</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setTeamModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTeam ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;