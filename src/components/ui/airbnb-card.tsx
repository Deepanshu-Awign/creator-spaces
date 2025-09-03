import React from 'react';
import { cn } from '@/lib/utils';

interface AirbnbCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const AirbnbCard = React.forwardRef<HTMLDivElement, AirbnbCardProps>(
  ({ children, className, onClick, hover = true, shadow = 'md' }, ref) => {
    const shadowClasses = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-neutral-100 overflow-hidden',
          shadowClasses[shadow],
          hover && 'card-airbnb cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

AirbnbCard.displayName = 'AirbnbCard';

export { AirbnbCard }; 