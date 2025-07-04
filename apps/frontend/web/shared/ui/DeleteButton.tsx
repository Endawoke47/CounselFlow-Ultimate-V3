import React from 'react';
import { Button } from '@/components/ui/Button';

interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onDelete?: () => void;
  variant?: 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onDelete, 
  variant = 'danger',
  size = 'sm',
  children = 'Delete',
  onClick,
  ...props 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export { DeleteButton };