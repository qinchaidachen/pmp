# 项目测试配置和编写总结

## 测试环境配置

### 1. 已安装的测试依赖
- **jest**: JavaScript测试框架
- **@testing-library/react**: React组件测试工具
- **@testing-library/jest-dom**: Jest DOM匹配器
- **@testing-library/user-event**: 用户事件模拟
- **jest-environment-jsdom**: JSDOM测试环境
- **@types/jest**: Jest TypeScript类型定义
- **ts-jest**: TypeScript的Jest预处理器

### 2. Jest配置文件 (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/tests/**/*.spec.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};
```

### 3. 测试设置文件 (src/tests/setup.ts)
- 配置@testing-library/jest-dom匹配器
- 设置全局测试环境
- Mock浏览器API (IntersectionObserver, ResizeObserver等)
- 配置测试后的清理

### 4. 测试工具 (src/tests/utils/test-utils.tsx)
- 提供自定义render函数
- 配置Redux Provider
- 配置React Router
- 统一的测试包装器

## 单元测试

### 1. 服务层测试 (src/tests/services/)
- **taskService.test.ts**: 任务服务测试
  - getAll, getById, getByMemberId等方法测试
  - 过滤和排序功能测试
  - 错误处理测试

- **memberService.test.ts**: 成员服务测试
  - 成员CRUD操作测试
  - 团队和角色筛选测试
  - 查询优化测试

- **projectService.test.ts**: 项目服务测试
  - 项目管理功能测试
  - 状态和业务线筛选测试
  - 异步操作测试

### 2. Redux Slice测试 (src/tests/stores/)
- **tasksSlice.test.ts**: 任务状态管理测试
  - 异步thunk测试 (fetchTasks, addTask, updateTask, deleteTask)
  - Reducer测试 (setFilters, setSortOptions等)
  - 错误和加载状态测试

- **membersSlice.test.ts**: 成员状态管理测试
  - 成员CRUD操作测试
  - 选择状态管理测试

- **projectsSlice.test.ts**: 项目状态管理测试
  - 项目生命周期测试
  - 当前项目选择测试

### 3. 组件测试 (src/tests/components/)
- **Dashboard.test.tsx**: 仪表板组件测试
  - 渲染测试
  - 统计数据显示测试
  - 图表组件测试
  - 加载和错误状态测试

- **TaskBoard.test.tsx**: 任务看板组件测试
  - 任务列表显示测试
  - 成员关联显示测试
  - 编辑和删除功能测试
  - 交互事件测试

- **TeamManagement.test.tsx**: 团队管理组件测试
  - 成员和团队列表测试
  - Tab切换测试
  - 统计数据显示测试

### 4. 工具函数测试 (src/tests/utils/)
- **dataValidation.test.ts**: 数据验证工具测试
  - Zod schema验证测试
  - 邮箱、URL格式验证测试
  - 日期范围验证测试
  - 输入清理测试
  - 表单数据验证测试

## 集成测试

### 1. 组件集成测试 (src/tests/integration/components.integration.test.tsx)
- Dashboard和TaskBoard数据流测试
- TaskBoard和Member关联测试
- TeamManagement和Member数据同步测试
- 跨组件数据传递测试
- 错误状态传播测试
- 加载状态同步测试

### 2. 数据流集成测试 (src/tests/integration/data-flow.integration.test.ts)
- Redux Store集成测试
- 服务层与Redux集成测试
- 跨Slice数据依赖测试
- 错误处理集成测试
- 加载状态管理测试
- 数据一致性测试

## Mock数据 (src/tests/mocks/data.ts)
- mockTasks: 模拟任务数据
- mockProjects: 模拟项目数据
- mockMembers: 模拟成员数据
- mockTeams: 模拟团队数据
- mockResources: 模拟资源数据

## 测试脚本

### package.json中添加的脚本:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 运行测试:
```bash
# 运行所有测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# CI模式运行测试
pnpm test:ci
```

## 测试覆盖率配置

### 覆盖率阈值:
- 分支覆盖率: 70%
- 函数覆盖率: 70%
- 行覆盖率: 70%
- 语句覆盖率: 70%

### 覆盖率报告:
- 控制台输出
- LCOV格式 (用于CI)
- HTML格式 (本地查看)

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 遵循"应该...当...时"的命名模式
- 分组相关的测试用例

### 2. 测试结构
- AAA模式: Arrange (准备), Act (执行), Assert (断言)
- 每个测试只测试一个功能点
- 避免测试之间的依赖

### 3. Mock使用
- 适当Mock外部依赖
- 保持Mock的真实性
- 清理Mock避免测试间干扰

### 4. 断言策略
- 使用具体的断言而不是泛化的断言
- 测试预期的行为而不是实现细节
- 包含正面和负面测试用例

## 测试文件结构

```
src/tests/
├── components/           # 组件单元测试
│   ├── Dashboard.test.tsx
│   ├── TaskBoard.test.tsx
│   └── TeamManagement.test.tsx
├── services/             # 服务层单元测试
│   ├── taskService.test.ts
│   ├── memberService.test.ts
│   └── projectService.test.ts
├── stores/               # Redux Slice测试
│   ├── tasksSlice.test.ts
│   ├── membersSlice.test.ts
│   └── projectsSlice.test.ts
├── integration/          # 集成测试
│   ├── components.integration.test.tsx
│   └── data-flow.integration.test.ts
├── utils/                # 工具函数测试
│   └── dataValidation.test.ts
├── mocks/                # Mock数据
│   └── data.ts
├── utils/                # 测试工具
│   └── test-utils.tsx
└── setup.ts             # Jest设置文件
```

## 后续建议

### 1. 扩展测试覆盖
- 添加更多边界条件测试
- 增加性能测试
- 添加可访问性测试

### 2. 测试工具增强
- 配置测试报告生成
- 添加快照测试
- 集成E2E测试框架

### 3. CI/CD集成
- 在CI流水线中运行测试
- 生成测试报告
- 设置覆盖率门禁

### 4. 测试维护
- 定期更新测试用例
- 重构测试代码
- 监控测试性能

通过这套完整的测试体系，项目可以确保代码质量，减少bug，提高可维护性，并为持续集成和部署提供信心保障。