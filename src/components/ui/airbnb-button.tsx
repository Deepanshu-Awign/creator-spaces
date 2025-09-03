import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface AirbnbButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const AirbnbButton = React.forwardRef<HTMLButtonElement, AirbnbButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className, 
    onClick, 
    disabled = false,
    loading = false,
    fullWidth = false
  }, ref) => {
    const variantClasses = {
      primary: 'bg-airbnb-primary hover:bg-airbnb-accent text-white border-airbnb-primary',
      secondary: 'bg-airbnb-secondary hover:bg-airbnb-secondary/90 text-white border-airbnb-secondary',
      outline: 'bg-transparent hover:bg-airbnb-primary hover:text-white text-airbnb-primary border-airbnb-primary',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 border-transparent'
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'btn-airbnb font-semibold rounded-xl transition-all duration-200',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'opacity-75 cursor-wait',
          className
        )}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AirbnbButton.displayName = 'AirbnbButton';

export { AirbnbButton }; 