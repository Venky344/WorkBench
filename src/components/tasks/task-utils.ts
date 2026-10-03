import { Task, TaskPriority } from '@/domain/entities';

export const getPriorityBadgeVariant = (
  priority: TaskPriority,
): 'neutral' | 'primary' | 'warning' | 'destructive' => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'primary';
    case 'low':
    default:
      return 'neutral';
  }
};

export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'done' || task.status === 'cancelled' || !task.dueDate) {
    return false;
  }
  const due = new Date(task.dueDate);
  if (isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
};
