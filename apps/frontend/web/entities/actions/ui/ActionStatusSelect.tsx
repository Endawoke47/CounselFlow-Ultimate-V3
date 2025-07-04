import { ActionStatus } from '@counselflow/types';
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

interface ActionStatusSelectProps {
  field: ControllerRenderProps<any, 'status'>;
  required?: boolean;
}

export const ActionStatusSelect: FC<ActionStatusSelectProps> = ({
  field,
  required,
}) => {
  return (
    <SelectGroup>
      <SelectLabel>
        Status {required && <span className="text-destructive">*</span>}
      </SelectLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ActionStatus).map((status) => (
            <SelectItem
              key={status as string}
              value={status as string}
            >
              {status as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
