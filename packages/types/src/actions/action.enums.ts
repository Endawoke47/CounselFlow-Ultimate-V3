export enum ActionType {
  TASK = 'Task',
  APPROVAL = 'Approval',
  REVIEW = 'Review',
  MEETING = 'Meeting',
  DECISION = 'Decision',
  OTHER = 'Other',
}

export enum ActionStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked',
  PENDING = 'Pending',
  OVERDUE = 'Overdue',
}

export enum ActionPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}