import {
  RiskLikelihood,
  RiskMitigationStatus,
  RiskPriority,
  RiskReputationalImpact,
  RiskStatus,
  RiskTolerance,
} from '@counselflow/types';
import { z } from 'zod';

// Convert enum to array of values for Zod enum validation
const likelihoodValues = Object.values(RiskLikelihood);
const mitigationStatusValues = Object.values(RiskMitigationStatus);
const priorityValues = Object.values(RiskPriority);
const toleranceValues = Object.values(RiskTolerance);
const reputationalImpactValues = Object.values(RiskReputationalImpact);
const statusValues = Object.values(RiskStatus);

// Base risk schema
export const riskSchema = {
  base: z.object({
    matterId: z.union([
      z.number(),
      z.string().transform((val) => {
        // Handle empty strings
        if (val === '') return null;
        // Parse string to number
        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
      z.null(),
    ]),
    score: z.number().min(0, 'Score must be 0 or greater').max(10, 'Score must be 10 or less'),
    matterType: z.string().optional(),
    name: z.string().min(3, 'Risk name must be at least 3 characters').max(255, 'Risk name cannot exceed 255 characters'),
    category: z.string().min(1, 'Category is required').max(100, 'Category cannot exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    inherentLikelihood: z.enum(likelihoodValues as [string, ...string[]]),
    financialImpactMin: z.union([
      z.number(),
      z.string().transform((value) => {
        if (value === '') return null;
        // Replace commas with dots
        const normalizedValue = value.replace(/,/g, '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? null : parsed;
      }),
      z.null(),
    ]).optional().nullable(),
    financialImpactMax: z.union([
      z.number(),
      z.string().transform((value) => {
        if (value === '') return null;
        // Replace commas with dots
        const normalizedValue = value.replace(/,/g, '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? null : parsed;
      }),
      z.null(),
    ]).optional().nullable(),
    currency: z.string().optional(),
    priority: z.enum(priorityValues as [string, ...string[]]),
    tolerance: z.enum(toleranceValues as [string, ...string[]]),
    mitigationPlan: z.string().optional(),
    mitigationStatus: z.enum(mitigationStatusValues as [string, ...string[]]),
    ownerId: z.union([
      z.number(),
      z.null(),
      z.nan().transform(() => null),
      z.literal('').transform(() => null),
    ]).optional().nullable(),
    internalDepartmentCode: z.string().optional(),
    documentAccess: z.string().optional(),
    documentLinks: z.array(z.string()).optional(),
    reputationalAssessment: z.enum(reputationalImpactValues as [string, ...string[]]),
    identificationDate: z.string().min(1, 'Identification date is required'),
    reviewDate: z.string().min(1, 'Review date is required'),
    resolutionDate: z.union([
      z.null(),
      z.string().transform((val) => val.trim() === '' ? null : val),
    ]).optional(),
    regulatoryImplications: z.boolean(),
    relatedRegulations: z.array(z.string()).optional(),
    status: z.enum(statusValues as [string, ...string[]]),
    notes: z.string().optional(),
  }),

  // Refinements for additional validations
  withRefinements: function() {
    return this.base.refine(
      (data) => {
        // If both financial impacts are provided, ensure max is greater than or equal to min
        if (data.financialImpactMin != null && 
            data.financialImpactMax != null && 
            typeof data.financialImpactMin === 'number' && 
            typeof data.financialImpactMax === 'number') {
          return data.financialImpactMax >= data.financialImpactMin;
        }
        return true;
      },
      {
        message: 'Maximum financial impact must be greater than or equal to minimum financial impact',
        path: ['financialImpactMax'],
      }
    )
    .refine(
      (data) => {
        // If a review date is provided, ensure it's not before identification date
        if (data.reviewDate && data.identificationDate && 
            data.reviewDate.trim() !== '' && data.identificationDate.trim() !== '') {
          return new Date(data.reviewDate) >= new Date(data.identificationDate);
        }
        return true;
      },
      {
        message: 'Review date cannot be before identification date',
        path: ['reviewDate'],
      }
    )
    .refine(
      (data) => {
        // If a resolution date is provided, ensure it's not before identification date
        if (data.resolutionDate && data.identificationDate && 
            data.resolutionDate.trim() !== '' && data.identificationDate.trim() !== '') {
          return new Date(data.resolutionDate) >= new Date(data.identificationDate);
        }
        return true;
      },
      {
        message: 'Resolution date cannot be before identification date',
        path: ['resolutionDate'],
      }
    );
  }
};

// Export the schema with refinements for convenience
export const riskValidationSchema = riskSchema.withRefinements();

// Use this type for form values
export type RiskFormValues = z.infer<typeof riskValidationSchema>; 