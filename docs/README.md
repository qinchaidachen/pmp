# 项目管理平台 (Project Management Platform)

一个现代化的团队任务看板管理系统，基于React + TypeScript + Vite构建，提供直观的可视化任务分配和时间轴管理功能。

## 📋 项目概述

项目管理平台是一个功能强大的前端应用，专为团队任务管理和资源调度而设计。该平台采用现代化的Web技术栈，提供响应式的用户界面和丰富的交互功能。

### 核心特性

- **📊 可视化任务看板**：直观的表格布局展示团队成员任务分配情况
- **📅 时间轴管理**：按周分组的时间轴，支持跨日任务显示
- **🎨 状态颜色标识**：5种预设颜色方案，清晰区分任务状态
- **📱 响应式设计**：完美适配桌面端和移动端设备
- **🔄 实时数据更新**：支持数据驱动的动态配置
- **🖱️ 交互式操作**：点击查看详情、悬停提示、编辑模式
- **📈 性能监控**：内置性能监控和优化机制
- **🛡️ 错误边界**：完善的错误处理和边界保护
- **💾 数据导入导出**：支持CSV/JSON格式的数据交换
- **👥 团队管理**：完整的团队成员和角色管理功能

## 🛠️ 技术栈

- **前端框架**: React 18.3.1
- **开发语言**: TypeScript 5.6.2
- **构建工具**: Vite 6.0.1
- **UI组件库**: 
  - Ant Design 5.27.6
  - Radix UI 组件系列
  - TailwindCSS 3.4.16
- **状态管理**: Redux Toolkit 2.9.2 + React Redux 9.2.0
- **路由管理**: React Router DOM 6.x
- **数据处理**: 
  - Dexie (IndexedDB)
  - PapaParse (CSV处理)
  - Day.js / date-fns (日期处理)
- **图表可视化**: ECharts 6.0.0 + Recharts 2.12.4
- **表单管理**: React Hook Form 7.54.2 + Zod 3.24.1
- **代码质量**: ESLint + TypeScript ESLint

## 🚀 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- pnpm 8.0.0 或更高版本（推荐）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd project-management-platform
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 生产模式构建（优化版本）
pnpm build:prod
```

## 📁 项目结构

```
project-management-platform/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── Dashboard/     # 仪表板组件
│   │   ├── TaskBoard/     # 任务看板组件
│   │   ├── TeamManagement/ # 团队管理组件
│   │   ├── ResourceBooking/ # 资源预订组件
│   │   ├── Leaderboard/   # 排行榜组件
│   │   ├── Loading/       # 加载组件
│   │   ├── Layout/        # 布局组件
│   │   └── ErrorBoundary/ # 错误边界组件
│   ├── pages/             # 页面组件
│   ├── services/          # 数据服务层
│   ├── stores/            # 状态管理
│   ├── hooks/             # 自定义Hook
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   └── styles/            # 样式文件
├── docs/                  # 项目文档
└── package.json           # 项目配置
```

## 🎯 主要功能模块

### 1. 任务看板 (TaskBoard)
- 可视化展示团队成员任务分配
- 支持跨日任务和任务状态颜色标识
- 提供交互式操作和数据验证

### 2. 团队管理 (TeamManagement)
- 团队成员信息管理
- 角色权限控制
- 成员工作量统计

### 3. 资源预订 (ResourceBooking)
- 资源分配和预订管理
- 冲突检测和解决
- 资源利用率分析

### 4. 性能分析 (PerformanceAnalysis)
- 系统性能监控
- 性能指标展示
- 优化建议

### 5. 数据导入导出
- 支持CSV/JSON格式数据交换
- 数据验证和清洗
- 批量操作支持

## 📖 使用指南

详细的使用指南请参考以下文档：

- [用户手册](user-manual.md) - 详细的功能使用说明
- [API文档](api-documentation.md) - 数据结构和接口说明
- [开发者文档](developer-guide.md) - 代码结构和开发指南
- [常见问题](faq.md) - FAQ和问题解答

## 🔧 配置说明

### 环境变量配置

创建 `.env` 文件（可选）：

```env
# API配置
VITE_API_BASE_URL=http://localhost:3000/api

# 数据库配置
VITE_DB_NAME=project_management_db

# 功能开关
VITE_ENABLE_PERFORMANCE_MONITOR=true
VITE_ENABLE_ERROR_BOUNDARY=true
```

### 自定义配置

#### 任务看板配置

```typescript
interface BoardConfig {
  startDate: Date;
  endDate: Date;
  weekStartDay?: 0 | 1; // 0=周日, 1=周一
  editable?: boolean;
  showWeekends?: boolean;
  colorScheme?: ColorScheme;
}
```

#### 颜色主题配置

```typescript
const customColors: ColorScheme = {
  pending: '#FFF9C4',      // 待开始
  inProgress: '#BBDEFB',   // 进行中
  completed: '#C8E6C9',    // 已完成
  blocked: '#FFCDD2',      // 阻塞
  review: '#F0F4C3'        // 评审中
};
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test TaskBoard
```

## 📊 性能优化

本项目包含多种性能优化机制：

- **虚拟滚动**：大数据量场景下的性能优化
- **React.memo**：组件级别的渲染优化
- **懒加载**：按需加载非关键功能
- **缓存策略**：数据缓存和状态优化
- **Bundle优化**：代码分割和Tree Shaking

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您在使用过程中遇到问题：

1. 查看 [FAQ文档](faq.md) 获取常见问题解答
2. 搜索现有的 [Issues](issues) 寻找解决方案
3. 创建新的 Issue 描述您的问题

## 📝 更新日志

详细的版本更新记录请查看 [CHANGELOG.md](../CHANGELOG.md)。

---

**项目管理平台** - 让团队协作更高效 🚀