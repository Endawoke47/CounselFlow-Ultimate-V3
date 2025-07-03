import { RiskLikelihood, RiskMitigationStatus, RiskPriority, RiskReputationalImpact, RiskStatus, RiskTolerance } from './TRiskEnums';

export type TRiskResponse = {
  /**
   * Unique identifier for the risk
   */
  id: number;

  /**
   * ID of the matter this risk is associated with
   * @deprecated Use matter object instead
   */
  matterId?: number;

  /**
   * Object containing the associated matter's ID and name
   */
  matter?: { id: number; name: string; company?: { id: number; name: string } } | null;

  /**
   * Short title of the risk
   */
  name: string;

  /**
   * Category of risk
   */
  category: string;

  /**
   * Risk score on a scale from 0 to 10
   */
  score: number;

  /**
   * Detailed explanation of the risk
   */
  description: string;

  /**
   * Pre-control likelihood
   */
  inherentLikelihood: RiskLikelihood;

  /**
   * Minimum estimated financial impact
   */
  financialImpactMin?: number;

  /**
   * Maximum estimated financial impact
   */
  financialImpactMax?: number;

  /**
   * Currency of financial impact
   */
  currency?: string;

  /**
   * Overall priority
   */
  priority: RiskPriority;

  /**
   * Organization's stance
   */
  tolerance: RiskTolerance;

  /**
   * Steps to reduce or eliminate the risk
   */
  mitigationPlan?: string;

  /**
   * Status of mitigation efforts
   */
  mitigationStatus?: RiskMitigationStatus;

  /**
   * ID of the user responsible for managing the risk
   */
  ownerId?: number;

  /**
   * Code for the internal department overseeing the risk
   */
  internalDepartmentCode?: string;

  /**
   * Defines access permissions for related documents
   */
  documentAccess?: string;

  /**
   * URLs, file paths, or references to underlying documents
   */
  documentLinks?: string[];

  /**
   * Specific assessment of reputational impact
   */
  reputationalAssessment?: RiskReputationalImpact;

  /**
   * Date the risk was identified
   */
  identificationDate: string;

  /**
   * Next scheduled review date
   */
  reviewDate?: string;

  /**
   * Date the risk was resolved or accepted
   */
  resolutionDate?: string;

  /**
   * Indicates if the risk has regulatory impact
   */
  regulatoryImplications: boolean;

  /**
   * List of applicable regulations
   */
  relatedRegulations?: string[];

  /**
   * Current state of the risk
   */
  status: RiskStatus;

  /**
   * Additional information or comments
   */
  notes?: string;

  /**
   * ID of the user who created the risk
   */
  createdBy?: number;

  /**
   * The date and time the risk was created
   */
  createdAt: string;

  /**
   * The date and time the risk was last updated
   */
  updatedAt: string;

  /**
   * The date and time the risk was deleted (if applicable)
   */
  deletedAt: string | null;
}; 