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

const contractPriorities = [
  {
    value: 'Critical',
    label: 'Critical',
  },
  {
    value: 'High',
    label: 'High',
  },
  {
    value: 'Medium',
    label: 'Medium',
  },
  {
    value: 'Low',
    label: 'Low',
  },
];

interface ContractPrioritySelectProps {
  field: ControllerRenderProps<any, 'priority'>;
  required?: boolean;
}

export const ContractPrioritySelect: FC<ContractPrioritySelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Priority {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select contract priority" />
        </SelectTrigger>
        <SelectContent>
          {contractPriorities?.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
