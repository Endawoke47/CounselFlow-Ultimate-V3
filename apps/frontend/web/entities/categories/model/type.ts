import { ControllerRenderProps } from 'react-hook-form';

export type CategoryMultiSelectProps<TFormValues extends Record<any, any>> =
  {
    field: ControllerRenderProps<TFormValues, any>;
    required?: boolean;
    className?: string;
  };

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}
