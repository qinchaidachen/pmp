/**
 * 响应式断点配置
 * 基于Tailwind CSS断点标准
 */

export const BREAKPOINTS = {
  xs: 0,      // 超小屏幕（手机竖屏）
  sm: 640,    // 小屏幕（手机横屏）
  md: 768,    // 中等屏幕（平板竖屏）
  lg: 1024,   // 大屏幕（平板横屏/小桌面）
  xl: 1280,   // 超大屏幕（桌面）
  '2xl': 1536, // 超超大屏幕（大桌面）
} as const;

export const BREAKPOINT_NAMES = {
  MOBILE: 'mobile',      // < 768px
  TABLET: 'tablet',      // 768px - 1024px
  DESKTOP: 'desktop',    // > 1024px
} as const;

export type BreakpointName = typeof BREAKPOINT_NAMES[keyof typeof BREAKPOINT_NAMES];
export type BreakpointValue = typeof BREAKPOINTS[keyof typeof BREAKPOINTS];

/**
 * 获取当前断点名称
 */
export const getCurrentBreakpoint = (width: number): BreakpointName => {
  if (width < BREAKPOINTS.md) return BREAKPOINT_NAMES.MOBILE;
  if (width < BREAKPOINTS.lg) return BREAKPOINT_NAMES.TABLET;
  return BREAKPOINT_NAMES.DESKTOP;
};

/**
 * 检查是否在指定断点或更大
 */
export const isBreakpointUp = (breakpoint: keyof typeof BREAKPOINTS, width: number): boolean => {
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * 检查是否在指定断点或更小
 */
export const isBreakpointDown = (breakpoint: keyof typeof BREAKPOINTS, width: number): boolean => {
  return width <= BREAKPOINTS[breakpoint];
};

/**
 * 检查是否在指定断点范围内
 */
export const isBreakpointBetween = (
  min: keyof typeof BREAKPOINTS,
  max: keyof typeof BREAKPOINTS,
  width: number
): boolean => {
  return width >= BREAKPOINTS[min] && width <= BREAKPOINTS[max];
};