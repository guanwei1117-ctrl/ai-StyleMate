import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        // 默认：白底描边胶囊（分类标签常态）
        default: 'border border-ink-200 bg-white px-3 py-1.5 text-ink-600',
        // 选中：墨色填充
        active: 'border border-ink-900 bg-ink-900 px-3 py-1.5 text-creme-50',
        // 功能强调：雾霾蓝浅底
        accent: 'border border-primary-100 bg-primary-50 px-3 py-1.5 text-primary-700',
        // 卡片角标：墨色半透明（固定用于卡片左上角）
        badge: 'bg-ink-900/70 px-2.5 py-1 text-[11px] tracking-wide text-white backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  asChild?: false;
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(tagVariants({ variant }), className)} {...props} />
  ),
);
Tag.displayName = 'Tag';

export { Tag, tagVariants };
