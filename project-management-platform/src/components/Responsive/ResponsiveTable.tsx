import React, { useState, useMemo } from 'react';
import { Table, Card, Button, Space, Dropdown, Typography, Tag } from 'antd';
import { 
  MoreOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useResponsive, useResponsiveValue } from './hooks/useResponsive';

const { Text } = Typography;

interface ResponsiveTableColumn<T = any> extends ColumnsType<T> {
  // 在移动端是否隐藏
  hideOnMobile?: boolean;
  // 在平板是否隐藏
  hideOnTablet?: boolean;
  // 自定义移动端显示内容
  renderMobile?: (value: any, record: T, index: number) => React.ReactNode;
}

interface ResponsiveTableProps<T = any> {
  columns: ResponsiveTableColumn<T>[];
  dataSource: T[];
  rowKey: string | ((record: T) => string);
  loading?: boolean;
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  actions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    custom?: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
    }>;
  };
  selectable?: boolean;
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
}

const ResponsiveTable = <T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  pagination,
  actions,
  selectable = false,
  onSelectionChange,
  className = '',
  title,
  extra,
  onRefresh,
  onExport,
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 响应式列配置
  const responsiveColumns = useMemo(() => {
    return columns.filter(col => {
      if (isMobile && col.hideOnMobile) return false;
      if (isTablet && col.hideOnTablet) return false;
      return true;
    }).map(col => {
      // 在移动端添加操作列
      if (isMobile && actions) {
        return {
          ...col,
          width: col.width || 120,
          render: (value: any, record: T, index: number) => {
            // 自定义移动端渲染
            if (col.renderMobile) {
              return col.renderMobile(value, record, index);
            }
            
            // 默认渲染
            return col.render ? col.render(value, record, index) : value;
          },
        };
      }
      
      return col;
    });
  }, [columns, isMobile, isTablet, actions]);

  // 移动端卡片数据
  const mobileCards = useMemo(() => {
    if (!isMobile) return [];
    
    return dataSource.map((record, index) => {
      const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
      
      return (
        <Card
          key={key}
          size="small"
          className="mb-4 shadow-sm border border-gray-200"
          bodyStyle={{ padding: '12px' }}
          actions={actions ? [
            actions.view && (
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => actions.view?.(record)}
              />
            ),
            actions.edit && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => actions.edit?.(record)}
              />
            ),
            actions.delete && (
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => actions.delete?.(record)}
              />
            ),
          ].filter(Boolean) : undefined}
        >
          <div className="space-y-2">
            {responsiveColumns.map((column, colIndex) => {
              const value = record[column.dataIndex as keyof T];
              const displayValue = column.render 
                ? column.render(value, record, index)
                : value;
              
              return (
                <div key={colIndex} className="flex justify-between items-center">
                  <Text type="secondary" className="text-xs">
                    {column.title}:
                  </Text>
                  <div className="flex-1 text-right">
                    {displayValue}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      );
    });
  }, [isMobile, dataSource, rowKey, responsiveColumns, actions]);

  // 表格行选择配置
  const rowSelection = selectable ? {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: T[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      onSelectionChange?.(newSelectedRowKeys, selectedRows);
    },
  } : undefined;

  // 响应式分页配置
  const responsivePagination = useResponsiveValue({
    mobile: {
      ...pagination,
      pageSize: pagination?.pageSize || 5,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    },
    tablet: {
      ...pagination,
      pageSize: pagination?.pageSize || 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    },
    desktop: pagination,
  });

  // 响应式表格大小
  const tableSize = useResponsiveValue({
    mobile: 'small',
    tablet: 'middle',
    desktop: 'middle',
  });

  // 操作列配置
  const actionColumn = actions ? {
    title: '操作',
    key: 'actions',
    width: isMobile ? 80 : 120,
    fixed: isMobile ? false : 'right',
    hideOnMobile: false,
    render: (_: any, record: T) => {
      const menuItems = [
        actions.view && {
          key: 'view',
          icon: <EyeOutlined />,
          label: '查看',
          onClick: () => actions.view?.(record),
        },
        actions.edit && {
          key: 'edit',
          icon: <EditOutlined />,
          label: '编辑',
          onClick: () => actions.edit?.(record),
        },
        actions.delete && {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: '删除',
          danger: true,
          onClick: () => actions.delete?.(record),
        },
        ...(actions.custom || []).map(action => ({
          key: action.key,
          icon: action.icon,
          label: action.label,
          onClick: () => action.onClick(record),
        })),
      ].filter(Boolean);

      if (isMobile) {
        // 移动端直接显示按钮
        return (
          <Space size="small">
            {menuItems.slice(0, 2).map((item: any) => (
              <Button
                key={item.key}
                type="text"
                size="small"
                icon={item.icon}
                danger={item.danger}
                onClick={item.onClick}
              />
            ))}
            {menuItems.length > 2 && (
              <Dropdown
                menu={{
                  items: menuItems.slice(2),
                  onClick: ({ key }) => {
                    const item = menuItems.find((item: any) => item.key === key);
                    item?.onClick();
                  },
                }}
                trigger={['click']}
              >
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        );
      }

      // 桌面端显示下拉菜单
      return (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => {
              const item = menuItems.find((item: any) => item.key === key);
              item?.onClick();
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      );
    },
  } : null;

  // 合并列配置
  const finalColumns = actionColumn 
    ? [...responsiveColumns, actionColumn]
    : responsiveColumns;

  // 移动端渲染
  if (isMobile) {
    return (
      <div className={`responsive-table-mobile ${className}`}>
        {(title || extra || onRefresh || onExport) && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {title && <Text strong>{title}</Text>}
            </div>
            <Space>
              {onRefresh && (
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  size="small"
                />
              )}
              {onExport && (
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={onExport}
                  size="small"
                >
                  导出
                </Button>
              )}
              {extra}
            </Space>
          </div>
        )}
        
        <div className="space-y-0">
          {mobileCards}
        </div>

        {pagination && (
          <div className="mt-4 text-center">
            <Text type="secondary" className="text-xs">
              {responsivePagination.showTotal?.(pagination.total || 0, [1, Math.min(pagination.pageSize || 10, pagination.total || 0)])}
            </Text>
          </div>
        )}
      </div>
    );
  }

  // 桌面端和平板端渲染表格
  return (
    <div className={`responsive-table ${className}`}>
      {(title || extra || onRefresh || onExport) && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {title && <Text strong>{title}</Text>}
          </div>
          <Space>
            {onRefresh && (
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              >
                刷新
              </Button>
            )}
            {onExport && (
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={onExport}
              >
                导出
              </Button>
            )}
            {extra}
          </Space>
        </div>
      )}

      <Table
        columns={finalColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={responsivePagination}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        size={tableSize}
        className="responsive-table-component"
      />
    </div>
  );
};

export default ResponsiveTable;