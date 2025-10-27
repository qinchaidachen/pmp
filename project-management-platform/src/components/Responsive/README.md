# 响应式设计组件库

这是一个完整的响应式设计组件库，为React项目提供响应式布局、表单、图表等组件，支持移动端、平板和桌面端的良好显示。

## 功能特性

- 📱 **移动端优化**: 专为移动设备优化的触摸交互和布局
- 📊 **响应式表格**: 在小屏幕下自动转换为卡片布局
- 📈 **响应式图表**: 自适应不同屏幕尺寸的图表显示
- 🎯 **触摸手势**: 支持滑动、长按等触摸手势
- 🎨 **主题支持**: 支持明暗主题和高对比度模式
- ♿ **无障碍**: 遵循无障碍设计原则
- 🚀 **高性能**: 使用React hooks优化性能

## 组件概览

### 核心组件

- `ResponsiveLayout` - 响应式布局容器
- `ResponsiveSidebar` - 响应式侧边栏
- `ResponsiveTable` - 响应式表格
- `ResponsiveChart` - 响应式图表

### Hooks

- `useResponsive` - 屏幕尺寸和断点检测
- `useResponsiveValue` - 响应式值获取
- `useTouchGestures` - 触摸手势支持
- `useDrag` - 拖拽功能

## 快速开始

### 1. 导入样式

首先在项目中导入响应式样式：

```tsx
// 在主入口文件或组件中导入
import './components/Responsive/responsive.css';
```

### 2. 使用响应式布局

```tsx
import React from 'react';
import { ResponsiveLayout } from './components/Responsive';

const App = () => {
  return (
    <ResponsiveLayout
      sidebar={{
        user: { name: '张三', role: '管理员' },
        menuItems: [
          { key: '/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
          { key: '/team', icon: <TeamOutlined />, label: '团队管理' },
        ],
      }}
      header={{
        title: '我的应用',
        subtitle: '欢迎使用响应式应用',
      }}
    >
      <div>页面内容</div>
    </ResponsiveLayout>
  );
};
```

### 3. 使用响应式表格

```tsx
import React from 'react';
import { ResponsiveTable } from './components/Responsive';

const UserTable = () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      hideOnMobile: false,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      hideOnMobile: true, // 移动端隐藏
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
  ];

  return (
    <ResponsiveTable
      title="用户列表"
      columns={columns}
      dataSource={users}
      rowKey="id"
      actions={{
        view: (record) => console.log('查看', record),
        edit: (record) => console.log('编辑', record),
        delete: (record) => console.log('删除', record),
      }}
    />
  );
};
```

### 4. 使用响应式图表

```tsx
import React from 'react';
import { ResponsiveChart } from './components/Responsive';

const SalesChart = () => {
  return (
    <ResponsiveChart
      title="销售趋势"
      subtitle="最近30天的销售数据"
      actions={{
        period: {
          value: '30d',
          options: [
            { label: '最近7天', value: '7d' },
            { label: '最近30天', value: '30d' },
            { label: '最近90天', value: '90d' },
          ],
          onChange: (value) => console.log('期间变更', value),
        },
        refresh: () => console.log('刷新图表'),
        export: () => console.log('导出图表'),
      }}
    >
      {/* 这里放置你的图表组件 */}
      <div className="h-full flex items-center justify-center">
        <p>图表内容</p>
      </div>
    </ResponsiveChart>
  );
};
```

### 5. 使用响应式Hooks

```tsx
import React from 'react';
import { useResponsive, useResponsiveValue } from './components/Responsive';

const MyComponent = () => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  
  // 根据屏幕尺寸返回不同值
  const columns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
  });

  const fontSize = useResponsiveValue({
    mobile: '14px',
    tablet: '16px',
    desktop: '18px',
  });

  return (
    <div style={{ fontSize }}>
      <p>当前断点: {currentBreakpoint}</p>
      <p>列数: {columns}</p>
      {isMobile && <p>这是移动端内容</p>}
    </div>
  );
};
```

### 6. 使用触摸手势

```tsx
import React from 'react';
import { useTouchGestures } from './components/Responsive';

const SwipeableComponent = () => {
  const { elementRef, swipeDirection, isLongPress } = useTouchGestures({
    threshold: 50, // 滑动阈值
  });

  React.useEffect(() => {
    if (swipeDirection) {
      console.log('滑动方向:', swipeDirection);
    }
    if (isLongPress) {
      console.log('检测到长按');
    }
  }, [swipeDirection, isLongPress]);

  return (
    <div ref={elementRef} className="swipeable-area">
      滑动或长按这里
    </div>
  );
};
```

## 断点配置

组件库使用以下断点：

| 断点 | 尺寸 | 设备类型 |
|------|------|----------|
| xs | 0px | 超小屏幕（手机竖屏） |
| sm | 640px | 小屏幕（手机横屏） |
| md | 768px | 中等屏幕（平板竖屏） |
| lg | 1024px | 大屏幕（平板横屏/小桌面） |
| xl | 1280px | 超大屏幕（桌面） |
| 2xl | 1536px | 超超大屏幕（大桌面） |

## 响应式策略

### 移动端优化

- 侧边栏变为抽屉式导航
- 表格自动转换为卡片布局
- 按钮和交互元素增大触摸区域
- 简化操作菜单

### 平板优化

- 保持适中的布局密度
- 优化触摸交互
- 合理利用屏幕空间

### 桌面端

- 完整功能展示
- 鼠标交互优化
- 多列布局

## 主题支持

组件库支持以下主题：

- 明亮主题（默认）
- 暗色主题（自动检测系统偏好）
- 高对比度模式
- 减少动画模式

## 无障碍特性

- 键盘导航支持
- 屏幕阅读器友好
- 语义化HTML结构
- 适当的对比度

## 性能优化

- 使用React.memo避免不必要的重渲染
- 响应式值缓存
- 事件监听器自动清理
- 触摸事件防抖

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 注意事项

1. 确保在项目根目录导入CSS样式
2. 触摸手势需要实际设备测试
3. 大型数据集建议使用虚拟滚动
4. 图表组件需要额外配置

## 扩展开发

组件库采用模块化设计，可以轻松扩展：

```tsx
// 创建自定义响应式组件
import { useResponsive } from './hooks/useResponsive';

const MyResponsiveComponent = () => {
  const { isMobile } = useResponsive();
  
  return (
    <div className={isMobile ? 'mobile-style' : 'desktop-style'}>
      {/* 组件内容 */}
    </div>
  );
};
```

## 许可证

MIT License