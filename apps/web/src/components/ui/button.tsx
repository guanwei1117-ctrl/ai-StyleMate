import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // 主行动：墨色实心（编辑风）
        default: 'bg-ink-900 text-creme-50 hover:bg-ink-700 shadow-sm hover:shadow-md',
        // 功能强调：雾霾蓝（链接/选中态以外的次主行动）
        accent: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-ink-200 bg-transparent text-ink-900 hover:border-ink-900 hover:bg-ink-900/5',
        secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-200',
        ghost: 'text-ink-600 hover:bg-ink-900/5 hover:text-ink-900',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
