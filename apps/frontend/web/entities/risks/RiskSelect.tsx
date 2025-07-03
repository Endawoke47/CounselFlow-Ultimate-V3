import { TRiskResponse } from '1pd-types';
import { FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { APP_ROUTES } from '@/entities/api/routes';
import InfiniteScrollList from '@/shared/ui/InfiniteScrollList';
import Label from '@/shared/ui/Label';


interface RiskSelectProps {
  field: ControllerRenderProps<any, 'riskId'>;
  label: string;
  placeholder: string;
  required?: boolean;
}

export const RiskSelect: FC<RiskSelectProps> = ({
  field,
  label,
  placeholder,
  required,
}) => {
  const handleRiskSelect = (risk: TRiskResponse) => {
    field.onChange(risk.id.toString());
  };

  return (
    <div>
      <Label htmlFor="risks" required={required} className="pb-2">
        {label}
      </Label>
      <InfiniteScrollList<TRiskResponse>
        url={APP_ROUTES.RISKS}
        queryKey={['risks']}
        placeholder={placeholder}
        renderItem={(risk) => risk.name}
        onSelectItem={handleRiskSelect}
      />
    </div>
  );
};
