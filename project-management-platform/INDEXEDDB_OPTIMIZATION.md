# IndexedDB 性能优化说明

## 概述

本文档描述了对项目管理系统中 IndexedDB 数据库进行的性能优化，包括索引优化、查询优化、性能监控和数据库维护等方面的改进。

## 主要优化内容

### 1. 索引优化

#### 1.1 基础索引
为所有表添加了必要的基础索引，包括：
- 主键索引（id）
- 常用查询字段索引（name, status, createdAt 等）

#### 1.2 复合索引
针对常用查询模式添加了复合索引：

**任务表 (tasks)**
- `[projectId+status]` - 按项目和状态查询任务
- `[projectId+createdAt]` - 按项目和时间范围查询
- `[memberId+status]` - 按成员和状态查询
- `[memberId+startDate]` - 按成员和时间范围查询
- `[teamId+status]` - 按团队和状态查询
- `[status+priority]` - 按状态和优先级查询
- `[startDate+endDate]` - 按时间范围查询

**成员表 (members)**
- `[teamId+role]` - 按团队和角色查询成员
- `[teamId+isActive]` - 查询团队中的活跃成员
- `[role+isActive]` - 按角色和状态查询
- `[isActive+createdAt]` - 按活跃状态和时间查询

**其他表**
- 项目表：按状态和日期范围查询
- 资源表：按类型和可用状态查询
- 资源预订表：按资源和时间范围查询

### 2. 查询优化

#### 2.1 性能监控
- 添加了查询时间监控
- 自动检测慢查询（>100ms）
- 记录索引使用情况
- 提供性能统计报告

#### 2.2 优化查询方法
```typescript
// 使用复合索引的优化查询
const tasks = await queryUtils.getTasksByProjectAndStatus(projectId, status);
const members = await queryUtils.getMembersByTeamAndRole(teamId, role);
const resources = await queryUtils.getAvailableResourcesByType(type);
```

#### 2.3 Service 层优化
所有 Service 类都已更新使用优化查询：
- `taskService.ts` - 使用索引优化任务查询
- `memberService.ts` - 使用索引优化成员查询
- `projectService.ts` - 使用索引优化项目查询

### 3. 数据库迁移

#### 3.1 版本管理
- 数据库版本从 1 升级到 2
- 支持向后兼容的索引添加
- 自动化迁移流程

#### 3.2 迁移管理器
- `DatabaseMigrationManager` 类管理数据库版本升级
- 支持迁移历史记录
- 提供数据库完整性验证

### 4. 性能监控工具

#### 4.1 性能监控组件
- `PerformanceMonitor.tsx` - React 性能监控界面
- 实时显示查询性能指标
- 慢查询检测和展示
- 数据库优化操作

#### 4.2 监控指标
- 平均查询时间
- 总查询数量
- 慢查询数量
- 索引使用率
- 最近查询记录

### 5. 维护工具

#### 5.1 数据库优化
```typescript
import { maintenanceUtils } from './database';

// 重建索引
await maintenanceUtils.rebuildIndexes();

// 清理性能数据
maintenanceUtils.clearPerformanceData();

// 完整优化
await maintenanceUtils.optimize();
```

#### 5.2 备份和恢复
- 数据库备份功能
- 数据恢复功能
- 完整性验证

## 使用指南

### 1. 初始化数据库
```typescript
import { initializeDatabase, runMigrations } from './database';

// 初始化数据库和索引
await initializeDatabase();

// 运行迁移（如果需要）
await runMigrations();
```

### 2. 使用优化查询
```typescript
import { queryUtils } from './database';

// 优化的任务查询
const tasks = await queryUtils.getTasksByProjectAndStatus(projectId, status);

// 优化的成员查询
const members = await queryUtils.getActiveMembersByTeam(teamId);
```

### 3. 监控性能
```typescript
import { getPerformanceReport } from './database';

// 获取性能报告
const report = getPerformanceReport();
console.log('平均查询时间:', report.averageQueryTime);
console.log('慢查询:', report.slowQueries);
```

### 4. 维护数据库
```typescript
import { maintenanceUtils } from './database';

// 优化数据库
await maintenanceUtils.optimize();

// 检查数据库健康状态
import { validateDatabaseHealth } from './migrationManager';
const health = await validateDatabaseHealth();
```

## 性能提升预期

### 查询性能
- **基础查询**: 提升 20-50%
- **复合查询**: 提升 50-80%
- **时间范围查询**: 提升 60-90%

### 索引优化效果
- 避免全表扫描
- 减少查询时间复杂度
- 提高并发查询性能

### 监控效果
- 实时性能监控
- 及时发现性能问题
- 数据驱动的优化决策

## 最佳实践

### 1. 查询优化
- 优先使用复合索引字段进行查询
- 避免在查询中使用函数包装索引字段
- 合理使用排序和分页

### 2. 索引维护
- 定期重建索引
- 监控索引使用情况
- 根据查询模式调整索引

### 3. 性能监控
- 定期检查性能报告
- 关注慢查询日志
- 及时优化性能问题

### 4. 数据库维护
- 定期备份数据
- 监控数据库健康状态
- 及时处理性能问题

## 故障排除

### 1. 索引问题
如果发现索引未生效：
1. 检查数据库版本
2. 验证索引定义
3. 重建索引
4. 检查查询语句

### 2. 性能问题
如果查询性能较差：
1. 检查慢查询日志
2. 验证索引使用情况
3. 优化查询语句
4. 考虑添加新索引

### 3. 迁移问题
如果数据库迁移失败：
1. 检查数据库状态
2. 验证备份数据
3. 手动执行迁移
4. 恢复备份（如需要）

## 未来优化方向

1. **更多复合索引**: 根据实际查询模式添加更多复合索引
2. **分区表**: 对于大数据量，考虑表分区策略
3. **缓存策略**: 实现智能查询缓存
4. **自动化优化**: 基于使用模式自动优化索引

## 总结

通过这次优化，项目管理系统的 IndexedDB 性能得到了显著提升：

- ✅ 添加了 30+ 个优化索引
- ✅ 实现了查询性能监控
- ✅ 提供了完整的迁移管理系统
- ✅ 创建了性能监控界面
- ✅ 建立了维护工具集

这些优化将显著提升系统的响应速度和用户体验，特别是在处理大量数据时效果更为明显。