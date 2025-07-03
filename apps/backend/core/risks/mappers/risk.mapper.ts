import {
  RiskLikelihood,
  RiskMitigationStatus,
  RiskPriority,
  RiskReputationalImpact,
  RiskStatus,
  RiskTolerance,
  TRiskResponse,
} from '1pd-types';
import { Risk } from '../entities/risk.entity';

/**
 * Safely converts a value to ISO string format with fallback to current date
 * @param date Date object, string, or null/undefined
 * @returns ISO string representation of the date
 */
function safeToISOStringRequired(date: any): string {
  if (!date) {
    return new Date().toISOString();
  }

  // If it's already a string that looks like an ISO date, return it
  if (typeof date === 'string') {
    // Basic validation for ISO date string format
    if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(date)) {
      return date;
    }
    // Try to parse the string into a date
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // If it's a Date object
  if (date instanceof Date) {
    return date.toISOString();
  }

  // For invalid dates, use current date
  return new Date().toISOString();
}

/**
 * Safely converts a value to ISO string format or undefined
 * @param date Date object, string, or null/undefined
 * @returns ISO string representation of the date or undefined
 */
function safeToISOStringOptional(date: any): string | undefined {
  if (!date) {
    return undefined;
  }

  // If it's already a string that looks like an ISO date, return it
  if (typeof date === 'string') {
    // Basic validation for ISO date string format
    if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(date)) {
      return date;
    }
    // Try to parse the string into a date
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // If it's a Date object
  if (date instanceof Date) {
    return date.toISOString();
  }

  // For invalid dates, return undefined
  return undefined;
}

/**
 * Safely converts a value to ISO string format or null
 * @param date Date object, string, or null/undefined
 * @returns ISO string representation of the date or null
 */
function safeToISOStringNullable(date: any): string | null {
  if (!date) {
    return null;
  }

  // If it's already a string that looks like an ISO date, return it
  if (typeof date === 'string') {
    // Basic validation for ISO date string format
    if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(date)) {
      return date;
    }
    // Try to parse the string into a date
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // If it's a Date object
  if (date instanceof Date) {
    return date.toISOString();
  }

  // For invalid dates, return null
  return null;
}

/**
 * Maps a Risk entity to a TRiskResponse
 * Handles the conversion of data types (like Dates to strings)
 * @param risk The Risk entity to map
 * @returns A properly formatted TRiskResponse
 */
export function mapRiskToResponse(risk: Risk): TRiskResponse {
  if (!risk) {
    throw new Error('Cannot map null risk to response');
  }

  // Handle dates with safe conversion
  const identificationDate = safeToISOStringRequired(risk.identificationDate);
  const createdAt = safeToISOStringRequired(risk.createdAt);
  const updatedAt = safeToISOStringRequired(risk.updatedAt);
  const reviewDate = safeToISOStringOptional(risk.reviewDate);
  const resolutionDate = safeToISOStringOptional(risk.resolutionDate);
  const deletedAt = safeToISOStringNullable(risk.deletedAt);

  return {
    id: risk.id,
    matterId: risk.matter?.id,
    matter: risk.matter
      ? {
          id: risk.matter.id,
          name: risk.matter.name,
          // Include company if it exists on the loaded matter relation
          company: risk.matter.company
            ? { id: risk.matter.company.id, name: risk.matter.company.name }
            : undefined,
        }
      : null,
    name: risk.name,
    category: risk.category,
    score: risk.score,
    description: risk.description,
    inherentLikelihood: risk.inherentLikelihood as RiskLikelihood,
    financialImpactMin: risk.financialImpactMin,
    financialImpactMax: risk.financialImpactMax,
    currency: risk.currency,
    priority: risk.priority as RiskPriority,
    tolerance: risk.tolerance as RiskTolerance,
    mitigationPlan: risk.mitigationPlan,
    mitigationStatus: risk.mitigationStatus as RiskMitigationStatus,
    ownerId: risk.owner?.id,
    internalDepartmentCode: risk.internalDepartmentCode,
    documentAccess: risk.documentAccess,
    documentLinks: risk.documentLinks,
    reputationalAssessment:
      risk.reputationalAssessment as RiskReputationalImpact,
    identificationDate,
    reviewDate,
    resolutionDate,
    regulatoryImplications: risk.regulatoryImplications,
    relatedRegulations: risk.relatedRegulations,
    status: risk.status as RiskStatus,
    notes: risk.notes,
    createdBy: risk.createdBy?.id,
    createdAt,
    updatedAt,
    deletedAt,
  };
}

/**
 * Maps an array of Risk entities to TRiskResponse objects
 * @param risks Array of Risk entities
 * @returns Array of TRiskResponse objects
 */
export function mapRisksToResponses(risks: Risk[]): TRiskResponse[] {
  if (!risks) {
    return [];
  }
  return risks.map(mapRiskToResponse);
}
