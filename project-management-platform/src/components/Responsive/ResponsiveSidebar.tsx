import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from './hooks/useResponsive';
import { useTouchGestures } from './hooks/useTouchGestures';

const { Sider } = Layout;
const { Text } = Typography;

interface ResponsiveSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  menuItems?: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
  }>;
  onUserMenuClick?: (key: string) => void;
  className?: string;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  collapsed = false,
  onCollapse,
  user = { name: '用户', role: '管理员' },
  menuItems,
  onUserMenuClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // 触摸手势
  const { elementRef: sidebarRef, isSwipeRight, isSwipeLeft } = useTouchGestures({
    threshold: 100,
  });

  // 默认菜单项
  const defaultMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
    },
    {
      key: '/taskboard',
      icon: <ProjectOutlined />,
      label: '任务看板',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: '/resources',
      icon: <CalendarOutlined />,
      label: '资源预定',
    },
    {
      key: '/performance',
      icon: <BarChartOutlined />,
      label: '效能分析',
    },
    {
      key: '/leaderboard',
      icon: <TrophyOutlined />,
      label: '效能排行',
    },
    {
      key: '/data',
      icon: <DatabaseOutlined />,
      label: '数据管理',
    },
  ];

  const items = menuItems || defaultMenuItems;

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    onUserMenuClick?.(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  // 处理折叠状态变化
  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapse?.(collapsed);
  };

  // 触摸滑动处理
  React.useEffect(() => {
    if (isMobile && isSwipeRight) {
      setDrawerVisible(true);
    }
    if (isMobile && isSwipeLeft) {
      setDrawerVisible(false);
    }
  }, [isMobile, isSwipeRight, isSwipeLeft]);

  // 移动端抽屉侧边栏
  const mobileSidebar = (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
            项目管理平台
          </Text>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setDrawerVisible(false)}
            className="lg:hidden"
          />
        </div>
      }
      placement="left"
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
      width={280}
      bodyStyle={{ padding: 0 }}
      className="responsive-sidebar-drawer"
    >
      <div className="flex flex-col h-full">
        {/* 用户信息 */}
        <div className="p-4 border-b border-gray-200">
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user.role}
              </Text>
            </div>
          </Space>
        </div>

        {/* 菜单 */}
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          />
        </div>

        {/* 底部用户菜单 */}
        <div className="border-t border-gray-200 p-2">
          <Menu
            mode="inline"
            items={userMenuItems}
            onClick={handleUserMenuClick}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </Drawer>
  );

  // 桌面端折叠侧边栏
  const desktopSidebar = (
    <Sider
      ref={sidebarRef}
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      width={240}
      collapsedWidth={80}
      className={`responsive-sidebar ${className}`}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div className="logo" style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 8,
      }}>
        {!isCollapsed ? (
          <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
            项目管理平台
          </Text>
        ) : (
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            PMP
          </Text>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={handleMenuClick}
        style={{ border: 'none' }}
      />

      {/* 用户信息（仅在展开时显示） */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-2 border-t border-gray-200 pt-4">
            <Space>
              <Avatar icon={<UserOutlined />} size="small" />
              <div className="flex-1 min-w-0">
                <div style={{ fontWeight: 500, fontSize: '12px' }} className="truncate">
                  {user.name}
                </div>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  {user.role}
                </Text>
              </div>
            </Space>
          </div>
        </div>
      )}
    </Sider>
  );

  // 折叠按钮
  const collapseButton = !isMobile && (
    <Button
      type="text"
      icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={() => handleCollapse(!isCollapsed)}
      style={{
        fontSize: '16px',
        width: 64,
        height: 64,
        position: 'fixed',
        top: 0,
        left: isCollapsed ? 80 : 240,
        zIndex: 101,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
        borderRadius: 0,
        transition: 'left 0.2s ease',
      }}
    />
  );

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      {isMobile && (
        <Button
          type="text"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 101,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            borderBottom: '1px solid #f0f0f0',
            borderRadius: 0,
          }}
        />
      )}

      {/* 桌面端侧边栏 */}
      {!isMobile && desktopSidebar}

      {/* 移动端抽屉 */}
      {isMobile && mobileSidebar}

      {/* 折叠按钮 */}
      {collapseButton}

      {/* 侧边栏遮罩层（移动端） */}
      {isMobile && drawerVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setDrawerVisible(false)}
        />
      )}
    </>
  );
};

export default ResponsiveSidebar;