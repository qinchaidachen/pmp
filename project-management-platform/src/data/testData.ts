import { 
  Member, 
  Task, 
  Project, 
  Team, 
  Resource, 
  ResourceBooking, 
  PerformanceMetric,
  BusinessLine,
  Role,
  TaskStatus,
  TaskPriority,
  ResourceType
} from '../types';

// 生成UUID的辅助函数
const generateId = (prefix: string = ''): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
};

// 日期辅助函数
const createDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// 业务线数据
export const businessLines: BusinessLine[] = [
  {
    id: 'bl-frontend',
    name: '前端开发',
    description: '负责用户界面和前端技术',
    ownerIds: ['team-frontend'],
    color: '#1890ff',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'bl-backend',
    name: '后端开发',
    description: '负责服务端逻辑和API开发',
    ownerIds: ['team-backend'],
    color: '#52c41a',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'bl-mobile',
    name: '移动端开发',
    description: '负责移动应用开发',
    ownerIds: ['team-mobile'],
    color: '#722ed1',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'bl-devops',
    name: '运维开发',
    description: '负责基础设施和运维自动化',
    ownerIds: ['team-devops'],
    color: '#fa8c16',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  }
];

// 角色数据
export const roles: Role[] = [
  {
    id: 'role-tech-lead',
    name: '技术负责人',
    description: '负责技术架构和团队管理',
    permissions: ['read', 'write', 'delete', 'admin'],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'role-senior-dev',
    name: '高级开发工程师',
    description: '负责核心功能开发和代码审查',
    permissions: ['read', 'write'],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'role-dev',
    name: '开发工程师',
    description: '负责功能开发和单元测试',
    permissions: ['read', 'write'],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'role-junior-dev',
    name: '初级开发工程师',
    description: '负责辅助开发和学习',
    permissions: ['read'],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'role-qa',
    name: '测试工程师',
    description: '负责质量保证和测试',
    permissions: ['read', 'write'],
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  }
];

// 团队数据
export const teams: Team[] = [
  {
    id: 'team-frontend',
    name: '前端开发团队',
    description: '负责Web和移动端前端开发',
    memberIds: ['member-zhang', 'member-li', 'member-wang', 'member-chen'],
    projectIds: ['project-ecommerce', 'project-mobile-app'],
    businessLineId: 'bl-frontend',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'team-backend',
    name: '后端开发团队',
    description: '负责服务端和API开发',
    memberIds: ['member-zhao', 'member-sun', 'member-zhou'],
    projectIds: ['project-ecommerce', 'project-analytics'],
    businessLineId: 'bl-backend',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'team-mobile',
    name: '移动端团队',
    description: '负责移动应用开发',
    memberIds: ['member-wu', 'member-zheng'],
    projectIds: ['project-mobile-app'],
    businessLineId: 'bl-mobile',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'team-devops',
    name: '运维团队',
    description: '负责基础设施和运维',
    memberIds: ['member-he', 'member-lv'],
    projectIds: ['project-infrastructure'],
    businessLineId: 'bl-devops',
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  }
];

// 成员数据
export const members: Member[] = [
  {
    id: 'member-zhang',
    name: '张伟',
    role: '技术负责人',
    email: 'zhang.wei@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    teamId: 'team-frontend',
    isActive: true,
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'member-li',
    name: '李娜',
    role: '高级开发工程师',
    email: 'li.na@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    teamId: 'team-frontend',
    isActive: true,
    createdAt: createDate(-28),
    updatedAt: createDate(-28)
  },
  {
    id: 'member-wang',
    name: '王强',
    role: '开发工程师',
    email: 'wang.qiang@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    teamId: 'team-frontend',
    isActive: true,
    createdAt: createDate(-25),
    updatedAt: createDate(-25)
  },
  {
    id: 'member-chen',
    name: '陈敏',
    role: '开发工程师',
    email: 'chen.min@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
    teamId: 'team-frontend',
    isActive: true,
    createdAt: createDate(-20),
    updatedAt: createDate(-20)
  },
  {
    id: 'member-zhao',
    name: '赵磊',
    role: '技术负责人',
    email: 'zhao.lei@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
    teamId: 'team-backend',
    isActive: true,
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'member-sun',
    name: '孙丽',
    role: '高级开发工程师',
    email: 'sun.li@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun',
    teamId: 'team-backend',
    isActive: true,
    createdAt: createDate(-26),
    updatedAt: createDate(-26)
  },
  {
    id: 'member-zhou',
    name: '周杰',
    role: '开发工程师',
    email: 'zhou.jie@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou',
    teamId: 'team-backend',
    isActive: true,
    createdAt: createDate(-22),
    updatedAt: createDate(-22)
  },
  {
    id: 'member-wu',
    name: '吴婷',
    role: '高级开发工程师',
    email: 'wu.ting@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wu',
    teamId: 'team-mobile',
    isActive: true,
    createdAt: createDate(-24),
    updatedAt: createDate(-24)
  },
  {
    id: 'member-zheng',
    name: '郑浩',
    role: '开发工程师',
    email: 'zheng.hao@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zheng',
    teamId: 'team-mobile',
    isActive: true,
    createdAt: createDate(-18),
    updatedAt: createDate(-18)
  },
  {
    id: 'member-he',
    name: '何静',
    role: '高级开发工程师',
    email: 'he.jing@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=he',
    teamId: 'team-devops',
    isActive: true,
    createdAt: createDate(-28),
    updatedAt: createDate(-28)
  },
  {
    id: 'member-lv',
    name: '吕明',
    role: '开发工程师',
    email: 'lv.ming@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lv',
    teamId: 'team-devops',
    isActive: true,
    createdAt: createDate(-21),
    updatedAt: createDate(-21)
  }
];

// 项目数据
export const projects: Project[] = [
  {
    id: 'project-ecommerce',
    name: '电商平台重构',
    description: '基于微服务架构的电商平台重构项目',
    startDate: createDate(-20),
    endDate: createDate(40),
    status: 'active',
    taskIds: [],
    teamIds: ['team-frontend', 'team-backend'],
    businessLineId: 'bl-frontend',
    createdAt: createDate(-20),
    updatedAt: createDate(-20)
  },
  {
    id: 'project-mobile-app',
    name: '移动端应用开发',
    description: 'iOS和Android原生应用开发',
    startDate: createDate(-15),
    endDate: createDate(45),
    status: 'active',
    taskIds: [],
    teamIds: ['team-frontend', 'team-mobile'],
    businessLineId: 'bl-mobile',
    createdAt: createDate(-15),
    updatedAt: createDate(-15)
  },
  {
    id: 'project-analytics',
    name: '数据分析平台',
    description: '大数据分析和可视化平台',
    startDate: createDate(-10),
    endDate: createDate(50),
    status: 'active',
    taskIds: [],
    teamIds: ['team-backend'],
    businessLineId: 'bl-backend',
    createdAt: createDate(-10),
    updatedAt: createDate(-10)
  },
  {
    id: 'project-infrastructure',
    name: '基础设施升级',
    description: '云平台和容器化基础设施升级',
    startDate: createDate(-25),
    endDate: createDate(35),
    status: 'active',
    taskIds: [],
    teamIds: ['team-devops'],
    businessLineId: 'bl-devops',
    createdAt: createDate(-25),
    updatedAt: createDate(-25)
  }
];

// 任务数据 - 特别设计用于甘特图测试
export const tasks: Task[] = [
  // 电商平台重构项目任务
  {
    id: 'task-001',
    title: '需求分析和设计',
    description: '完成电商平台的功能需求分析和技术架构设计',
    memberId: 'member-zhang',
    projectId: 'project-ecommerce',
    teamId: 'team-frontend',
    startDate: createDate(-20),
    endDate: createDate(-10),
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    storyPoints: 13,
    actualPersonDays: 8,
    estimatedPersonDays: 10,
    tags: ['设计', '需求分析'],
    dependencies: [],
    completedAt: createDate(-10),
    createdAt: createDate(-20),
    updatedAt: createDate(-10)
  },
  {
    id: 'task-002',
    title: '用户界面设计',
    description: '设计电商平台的用户界面和交互体验',
    memberId: 'member-li',
    projectId: 'project-ecommerce',
    teamId: 'team-frontend',
    startDate: createDate(-15),
    endDate: createDate(-5),
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    storyPoints: 8,
    actualPersonDays: 6,
    estimatedPersonDays: 8,
    tags: ['UI设计', '用户体验'],
    dependencies: ['task-001'],
    completedAt: createDate(-5),
    createdAt: createDate(-15),
    updatedAt: createDate(-5)
  },
  {
    id: 'task-003',
    title: '前端框架搭建',
    description: '搭建React前端项目框架和基础组件库',
    memberId: 'member-wang',
    projectId: 'project-ecommerce',
    teamId: 'team-frontend',
    startDate: createDate(-8),
    endDate: createDate(2),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 21,
    actualPersonDays: 5,
    estimatedPersonDays: 15,
    tags: ['前端', '框架'],
    dependencies: ['task-002'],
    createdAt: createDate(-8),
    updatedAt: createDate(0)
  },
  {
    id: 'task-004',
    title: '用户认证模块',
    description: '实现用户登录、注册和权限管理功能',
    memberId: 'member-chen',
    projectId: 'project-ecommerce',
    teamId: 'team-frontend',
    startDate: createDate(-5),
    endDate: createDate(5),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    storyPoints: 13,
    actualPersonDays: 2,
    estimatedPersonDays: 10,
    tags: ['认证', '安全'],
    dependencies: ['task-003'],
    createdAt: createDate(-5),
    updatedAt: createDate(0)
  },
  {
    id: 'task-005',
    title: '商品管理API',
    description: '开发商品CRUD和库存管理API接口',
    memberId: 'member-sun',
    projectId: 'project-ecommerce',
    teamId: 'team-backend',
    startDate: createDate(-3),
    endDate: createDate(7),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 13,
    actualPersonDays: 1,
    estimatedPersonDays: 12,
    tags: ['后端', 'API'],
    dependencies: ['task-001'],
    createdAt: createDate(-3),
    updatedAt: createDate(0)
  },
  {
    id: 'task-006',
    title: '订单处理系统',
    description: '实现订单创建、支付和状态管理',
    memberId: 'member-zhou',
    projectId: 'project-ecommerce',
    teamId: 'team-backend',
    startDate: createDate(3),
    endDate: createDate(15),
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    storyPoints: 21,
    estimatedPersonDays: 18,
    tags: ['订单', '支付'],
    dependencies: ['task-005'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  },
  {
    id: 'task-007',
    title: '前端集成测试',
    description: '对前端功能进行集成测试和性能优化',
    memberId: 'member-li',
    projectId: 'project-ecommerce',
    teamId: 'team-frontend',
    startDate: createDate(8),
    endDate: createDate(18),
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    storyPoints: 8,
    estimatedPersonDays: 8,
    tags: ['测试', '性能'],
    dependencies: ['task-004'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  },

  // 移动端应用开发项目任务
  {
    id: 'task-008',
    title: '移动端架构设计',
    description: '设计移动端应用的技术架构和开发规范',
    memberId: 'member-wu',
    projectId: 'project-mobile-app',
    teamId: 'team-mobile',
    startDate: createDate(-15),
    endDate: createDate(-8),
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    storyPoints: 8,
    actualPersonDays: 5,
    estimatedPersonDays: 7,
    tags: ['架构', '移动端'],
    dependencies: [],
    completedAt: createDate(-8),
    createdAt: createDate(-15),
    updatedAt: createDate(-8)
  },
  {
    id: 'task-009',
    title: 'iOS应用开发',
    description: '开发iOS原生应用的核心功能',
    memberId: 'member-wu',
    projectId: 'project-mobile-app',
    teamId: 'team-mobile',
    startDate: createDate(-5),
    endDate: createDate(10),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 34,
    actualPersonDays: 8,
    estimatedPersonDays: 25,
    tags: ['iOS', '原生开发'],
    dependencies: ['task-008'],
    createdAt: createDate(-5),
    updatedAt: createDate(0)
  },
  {
    id: 'task-010',
    title: 'Android应用开发',
    description: '开发Android原生应用的核心功能',
    memberId: 'member-zheng',
    projectId: 'project-mobile-app',
    teamId: 'team-mobile',
    startDate: createDate(-2),
    endDate: createDate(12),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 34,
    actualPersonDays: 3,
    estimatedPersonDays: 25,
    tags: ['Android', '原生开发'],
    dependencies: ['task-008'],
    createdAt: createDate(-2),
    updatedAt: createDate(0)
  },
  {
    id: 'task-011',
    title: '移动端测试和优化',
    description: '进行移动端应用的测试和性能优化',
    memberId: 'member-wu',
    projectId: 'project-mobile-app',
    teamId: 'team-mobile',
    startDate: createDate(13),
    endDate: createDate(25),
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    storyPoints: 13,
    estimatedPersonDays: 12,
    tags: ['测试', '优化'],
    dependencies: ['task-009', 'task-010'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  },

  // 数据分析平台项目任务
  {
    id: 'task-012',
    title: '数据采集系统',
    description: '开发多源数据采集和ETL处理系统',
    memberId: 'member-sun',
    projectId: 'project-analytics',
    teamId: 'team-backend',
    startDate: createDate(-10),
    endDate: createDate(5),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 21,
    actualPersonDays: 7,
    estimatedPersonDays: 18,
    tags: ['数据', 'ETL'],
    dependencies: [],
    createdAt: createDate(-10),
    updatedAt: createDate(0)
  },
  {
    id: 'task-013',
    title: '数据仓库设计',
    description: '设计数据仓库模型和存储架构',
    memberId: 'member-zhou',
    projectId: 'project-analytics',
    teamId: 'team-backend',
    startDate: createDate(-3),
    endDate: createDate(12),
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    storyPoints: 13,
    estimatedPersonDays: 15,
    tags: ['数据仓库', '架构'],
    dependencies: ['task-012'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  },
  {
    id: 'task-014',
    title: '可视化报表开发',
    description: '开发数据可视化和报表生成功能',
    memberId: 'member-zhao',
    projectId: 'project-analytics',
    teamId: 'team-backend',
    startDate: createDate(8),
    endDate: createDate(22),
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    storyPoints: 21,
    estimatedPersonDays: 20,
    tags: ['可视化', '报表'],
    dependencies: ['task-013'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  },

  // 基础设施升级项目任务
  {
    id: 'task-015',
    title: '容器化改造',
    description: '将现有服务迁移到Kubernetes容器平台',
    memberId: 'member-he',
    projectId: 'project-infrastructure',
    teamId: 'team-devops',
    startDate: createDate(-25),
    endDate: createDate(-5),
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.URGENT,
    storyPoints: 34,
    actualPersonDays: 25,
    estimatedPersonDays: 30,
    tags: ['容器化', 'Kubernetes'],
    dependencies: [],
    completedAt: createDate(-5),
    createdAt: createDate(-25),
    updatedAt: createDate(-5)
  },
  {
    id: 'task-016',
    title: 'CI/CD流水线',
    description: '建立自动化持续集成和部署流水线',
    memberId: 'member-lv',
    projectId: 'project-infrastructure',
    teamId: 'team-devops',
    startDate: createDate(-8),
    endDate: createDate(7),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    storyPoints: 21,
    actualPersonDays: 6,
    estimatedPersonDays: 18,
    tags: ['CI/CD', '自动化'],
    dependencies: ['task-015'],
    createdAt: createDate(-8),
    updatedAt: createDate(0)
  },
  {
    id: 'task-017',
    title: '监控告警系统',
    description: '部署应用性能监控和告警系统',
    memberId: 'member-he',
    projectId: 'project-infrastructure',
    teamId: 'team-devops',
    startDate: createDate(5),
    endDate: createDate(20),
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    storyPoints: 13,
    estimatedPersonDays: 15,
    tags: ['监控', '告警'],
    dependencies: ['task-016'],
    createdAt: createDate(0),
    updatedAt: createDate(0)
  }
];

// 资源数据
export const resources: Resource[] = [
  {
    id: 'resource-room-001',
    name: '大会议室A',
    type: ResourceType.MEETING_ROOM,
    description: '可容纳12人的大型会议室，配备投影仪和白板',
    location: '3楼东侧',
    capacity: 12,
    isAvailable: true,
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'resource-room-002',
    name: '小会议室B',
    type: ResourceType.MEETING_ROOM,
    description: '可容纳6人的中型会议室',
    location: '2楼西侧',
    capacity: 6,
    isAvailable: true,
    createdAt: createDate(-30),
    updatedAt: createDate(-30)
  },
  {
    id: 'resource-device-001',
    name: 'iPhone测试设备',
    type: ResourceType.TEST_DEVICE,
    description: 'iPhone 14 Pro Max测试设备',
    location: '测试实验室',
    capacity: 1,
    isAvailable: true,
    createdAt: createDate(-20),
    updatedAt: createDate(-20)
  },
  {
    id: 'resource-device-002',
    name: 'Android测试设备',
    type: ResourceType.TEST_DEVICE,
    description: 'Samsung Galaxy S23测试设备',
    location: '测试实验室',
    capacity: 1,
    isAvailable: true,
    createdAt: createDate(-20),
    updatedAt: createDate(-20)
  },
  {
    id: 'resource-server-001',
    name: '开发测试服务器',
    type: ResourceType.OTHER,
    description: '用于开发和测试的云服务器',
    location: '云端',
    capacity: 10,
    isAvailable: false,
    createdAt: createDate(-25),
    updatedAt: createDate(-5)
  }
];

// 资源预订数据
export const resourceBookings: ResourceBooking[] = [
  {
    id: 'booking-001',
    resourceId: 'resource-room-001',
    memberId: 'member-zhang',
    title: '电商项目周会',
    description: '电商平台重构项目周度进度会议',
    startDate: createDate(1),
    endDate: createDate(1, 2), // 2小时后结束
    attendees: ['member-zhang', 'member-li', 'member-wang', 'member-chen', 'member-sun'],
    status: 'confirmed',
    createdAt: createDate(-1),
    updatedAt: createDate(-1)
  },
  {
    id: 'booking-002',
    resourceId: 'resource-room-002',
    memberId: 'member-wu',
    title: '移动端技术评审',
    description: '移动端应用技术方案评审会议',
    startDate: createDate(2),
    endDate: createDate(2, 3), // 3小时后结束
    attendees: ['member-wu', 'member-zheng', 'member-zhang'],
    status: 'confirmed',
    createdAt: createDate(-2),
    updatedAt: createDate(-2)
  },
  {
    id: 'booking-003',
    resourceId: 'resource-device-001',
    memberId: 'member-wu',
    title: 'iOS应用测试',
    description: 'iOS应用功能测试和兼容性验证',
    startDate: createDate(3),
    endDate: createDate(8), // 5天
    attendees: ['member-wu'],
    status: 'confirmed',
    createdAt: createDate(-3),
    updatedAt: createDate(-3)
  },
  {
    id: 'booking-004',
    resourceId: 'resource-room-001',
    memberId: 'member-zhao',
    title: '数据分析架构讨论',
    description: '数据仓库架构设计讨论',
    startDate: createDate(5),
    endDate: createDate(5, 4), // 4小时后结束
    attendees: ['member-zhao', 'member-sun', 'member-zhou'],
    status: 'pending',
    createdAt: createDate(-1),
    updatedAt: createDate(-1)
  }
];

// 效能指标数据
export const performanceMetrics: PerformanceMetric[] = [
  // 张伟的效能数据
  {
    id: 'metric-member-zhang-2024-10',
    targetId: 'member-zhang',
    targetType: 'member',
    date: createDate(-30),
    period: 'month',
    storyPointsCompleted: 45,
    personDaysInvested: 35,
    tasksCompleted: 8,
    avgTaskCycleTime: 72,
    efficiencyScore: 8.5,
    velocity: 11.25,
    qualityScore: 9.2,
    rank: 1,
    percentile: 95,
    createdAt: createDate(-30),
    updatedAt: createDate(0)
  },
  // 李娜的效能数据
  {
    id: 'metric-member-li-2024-10',
    targetId: 'member-li',
    targetType: 'member',
    date: createDate(-30),
    period: 'month',
    storyPointsCompleted: 38,
    personDaysInvested: 32,
    tasksCompleted: 7,
    avgTaskCycleTime: 68,
    efficiencyScore: 8.2,
    velocity: 9.5,
    qualityScore: 8.8,
    rank: 2,
    percentile: 88,
    createdAt: createDate(-30),
    updatedAt: createDate(0)
  },
  // 王强的效能数据
  {
    id: 'metric-member-wang-2024-10',
    targetId: 'member-wang',
    targetType: 'member',
    date: createDate(-30),
    period: 'month',
    storyPointsCompleted: 32,
    personDaysInvested: 28,
    tasksCompleted: 6,
    avgTaskCycleTime: 75,
    efficiencyScore: 7.8,
    velocity: 8.0,
    qualityScore: 8.5,
    rank: 3,
    percentile: 82,
    createdAt: createDate(-30),
    updatedAt: createDate(0)
  },
  // 赵磊的效能数据
  {
    id: 'metric-member-zhao-2024-10',
    targetId: 'member-zhao',
    targetType: 'member',
    date: createDate(-30),
    period: 'month',
    storyPointsCompleted: 41,
    personDaysInvested: 38,
    tasksCompleted: 7,
    avgTaskCycleTime: 78,
    efficiencyScore: 8.0,
    velocity: 10.25,
    qualityScore: 8.9,
    rank: 2,
    percentile: 85,
    createdAt: createDate(-30),
    updatedAt: createDate(0)
  },
  // 吴婷的效能数据
  {
    id: 'metric-member-wu-2024-10',
    targetId: 'member-wu',
    targetType: 'member',
    date: createDate(-30),
    period: 'month',
    storyPointsCompleted: 36,
    personDaysInvested: 30,
    tasksCompleted: 6,
    avgTaskCycleTime: 70,
    efficiencyScore: 8.1,
    velocity: 9.0,
    qualityScore: 8.7,
    rank: 2,
    percentile: 86,
    createdAt: createDate(-30),
    updatedAt: createDate(0)
  }
];

// 完整的测试数据集
export const testData = {
  businessLines,
  roles,
  teams,
  members,
  projects,
  tasks,
  resources,
  resourceBookings,
  performanceMetrics
};

// 导入数据的辅助函数
export const importTestData = async (db: any): Promise<void> => {
  try {
    console.log('开始导入测试数据...');
    
    // 导入基础数据
    await db.businessLines.bulkAdd(businessLines);
    console.log(`✅ 导入 ${businessLines.length} 个业务线`);
    
    await db.roles.bulkAdd(roles);
    console.log(`✅ 导入 ${roles.length} 个角色`);
    
    await db.teams.bulkAdd(teams);
    console.log(`✅ 导入 ${teams.length} 个团队`);
    
    await db.members.bulkAdd(members);
    console.log(`✅ 导入 ${members.length} 个成员`);
    
    await db.projects.bulkAdd(projects);
    console.log(`✅ 导入 ${projects.length} 个项目`);
    
    await db.tasks.bulkAdd(tasks);
    console.log(`✅ 导入 ${tasks.length} 个任务`);
    
    await db.resources.bulkAdd(resources);
    console.log(`✅ 导入 ${resources.length} 个资源`);
    
    await db.resourceBookings.bulkAdd(resourceBookings);
    console.log(`✅ 导入 ${resourceBookings.length} 个资源预订`);
    
    await db.performanceMetrics.bulkAdd(performanceMetrics);
    console.log(`✅ 导入 ${performanceMetrics.length} 个效能指标`);
    
    console.log('🎉 测试数据导入完成！');
    
    // 更新项目中的任务ID列表
    const projectsWithTasks = projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      return {
        ...project,
        taskIds: projectTasks.map(task => task.id)
      };
    });
    
    await db.projects.clear();
    await db.projects.bulkAdd(projectsWithTasks);
    console.log('✅ 更新项目任务关联');
    
  } catch (error) {
    console.error('导入测试数据失败:', error);
    throw error;
  }
};

// 清空测试数据的辅助函数
export const clearTestData = async (db: any): Promise<void> => {
  try {
    console.log('开始清空测试数据...');
    
    await db.transaction('rw', 
      db.businessLines, db.roles, db.teams, db.members, 
      db.projects, db.tasks, db.resources, db.resourceBookings, 
      db.performanceMetrics,
      async () => {
        await db.businessLines.clear();
        await db.roles.clear();
        await db.teams.clear();
        await db.members.clear();
        await db.projects.clear();
        await db.tasks.clear();
        await db.resources.clear();
        await db.resourceBookings.clear();
        await db.performanceMetrics.clear();
      }
    );
    
    console.log('🗑️ 测试数据清空完成！');
  } catch (error) {
    console.error('清空测试数据失败:', error);
    throw error;
  }
};