import React, { useMemo } from 'react';
import { Card, Select, Space, Typography, Button } from 'antd';
import { ReloadOutlined, FullscreenOutlined, DownloadOutlined } from '@ant-design/icons';
import { useResponsive, useResponsiveValue } from './hooks/useResponsive';

const { Title, Text } = Typography;
const { Option } = Select;

interface ResponsiveChartProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number | string;
  loading?: boolean;
  error?: string;
  actions?: {
    refresh?: () => void;
    export?: () => void;
    fullscreen?: () => void;
    period?: {
      value: string;
      options: Array<{ label: string; value: string }>;
      onChange: (value: string) => void;
    };
  };
  className?: string;
  empty?: {
    description?: string;
    image?: React.ReactNode;
  };
}

const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  title,
  subtitle,
  children,
  height = 400,
  loading = false,
  error,
  actions,
  className = '',
  empty,
}) => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();

  // 响应式高度
  const responsiveHeight = useResponsiveValue({
    mobile: 300,
    tablet: 350,
    desktop: height,
  });

  // 响应式内边距
  const responsivePadding = useResponsiveValue({
    mobile: 16,
    tablet: 20,
    desktop: 24,
  });

  // 响应式字体大小
  const titleSize = useResponsiveValue({
    mobile: 16,
    tablet: 18,
    desktop: 20,
  });

  const subtitleSize = useResponsiveValue({
    mobile: 12,
    tablet: 13,
    desktop: 14,
  });

  // 图表容器样式
  const chartContainerStyle = {
    height: typeof responsiveHeight === 'number' ? `${responsiveHeight}px` : responsiveHeight,
    width: '100%',
    position: 'relative' as const,
  };

  // 加载状态
  const LoadingComponent = (
    <div 
      className="flex items-center justify-center"
      style={{ height: chartContainerStyle.height }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <Text type="secondary">加载中...</Text>
      </div>
    </div>
  );

  // 错误状态
  const ErrorComponent = (
    <div 
      className="flex items-center justify-center"
      style={{ height: chartContainerStyle.height }}
    >
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-2">⚠️</div>
        <Text type="danger">{error || '数据加载失败'}</Text>
        {actions?.refresh && (
          <div className="mt-2">
            <Button size="small" onClick={actions.refresh}>
              重试
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // 空数据状态
  const EmptyComponent = (
    <div 
      className="flex items-center justify-center"
      style={{ height: chartContainerStyle.height }}
    >
      <div className="text-center">
        {empty?.image && (
          <div className="mb-2">
            {empty.image}
          </div>
        )}
        <Text type="secondary">
          {empty?.description || '暂无数据'}
        </Text>
      </div>
    </div>
  );

  // 渲染图表内容
  const renderChartContent = () => {
    if (loading) return LoadingComponent;
    if (error) return ErrorComponent;
    if (!children) return EmptyComponent;
    
    return (
      <div style={chartContainerStyle} className="responsive-chart-container">
        {children}
      </div>
    );
  };

  // 移动端紧凑布局
  if (isMobile) {
    return (
      <Card 
        className={`responsive-chart-mobile ${className}`}
        bodyStyle={{ padding: responsivePadding }}
        size="small"
      >
        {/* 标题区域 */}
        {(title || actions) && (
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              {title && (
                <Title 
                  level={5} 
                  style={{ 
                    fontSize: titleSize, 
                    margin: 0,
                    marginBottom: subtitle ? 4 : 0 
                  }}
                  className="truncate"
                >
                  {title}
                </Title>
              )}
              {subtitle && (
                <Text 
                  type="secondary" 
                  style={{ fontSize: subtitleSize }}
                  className="block truncate"
                >
                  {subtitle}
                </Text>
              )}
            </div>
            
            {/* 操作按钮 */}
            <Space size="small" className="flex-shrink-0 ml-2">
              {actions?.period && (
                <Select
                  size="small"
                  value={actions.period.value}
                  onChange={actions.period.onChange}
                  style={{ width: 80 }}
                >
                  {actions.period.options.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
              {actions?.refresh && (
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={actions.refresh}
                />
              )}
              {actions?.export && (
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={actions.export}
                />
              )}
              {actions?.fullscreen && (
                <Button
                  type="text"
                  size="small"
                  icon={<FullscreenOutlined />}
                  onClick={actions.fullscreen}
                />
              )}
            </Space>
          </div>
        )}

        {/* 图表内容 */}
        {renderChartContent()}
      </Card>
    );
  }

  // 平板和桌面端完整布局
  return (
    <Card 
      className={`responsive-chart ${className}`}
      title={
        <div className="flex justify-between items-center">
          <div>
            {title && (
              <Title 
                level={4} 
                style={{ 
                  fontSize: titleSize, 
                  margin: 0,
                  marginBottom: subtitle ? 4 : 0 
                }}
              >
                {title}
              </Title>
            )}
            {subtitle && (
              <Text 
                type="secondary" 
                style={{ fontSize: subtitleSize }}
              >
                {subtitle}
              </Text>
            )}
          </div>
          
          {/* 操作按钮 */}
          <Space>
            {actions?.period && (
              <Select
                value={actions.period.value}
                onChange={actions.period.onChange}
                style={{ width: 100 }}
              >
                {actions.period.options.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )}
            {actions?.refresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={actions.refresh}
              >
                刷新
              </Button>
            )}
            {actions?.export && (
              <Button
                icon={<DownloadOutlined />}
                onClick={actions.export}
              >
                导出
              </Button>
            )}
            {actions?.fullscreen && (
              <Button
                icon={<FullscreenOutlined />}
                onClick={actions.fullscreen}
              >
                全屏
              </Button>
            )}
          </Space>
        </div>
      }
      bodyStyle={{ padding: responsivePadding }}
    >
      {renderChartContent()}
    </Card>
  );
};

export default ResponsiveChart;