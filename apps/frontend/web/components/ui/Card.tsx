import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-slate-200 shadow-md hover:shadow-lg hover:transform hover:-translate-y-1',
        elevated: 'bg-white border-0 shadow-xl hover:shadow-2xl hover:transform hover:-translate-y-2',
        outlined: 'bg-white border-slate-300 shadow-sm hover:shadow-md hover:border-slate-400',
        ghost: 'bg-transparent border-0 shadow-none hover:bg-slate-50',
        gradient: 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg hover:shadow-xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 bg-slate-50 border-b border-slate-200 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body Component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 bg-slate-50 border-t border-slate-200 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={`text-lg font-semibold text-slate-900 ${className || ''}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-slate-600 ${className || ''}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// Stats Card Component (specialized for dashboard metrics)
export interface StatsCardProps extends CardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ReactNode;
  trend?: React.ReactNode;
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, icon, trend, className, ...props }, ref) => {
    const getChangeStyles = (type: 'positive' | 'negative' | 'neutral') => {
      switch (type) {
        case 'positive':
          return 'text-green-600 bg-green-100';
        case 'negative':
          return 'text-red-600 bg-red-100';
        default:
          return 'text-slate-600 bg-slate-100';
      }
    };

    return (
      <Card
        ref={ref}
        variant="gradient"
        className={`hover:transform hover:-translate-y-2 transition-all duration-300 ${className || ''}`}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {value}
            </p>
            {change && (
              <div className="flex items-center mt-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeStyles(
                    change.type
                  )}`}
                >
                  {change.type === 'positive' && '↗'}
                  {change.type === 'negative' && '↘'}
                  {change.value}
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                {icon}
              </div>
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            {trend}
          </div>
        )}
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  StatsCard,
  cardVariants,
};