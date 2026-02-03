export interface BeneficiaryAssignmentSummary {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;

  assignmentsCount: number;
  completedCount: number;
  inProgressCount: number;
  avgProgressPercent: number;
}

export interface ModuleWithAssignment {
  id: string;
  title: string;
  thematics: string;
  difficultyLevel: string;
  estimatedDuration: number;
  status: string;

  imageUrl: string | null;

  assigned: boolean;
  assignmentStatus: string | null;
  assignmentProgress: number | null;
}
