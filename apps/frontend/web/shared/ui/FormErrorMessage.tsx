import React from 'react';
import { cn } from '../lib/utils';

interface FormErrorMessageProps {
  error?: string;
  className?: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ error, className }) => {
  if (!error) return null;

  return (
    <p className={cn('mt-1 text-sm text-red-600', className)}>
      {error}
    </p>
  );
};

export { FormErrorMessage };