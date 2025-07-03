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

const contractTypes = [
  {
    value: 'Sales',
    label: 'Sales',
  },
  {
    value: 'Procurement',
    label: 'Procurement',
  },
  {
    value: 'Employment',
    label: 'Employment',
  },
  {
    value: 'Real Estate',
    label: 'Real Estate',
  },
  {
    value: 'Intellectual Property',
    label: 'Intellectual Property',
  },
  {
    value: 'Financial',
    label: 'Financial',
  },
  {
    value: 'Partnership',
    label: 'Partnership',
  },
  {
    value: 'Confidentiality',
    label: 'Confidentiality',
  },
  {
    value: 'Compliance',
    label: 'Compliance',
  },
  {
    value: 'Other',
    label: 'Other',
  },
];

interface ContractTypeSelectProps {
  field: ControllerRenderProps<any, 'type'>;
  required?: boolean;
}

export const ContractTypeSelect: FC<ContractTypeSelectProps> = ({ field, required }) => {
  return (
    <SelectGroup>
      <SelectLabel>Type {required && <span className="text-destructive">*</span>}</SelectLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select contract type" />
        </SelectTrigger>
        <SelectContent>
          {contractTypes?.map((contractType) => (
            <SelectItem key={contractType.value} value={contractType.value}>
              {contractType.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};
