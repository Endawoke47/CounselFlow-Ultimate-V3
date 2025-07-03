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

const contractStatuses = [
  {
    value: 'Draft',
    label: 'Draft',
  },
  {
    value: 'Under Review',
    label: 'Under Review',
  },
  {
    value: 'In Negotiation',
    label: 'In Negotiation',
  },
  {
    value: 'Executed',
    label: 'Executed',
  },
  {
    value: 'Active',
    label: 'Active',
  },
  {
    value: 'Expired',
    label: 'Expired',
  },
  {
    value: 'Terminated',
    label: 'Terminated',
  },
];

interface ContractStatusSelectProps {
  field: ControllerRenderProps<any, 'status'>;
  required?: boolean;
}

export const ContractStatusSelect: FC<ContractStatusSelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Status {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select contract status" />
        </SelectTrigger>
        <SelectContent>
          {contractStatuses?.map((contractStatus) => (
            <SelectItem key={contractStatus.value} value={contractStatus.value}>
              {contractStatus.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
