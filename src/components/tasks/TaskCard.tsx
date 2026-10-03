import React from 'react';
import { Card, Badge, Button, Checkbox } from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Task, Tag } from '@/domain/entities';
import { getPriorityBadgeVariant, isTaskOverdue } from './task-utils';
import { Calendar, AlertCircle, Edit2, Trash2, Folder } from 'lucide-react';

export interface TaskCardProps {
  readonly task: Task;
  readonly projectName?: string;
  readonly tags?: readonly Tag[];
  readonly onToggleComplete: (task: Task) => void;
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projectName,
  tags = [],
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const isDone = task.status === 'done';
  const overdue = isTaskOverdue(task);

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year:
          new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      })
    : null;

  // Resolve tag entities for tag badges
  const taskTags = (task.tags || [])
    .map((tagId) => tags.find((t) => t.id === tagId) || tagId)
    .filter(Boolean);

  return (
    <Card
      variant="default"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        padding: '0.875rem 1rem',
        opacity: isDone ? 0.75 : 1,
        transition: 'all var(--wb-duration-fast) var(--wb-ease-default)',
        borderLeft: overdue
          ? '3px solid var(--wb-color-destructive, #ef4444)'
          : isDone
            ? '3px solid var(--wb-color-success, #22c55e)'
            : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ paddingTop: '0.125rem' }}>
            <Checkbox
              checked={isDone}
              onChange={() => onToggleComplete(task)}
              aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 'var(--wb-text-base)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: isDone ? 'var(--wb-color-fg-muted)' : 'var(--wb-color-fg)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                }}
              >
                {task.title}
              </span>

              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>

              {overdue && (
                <Badge variant="destructive">
                  <AlertCircle size={11} style={{ marginRight: '0.25rem' }} />
                  Overdue
                </Badge>
              )}

              {projectName && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: 'var(--wb-text-xs)',
                    color: 'var(--wb-color-fg-muted)',
                    backgroundColor: 'var(--wb-color-bg-subtle)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--wb-radius-sm)',
                  }}
                >
                  <Folder size={11} />
                  {projectName}
                </span>
              )}
            </div>

            {task.description && (
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: 'var(--wb-text-sm)',
                  color: 'var(--wb-color-fg-muted)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4,
                }}
              >
                {task.description}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                marginTop: '0.25rem',
                flexWrap: 'wrap',
              }}
            >
              {formattedDueDate && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: 'var(--wb-text-xs)',
                    color: overdue
                      ? 'var(--wb-color-destructive, #ef4444)'
                      : 'var(--wb-color-fg-subtle)',
                    fontWeight: overdue ? 'var(--wb-weight-semibold)' : 'normal',
                  }}
                >
                  <Calendar size={12} />
                  Due {formattedDueDate}
                </span>
              )}

              {taskTags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {taskTags.map((t, idx) => (
                    <TagBadge
                      key={typeof t === 'string' ? `${t}-${idx}` : t.id}
                      tag={t}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            aria-label={`Edit task "${task.title}"`}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task)}
            aria-label={`Delete task "${task.title}"`}
            style={{ color: 'var(--wb-color-destructive)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
