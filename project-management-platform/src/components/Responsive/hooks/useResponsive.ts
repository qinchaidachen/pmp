import { useState, useEffect } from 'react';
import { BREAKPOINTS, BREAKPOINT_NAMES, getCurrentBreakpoint, BreakpointName } from './breakpoints';

/**
 * 响应式设计Hook
 * 用于检测当前屏幕尺寸和断点
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointName>(
    typeof window !== 'undefined' 
      ? getCurrentBreakpoint(window.innerWidth)
      : BREAKPOINT_NAMES.DESKTOP
  );

  useEffect(() => {
    // 处理窗口大小变化
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setCurrentBreakpoint(getCurrentBreakpoint(width));
    };

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 初始设置
    handleResize();

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 便捷的断点检查方法
  const isMobile = currentBreakpoint === BREAKPOINT_NAMES.MOBILE;
  const isTablet = currentBreakpoint === BREAKPOINT_NAMES.TABLET;
  const isDesktop = currentBreakpoint === BREAKPOINT_NAMES.DESKTOP;

  // 精确断点检查
  const isXs = windowSize.width >= BREAKPOINTS.xs && windowSize.width < BREAKPOINTS.sm;
  const isSm = windowSize.width >= BREAKPOINTS.sm && windowSize.width < BREAKPOINTS.md;
  const isMd = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg;
  const isLg = windowSize.width >= BREAKPOINTS.lg && windowSize.width < BREAKPOINTS.xl;
  const isXl = windowSize.width >= BREAKPOINTS.xl && windowSize.width < BREAKPOINTS['2xl'];
  const is2Xl = windowSize.width >= BREAKPOINTS['2xl'];

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    // 精确断点
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    // 断点检查方法
    isBreakpointUp: (breakpoint: keyof typeof BREAKPOINTS) => 
      windowSize.width >= BREAKPOINTS[breakpoint],
    isBreakpointDown: (breakpoint: keyof typeof BREAKPOINTS) => 
      windowSize.width <= BREAKPOINTS[breakpoint],
    isBreakpointBetween: (min: keyof typeof BREAKPOINTS, max: keyof typeof BREAKPOINTS) =>
      windowSize.width >= BREAKPOINTS[min] && windowSize.width <= BREAKPOINTS[max],
  };
};

/**
 * 响应式值Hook
 * 根据屏幕尺寸返回不同的值
 */
export const useResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) => {
  const { currentBreakpoint, windowSize } = useResponsive();

  // 优先使用精确断点
  if (windowSize.width >= BREAKPOINTS['2xl'] && values['2xl'] !== undefined) {
    return values['2xl'];
  }
  if (windowSize.width >= BREAKPOINTS.xl && values.xl !== undefined) {
    return values.xl;
  }
  if (windowSize.width >= BREAKPOINTS.lg && values.lg !== undefined) {
    return values.lg;
  }
  if (windowSize.width >= BREAKPOINTS.md && values.md !== undefined) {
    return values.md;
  }
  if (windowSize.width >= BREAKPOINTS.sm && values.sm !== undefined) {
    return values.sm;
  }
  if (windowSize.width >= BREAKPOINTS.xs && values.xs !== undefined) {
    return values.xs;
  }

  // 使用通用断点
  if (currentBreakpoint === BREAKPOINT_NAMES.DESKTOP && values.desktop !== undefined) {
    return values.desktop;
  }
  if (currentBreakpoint === BREAKPOINT_NAMES.TABLET && values.tablet !== undefined) {
    return values.tablet;
  }
  if (currentBreakpoint === BREAKPOINT_NAMES.MOBILE && values.mobile !== undefined) {
    return values.mobile;
  }

  // 返回第一个非undefined值
  return values.mobile ?? values.tablet ?? values.desktop ?? values.lg ?? values.md ?? values.sm ?? values.xs;
};

/**
 * 媒体查询Hook
 * 用于自定义媒体查询
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // 设置初始状态
    setMatches(mediaQuery.matches);

    // 监听变化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};