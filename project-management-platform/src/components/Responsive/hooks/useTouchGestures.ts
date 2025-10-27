import { useEffect, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeOptions {
  threshold?: number; // 滑动阈值，默认50px
  preventDefaultTouchmoveEvent?: boolean; // 是否阻止默认触摸事件
}

/**
 * 触摸手势Hook
 * 支持滑动、长按等手势操作
 */
export const useTouchGestures = (options: TouchOptions = {}) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
  } = options;

  const [isTouching, setIsTouching] = useState(false);
  const [startPosition, setStartPosition] = useState<TouchPosition | null>(null);
  const [currentPosition, setCurrentPosition] = useState<TouchPosition | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isLongPress, setIsLongPress] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLElement | null>(null);

  // 重置状态
  const resetState = () => {
    setIsTouching(false);
    setStartPosition(null);
    setCurrentPosition(null);
    setSwipeDirection(null);
    setSwipeDistance(0);
    setIsLongPress(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // 计算滑动距离
  const calculateDistance = (start: TouchPosition, end: TouchPosition) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  // 计算滑动方向
  const calculateDirection = (start: TouchPosition, end: TouchPosition) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  // 触摸开始
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const position = { x: touch.clientX, y: touch.clientY };
    
    setIsTouching(true);
    setStartPosition(position);
    setCurrentPosition(position);
    
    // 设置长按定时器
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, 500); // 500ms长按

    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  };

  // 触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (!isTouching || !startPosition) return;

    const touch = e.touches[0];
    const position = { x: touch.clientX, y: touch.clientY };
    
    setCurrentPosition(position);
    
    // 取消长按
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  };

  // 触摸结束
  const handleTouchEnd = (e: TouchEvent) => {
    if (!isTouching || !startPosition || !currentPosition) {
      resetState();
      return;
    }

    const distance = calculateDistance(startPosition, currentPosition);
    
    if (distance >= threshold) {
      const direction = calculateDirection(startPosition, currentPosition);
      setSwipeDirection(direction);
      setSwipeDistance(distance);
    }

    resetState();

    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  };

  // 触摸取消
  const handleTouchCancel = () => {
    resetState();
  };

  // 绑定事件监听器
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      resetState();
    };
  }, [isTouching, startPosition, currentPosition, threshold, preventDefaultTouchmoveEvent]);

  return {
    elementRef,
    isTouching,
    startPosition,
    currentPosition,
    swipeDirection,
    swipeDistance,
    isLongPress,
    // 便捷方法
    isSwipeUp: swipeDirection === 'up',
    isSwipeDown: swipeDirection === 'down',
    isSwipeLeft: swipeDirection === 'left',
    isSwipeRight: swipeDirection === 'right',
    // 重置方法
    reset: resetState,
  };
};

/**
 * 拖拽Hook
 */
export const useDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return {
    elementRef,
    isDragging,
    position,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? 'grabbing' : 'grab',
    },
    eventHandlers: {
      onMouseDown: handleMouseDown,
    },
  };
};

/**
 * 触摸选项接口
 */
interface TouchOptions {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}