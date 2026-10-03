import { DecisionStatus } from '@/domain/entities';

export const getDecisionStatusBadgeVariant = (
  status: DecisionStatus,
): 'success' | 'warning' | 'neutral' | 'destructive' => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'proposed':
      return 'warning';
    case 'superseded':
      return 'neutral';
    case 'rejected':
      return 'destructive';
    default:
      return 'neutral';
  }
};
