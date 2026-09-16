import * as React from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-11 w-full rounded-full bg-white px-4 py-2 text-sm text-ink-900 placeholder:text-ink-500',
        'border border-ink-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        invalid && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-[100px] w-full rounded-2xl bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500',
        'border border-ink-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-ink-800 mb-1.5', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';