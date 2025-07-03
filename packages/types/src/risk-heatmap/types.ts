import { RiskPriority } from '../risks';

export type RiskSeverityCounts = {
  low: number;
  moderate: number;
  high: number;
  critical: number;
  highestSeverity: RiskPriority;
};

export type HeatmapCell = {
  subsidiary: string;
  subsidiaryId: number;
  riskType: string;
  severityCounts: RiskSeverityCounts;
};

export type HeatmapResponse = {
  subsidiaries: Array<{ id: number; name: string }>;
  riskTypes: string[];
  heatmapData: HeatmapCell[];
}; 