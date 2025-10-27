import React, { useState } from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { useResponsive } from './hooks/useResponsive';
import ResponsiveSidebar from './ResponsiveSidebar';

const { Header, Content } = Layout;
const { Text } = Typography;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: {
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
  };
  header?: {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: Array<{
      title: string;
      path?: string;
    }>;
  };
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 响应式内容区域样式
  const getContentStyle = () => {
    const baseStyle = {
      margin: 0,
      background: '#fff',
      borderRadius: '8px',
      minHeight: 'calc(100vh - 112px)',
      overflow: 'auto' as const,
    };

    if (isMobile) {
      return {
        ...baseStyle,
        margin: '8px',
        padding: '16px',
        minHeight: 'calc(100vh - 80px)',
      };
    }

    if (isTablet) {
      return {
        ...baseStyle,
        margin: '16px',
        padding: '20px',
        minHeight: 'calc(100vh - 96px)',
      };
    }

    return {
      ...baseStyle,
      margin: '24px',
      padding: '24px',
      minHeight: 'calc(100vh - 112px)',
    };
  };

  // 响应式头部样式
  const getHeaderStyle = () => {
    const baseStyle = {
      padding: '0 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    };

    if (isMobile) {
      return {
        ...baseStyle,
        padding: '0 16px',
        height: 56,
      };
    }

    if (isTablet) {
      return {
        ...baseStyle,
        padding: '0 20px',
        height: 64,
      };
    }

    return {
      ...baseStyle,
      padding: '0 24px',
      height: 64,
    };
  };

  // 面包屑导航
  const renderBreadcrumbs = () => {
    if (!header?.breadcrumbs || isMobile) return null;

    return (
      <Space size="small" className="text-sm">
        {header.breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Text type="secondary">/</Text>}
            <Text 
              type={index === header.breadcrumbs!.length - 1 ? undefined : 'secondary'}
              className={index === header.breadcrumbs!.length - 1 ? '' : 'cursor-pointer hover:text-blue-500'}
              onClick={() => item.path && window.history.pushState({}, '', item.path)}
            >
              {item.title}
            </Text>
          </React.Fragment>
        ))}
      </Space>
    );
  };

  // 移动端紧凑头部
  const renderMobileHeader = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 min-w-0">
        {header?.title && (
          <Text strong className="text-base truncate block">
            {header.title}
          </Text>
        )}
        {header?.subtitle && (
          <Text type="secondary" className="text-xs truncate block">
            {header.subtitle}
          </Text>
        )}
        {renderBreadcrumbs()}
      </div>
      
      {header?.actions && (
        <Space size="small" className="flex-shrink-0 ml-2">
          {header.actions}
        </Space>
      )}
    </div>
  );

  // 桌面端完整头部
  const renderDesktopHeader = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        {header?.title && (
          <Text strong className="text-lg">
            {header.title}
          </Text>
        )}
        {header?.subtitle && (
          <Text type="secondary" className="ml-2">
            {header.subtitle}
          </Text>
        )}
        {renderBreadcrumbs()}
      </div>
      
      {header?.actions && (
        <Space size="middle">
          {header.actions}
        </Space>
      )}
    </div>
  );

  return (
    <Layout className={`responsive-layout ${className}`} style={{ minHeight: '100vh' }}>
      {/* 响应式侧边栏 */}
      <ResponsiveSidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        user={sidebar?.user}
        menuItems={sidebar?.menuItems}
        onUserMenuClick={sidebar?.onUserMenuClick}
      />

      {/* 主内容区域 */}
      <Layout style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 240) }}>
        {/* 响应式头部 */}
        <Header style={getHeaderStyle()}>
          {isMobile ? renderMobileHeader() : renderDesktopHeader()}
        </Header>

        {/* 内容区域 */}
        <Content style={getContentStyle()}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ResponsiveLayout;