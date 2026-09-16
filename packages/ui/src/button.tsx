import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent-700 text-white hover:bg-accent-800 active:bg-accent-900',
        secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700',
        outline: 'border border-ink-300 bg-transparent text-ink-900 hover:bg-ink-50',
        ghost: 'bg-transparent text-ink-900 hover:bg-ink-100',
        link: 'bg-transparent text-accent-700 underline-offset-4 hover:underline px-0',
        danger: 'bg-red-700 text-white hover:bg-red-800',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, fullWidth, className }))} {...props} />
  )
);
Button.displayName = 'Button';

export { buttonVariants };