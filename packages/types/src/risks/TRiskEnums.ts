export enum RiskMitigationStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  IMPLEMENTED = 'Implemented',
  MONITORED = 'Monitored',
  COMPLETED = 'Completed',
}

export enum RiskStatus {
  IDENTIFIED = 'Identified',
  ASSESSED = 'Assessed',
  MITIGATING = 'Mitigating',
  MONITORED = 'Monitored',
  CLOSED = 'Closed',
}

export enum RiskLikelihood {
  RARE = 'Rare',
  UNLIKELY = 'Unlikely',
  POSSIBLE = 'Possible',
  LIKELY = 'Likely',
  ALMOST_CERTAIN = 'Almost Certain',
}

export enum RiskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum RiskTolerance {
  ACCEPT = 'Accept',
  MITIGATE = 'Mitigate',
  TRANSFER = 'Transfer',
  AVOID = 'Avoid',
}

export enum RiskReputationalImpact {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}
