import React from 'react';
import { cn } from '@/shared/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ className, label, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-2',
          className
        )}
        {...props}
      />
      {label && (
        <label className="ml-2 text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};