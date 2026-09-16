import * as React from 'react';
import { cn } from './cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'col', gap = 4, align, justify, wrap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gap === 0 && 'gap-0',
        gap === 1 && 'gap-1',
        gap === 2 && 'gap-2',
        gap === 3 && 'gap-3',
        gap === 4 && 'gap-4',
        gap === 6 && 'gap-6',
        gap === 8 && 'gap-8',
        gap === 12 && 'gap-12',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    />
  )
);
Stack.displayName = 'Stack';