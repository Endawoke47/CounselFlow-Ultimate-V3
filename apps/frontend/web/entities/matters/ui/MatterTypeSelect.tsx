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

const matterTypes = [
  {
    value: 'contract',
    label: 'Contract',
  },
  {
    value: 'disputeResolution',
    label: 'Dispute Resolution',
  },
  {
    value: 'regulatory',
    label: 'Regulatory',
  },
  {
    value: 'ip',
    label: 'IP',
  },
];

interface MatterTypeSelectProps {
  field: ControllerRenderProps<any, 'type'>;
  required?: boolean;
}

export const MatterTypeSelect: FC<MatterTypeSelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>
        Type {required && <span className="text-destructive">*</span>}
      </SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select matter type" />
        </SelectTrigger>
        <SelectContent>
          {matterTypes?.map((matterType) => (
            <SelectItem key={matterType.value} value={matterType.value}>
              {matterType.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
