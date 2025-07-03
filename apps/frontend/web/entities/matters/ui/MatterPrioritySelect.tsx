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

const matterPriorities = [
  {
    value: 'high',
    label: 'High',
  },
  {
    value: 'medium',
    label: 'Medium',
  },
  {
    value: 'low',
    label: 'Low',
  },
];

interface MatterPrioritySelectProps {
  field: ControllerRenderProps<any, 'priority'>;
  required?: boolean;
}

export const MatterPrioritySelect: FC<MatterPrioritySelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Priority {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select matter priority" />
        </SelectTrigger>
        <SelectContent>
          {matterPriorities?.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
