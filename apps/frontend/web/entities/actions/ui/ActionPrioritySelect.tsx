import { ActionPriority } from '1pd-types';
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


interface ActionPrioritySelectProps {
  field: ControllerRenderProps<any, 'priority'>;
  required?: boolean;
}

export const ActionPrioritySelect: FC<ActionPrioritySelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Priority {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ActionPriority).map((priority) => (
            <SelectItem
              key={priority as string}
              value={priority as string}
            >
              {priority as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
