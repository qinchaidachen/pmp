// Mock 数据
export const mockTasks = [
  {
    id: '1',
    title: '测试任务1',
    description: '这是一个测试任务',
    status: 'todo' as const,
    priority: 'high' as const,
    assignee: 'user1',
    projectId: 'project1',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
    tags: ['frontend', 'react'],
  },
  {
    id: '2',
    title: '测试任务2',
    description: '这是另一个测试任务',
    status: 'in-progress' as const,
    priority: 'medium' as const,
    assignee: 'user2',
    projectId: 'project1',
    dueDate: new Date('2025-11-30'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-15'),
    tags: ['backend', 'api'],
  },
];

export const mockProjects = [
  {
    id: 'project1',
    name: '测试项目',
    description: '这是一个测试项目',
    status: 'active' as const,
    owner: 'user1',
    members: ['user1', 'user2'],
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-12-31'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  },
];

export const mockMembers = [
  {
    id: 'user1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'developer' as const,
    avatar: 'https://example.com/avatar1.jpg',
    status: 'active' as const,
    joinDate: new Date('2025-09-01'),
    lastActive: new Date('2025-10-27'),
    skills: ['React', 'TypeScript', 'Node.js'],
    workload: 80,
  },
  {
    id: 'user2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'designer' as const,
    avatar: 'https://example.com/avatar2.jpg',
    status: 'active' as const,
    joinDate: new Date('2025-09-15'),
    lastActive: new Date('2025-10-26'),
    skills: ['UI/UX', 'Figma', 'Photoshop'],
    workload: 60,
  },
];

export const mockTeams = [
  {
    id: 'team1',
    name: '前端开发团队',
    description: '负责前端开发工作',
    leader: 'user1',
    members: ['user1', 'user2'],
    projectId: 'project1',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  },
];

export const mockResources = [
  {
    id: 'resource1',
    name: '开发服务器',
    type: 'server' as const,
    status: 'available' as const,
    capacity: 100,
    currentUsage: 60,
    assignedTo: ['user1', 'user2'],
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  },
];