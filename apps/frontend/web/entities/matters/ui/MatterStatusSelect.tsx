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

const matterStatuses = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'closed',
    label: 'Closed',
  },
  {
    value: 'onHold',
    label: 'On Hold',
  },
  {
    value: 'escalated',
    label: 'Escalated',
  },
];

interface MatterStatusSelectProps {
  field: ControllerRenderProps<any, 'status'>;
  required?: boolean;
}

export const MatterStatusSelect: FC<MatterStatusSelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Status {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select matter status" />
        </SelectTrigger>
        <SelectContent>
          {matterStatuses?.map((matterStatus) => (
            <SelectItem key={matterStatus.value} value={matterStatus.value}>
              {matterStatus.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
