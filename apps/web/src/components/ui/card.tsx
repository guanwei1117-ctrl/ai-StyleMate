import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-2xl bg-white transition-all duration-300', {
  variants: {
    elevation: {
      flat: 'border border-ink-100',
      raised: 'shadow-card',
    },
    interactive: {
      false: '',
      true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift',
    },
  },
  defaultVariants: {
    elevation: 'raised',
    interactive: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ elevation, interactive }), className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card, cardVariants };
