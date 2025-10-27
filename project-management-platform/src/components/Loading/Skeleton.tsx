import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  const styles = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 && lines > 1 ? 'w-3/4' : '',
              className
            )}
            style={styles}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={styles}
    />
  );
};

// 预定义的骨架屏组件
export const SkeletonCard: React.FC = () => (
  <div className="p-6 border border-gray-200 rounded-lg space-y-4">
    <Skeleton width="60%" height="1.5rem" />
    <Skeleton lines={3} />
    <div className="flex gap-2">
      <Skeleton width="80px" height="2rem" />
      <Skeleton width="80px" height="2rem" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-3">
    {/* 表头 */}
    <div className="flex gap-2">
      {Array.from({ length: cols }).map((_, index) => (
        <Skeleton key={`header-${index}`} height="2rem" />
      ))}
    </div>
    {/* 表行 */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-2">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="1.5rem" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" />
          <Skeleton width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="space-y-4">
    <Skeleton width="40%" height="2rem" />
    <div className="flex items-end gap-2 h-48">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton
          key={index}
          width="40px"
          height={Math.random() * 200 + 50}
        />
      ))}
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton width="30%" height="1.5rem" />
        <SkeletonList items={5} />
      </div>
      <div className="space-y-4">
        <Skeleton width="30%" height="1.5rem" />
        <SkeletonChart />
      </div>
    </div>
  </div>
);

export default Skeleton;