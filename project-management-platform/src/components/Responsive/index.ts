/**
 * 响应式设计组件库
 * 提供完整的响应式布局、表单、图表等组件
 */

// 断点和常量
export { 
  BREAKPOINTS, 
  BREAKPOINT_NAMES, 
  getCurrentBreakpoint,
  isBreakpointUp,
  isBreakpointDown,
  isBreakpointBetween,
  type BreakpointName,
  type BreakpointValue,
} from './breakpoints';

// Hooks
export { 
  useResponsive, 
  useResponsiveValue, 
  useMediaQuery 
} from './hooks/useResponsive';

export { 
  useTouchGestures, 
  useDrag 
} from './hooks/useTouchGestures';

// 组件
export { default as ResponsiveLayout } from './ResponsiveLayout';
export { default as ResponsiveSidebar } from './ResponsiveSidebar';
export { default as ResponsiveTable } from './ResponsiveTable';
export { default as ResponsiveChart } from './ResponsiveChart';

// 示例组件
export { default as ResponsiveExample } from './ResponsiveExample';
export { default as ResponsiveTest } from './ResponsiveTest';

// 类型定义
export interface ResponsiveTableColumn<T = any> extends import('antd/es/table').ColumnsType<T> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  renderMobile?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface ResponsiveTableProps<T = any> {
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

export interface ResponsiveChartProps {
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

export interface ResponsiveLayoutProps {
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

export interface TouchOptions {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

// 便捷工具函数
export const createResponsiveValue = <T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  }
) => values;

// 断点检查工具
export const breakpoints = {
  up: (breakpoint: keyof typeof BREAKPOINTS) => 
    `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`,
  down: (breakpoint: keyof typeof BREAKPOINTS) => 
    `@media (max-width: ${BREAKPOINTS[breakpoint] - 1}px)`,
  between: (min: keyof typeof BREAKPOINTS, max: keyof typeof BREAKPOINTS) => 
    `@media (min-width: ${BREAKPOINTS[min]}px) and (max-width: ${BREAKPOINTS[max] - 1}px)`,
};