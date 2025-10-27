import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
  backdrop?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = '加载中...',
  className,
  backdrop = true,
  size = 'md',
  color = 'primary',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black bg-opacity-50',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size={size} color={color} text={text} />
      </div>
    </div>
  );
};

// 用于局部区域的加载覆盖层
export const LoadingSection: React.FC<LoadingOverlayProps & { minHeight?: string }> = ({
  isVisible,
  text = '加载中...',
  className,
  backdrop = false,
  size = 'md',
  color = 'primary',
  minHeight = '200px',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center',
        backdrop && 'bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80',
        className
      )}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <LoadingSpinner size={size} color={color} text={text} />
    </div>
  );
};

export default LoadingOverlay;