import * as React from 'react';
import { cn } from './cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-ink-200', className)}
      {...props}
    />
  );
}