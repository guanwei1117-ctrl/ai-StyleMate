import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * 统一表单输入框：hover 边框加深 / focus 雾霾蓝描边 + 浅底光晕
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-900',
        'placeholder:text-ink-300',
        'transition-all duration-200',
        'hover:border-ink-300',
        'focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
