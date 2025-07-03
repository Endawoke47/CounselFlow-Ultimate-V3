import { CompanyAccountType } from '1pd-types';
import { FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';


interface CompanyTypeSelectProps {
  field: ControllerRenderProps<any, 'type'>;
  required?: boolean;
}

export const CompanyTypeSelect: FC<CompanyTypeSelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>
        Type {required && <span className="text-destructive">*</span>}
      </SelectLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(CompanyAccountType).map((type) => (
            <SelectItem key={type as string} value={type as string}>
              {type as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
