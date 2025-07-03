import {
  RiskLikelihood,
  RiskMitigationStatus,
  RiskPriority,
  RiskReputationalImpact,
  RiskStatus,
  RiskTolerance,
  TCreateRiskRequest,
  TUpdateRiskRequest,
} from '1pd-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import MatterSelect from '@/entities/matters/ui/MatterSelect';
import { useFetchRisk } from '@/entities/risks/hooks';
import { RiskFormValues, riskValidationSchema } from '@/entities/risks/model';
import { Button } from '@/shared/ui';

interface RiskFormProps {
  riskId?: number;
  onSubmit: (data: TCreateRiskRequest | TUpdateRiskRequest) => void;
  isSubmitting: boolean;
  errors?: string[];
}

const RiskForm = ({
  riskId,
  onSubmit,
  isSubmitting,
  errors = [],
}: RiskFormProps) => {
  // Fetch risk data if editing
  const { data: existingRisk } = useFetchRisk(riskId || 0);

  // Setup form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors: formErrors },
  } = useForm<RiskFormValues>({
    resolver: zodResolver(riskValidationSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      inherentLikelihood: RiskLikelihood.POSSIBLE,
      priority: RiskPriority.MEDIUM,
      tolerance: RiskTolerance.MITIGATE,
      identificationDate: new Date().toISOString().split('T')[0],
      regulatoryImplications: false,
      status: RiskStatus.IDENTIFIED,
      mitigationStatus: RiskMitigationStatus.NOT_STARTED,
      matterId: null,
      reputationalAssessment: RiskReputationalImpact.MEDIUM,
    },
  });

  // Update form with existing data when available
  useEffect(() => {
    if (existingRisk) {
      reset({
        name: existingRisk.name,
        category: existingRisk.category,
        description: existingRisk.description,
        inherentLikelihood: existingRisk.inherentLikelihood as RiskLikelihood,
        financialImpactMin: existingRisk.financialImpactMin || null,
        financialImpactMax: existingRisk.financialImpactMax || null,
        currency: existingRisk.currency || '',
        priority: existingRisk.priority as RiskPriority,
        tolerance: existingRisk.tolerance as RiskTolerance,
        mitigationPlan: existingRisk.mitigationPlan || '',
        mitigationStatus: existingRisk.mitigationStatus as RiskMitigationStatus,
        ownerId: existingRisk.ownerId || null,
        internalDepartmentCode: existingRisk.internalDepartmentCode || '',
        documentAccess: existingRisk.documentAccess || '',
        documentLinks: existingRisk.documentLinks || [],
        reputationalAssessment:
          (existingRisk.reputationalAssessment as RiskReputationalImpact) ||
          RiskReputationalImpact.MEDIUM,
        identificationDate: existingRisk.identificationDate,
        reviewDate: existingRisk.reviewDate || '',
        resolutionDate: existingRisk.resolutionDate || '',
        regulatoryImplications: existingRisk.regulatoryImplications,
        relatedRegulations: existingRisk.relatedRegulations || [],
        status: existingRisk.status as RiskStatus,
        notes: existingRisk.notes || '',
        matterId: existingRisk.matterId ?? null,
        score: existingRisk.score,
      });
    }
  }, [existingRisk, reset]);

  // Handle form submission
  const onFormSubmit = (data: RiskFormValues) => {
    onSubmit(data as TCreateRiskRequest);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* Display any general errors that don't match specific fields */}
      {errors.length > 0 && (
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-600 font-medium">
            Please fix the following errors:
          </p>
          <ul className="list-disc pl-5 mt-2">
            {errors.map((error, index) => (
              <li key={index} className="text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Risk Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-3 py-2 border ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.name.message}
            </p>
          )}
        </div>

        <div>
          <Controller
            name="matterId"
            control={control}
            render={({ field }) => (
              <MatterSelect
                field={field}
                label="Matter"
                placeholder="Select matter"
                required={false}
              />
            )}
          />
          {formErrors.matterId && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.matterId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('category')}
            className={`w-full px-3 py-2 border ${
              formErrors.category ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Score (0-10) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            {...register('score', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border ${
              formErrors.score ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.score && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.score.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Likelihood <span className="text-red-500">*</span>
          </label>
          <select
            {...register('inherentLikelihood')}
            className={`w-full px-3 py-2 border ${
              formErrors.inherentLikelihood
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md`}
          >
            {Object.values(RiskLikelihood).map((likelihood) => (
              <option key={likelihood} value={likelihood}>
                {likelihood}
              </option>
            ))}
          </select>
          {formErrors.inherentLikelihood && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.inherentLikelihood.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className={`w-full px-3 py-2 border ${
              formErrors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Financial Impact Min
          </label>
          <input
            type="text"
            {...register('financialImpactMin', {
              setValueAs: (value) => {
                if (value === '' || value == null) return null;
                try {
                  // Only replace commas with dots, do not touch dots
                  const normalizedValue = String(value).replace(/,/g, '.');
                  const parsedValue = parseFloat(normalizedValue);
                  if (isNaN(parsedValue)) {
                    return null;
                  }
                  return parsedValue;
                } catch (error) {
                  console.error('Error parsing financialImpactMin:', error);
                  return null;
                }
              },
            })}
            className={`w-full px-3 py-2 border ${
              formErrors.financialImpactMin
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.financialImpactMin && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.financialImpactMin.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Financial Impact Max
          </label>
          <input
            type="text"
            {...register('financialImpactMax', {
              setValueAs: (value) => {
                if (value === '' || value == null) return null;
                try {
                  // Only replace commas with dots, do not touch dots
                  const normalizedValue = String(value).replace(/,/g, '.');
                  const parsedValue = parseFloat(normalizedValue);
                  if (isNaN(parsedValue)) {
                    return null;
                  }
                  return parsedValue;
                } catch (error) {
                  console.error('Error parsing financialImpactMax:', error);
                  return null;
                }
              },
            })}
            className={`w-full px-3 py-2 border ${
              formErrors.financialImpactMax
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.financialImpactMax && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.financialImpactMax.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <input
            type="text"
            {...register('currency')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            {...register('priority')}
            className={`w-full px-3 py-2 border ${
              formErrors.priority ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          >
            {Object.values(RiskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {formErrors.priority && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.priority.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tolerance <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tolerance')}
            className={`w-full px-3 py-2 border ${
              formErrors.tolerance ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          >
            {Object.values(RiskTolerance).map((tolerance) => (
              <option key={tolerance} value={tolerance}>
                {tolerance}
              </option>
            ))}
          </select>
          {formErrors.tolerance && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.tolerance.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mitigation Plan
          </label>
          <textarea
            {...register('mitigationPlan')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mitigation Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('mitigationStatus')}
            className={`w-full px-3 py-2 border ${
              formErrors.mitigationStatus ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          >
            {Object.values(RiskMitigationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {formErrors.mitigationStatus && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.mitigationStatus.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Identification Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('identificationDate')}
            className={`w-full px-3 py-2 border ${
              formErrors.identificationDate
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.identificationDate && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.identificationDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Review Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('reviewDate')}
            className={`w-full px-3 py-2 border ${
              formErrors.reviewDate ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.reviewDate && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.reviewDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Resolution Date
          </label>
          <input
            type="date"
            {...register('resolutionDate')}
            className={`w-full px-3 py-2 border ${
              formErrors.resolutionDate ? 'border-red-500' : 'border-gray-300'
            } rounded-md`}
          />
          {formErrors.resolutionDate && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.resolutionDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Regulatory Implications
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('regulatoryImplications')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Reputational Assessment <span className="text-red-500">*</span>
          </label>
          <select
            {...register('reputationalAssessment')}
            className={`w-full px-3 py-2 border ${
              formErrors.reputationalAssessment
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md`}
          >
            {Object.values(RiskReputationalImpact).map((impact) => (
              <option key={impact} value={impact}>
                {impact}
              </option>
            ))}
          </select>
          {formErrors.reputationalAssessment && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.reputationalAssessment.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Risk'}
        </Button>
      </div>
    </form>
  );
};

export default RiskForm;
