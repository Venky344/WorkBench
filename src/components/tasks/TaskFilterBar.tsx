import React from 'react';
import { Input, Select } from '@/components/ui';
import { Tag, TaskPriority, TaskStatus } from '@/domain/entities';
import { EntityId } from '@/types';
import { Search } from 'lucide-react';

export type TaskStatusFilter = 'all' | TaskStatus | 'overdue';
export type TaskPriorityFilter = 'all' | TaskPriority;
export type TaskSortOption = 'order' | 'due_date' | 'created_desc' | 'priority_desc' | 'title_asc';

export interface TaskFilterBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly statusFilter: TaskStatusFilter;
  readonly onStatusFilterChange: (status: TaskStatusFilter) => void;
  readonly priorityFilter: TaskPriorityFilter;
  readonly onPriorityFilterChange: (priority: TaskPriorityFilter) => void;
  readonly tagFilter: EntityId | 'all';
  readonly onTagFilterChange: (tagId: EntityId | 'all') => void;
  readonly sortOption: TaskSortOption;
  readonly onSortOptionChange: (sort: TaskSortOption) => void;
  readonly availableTags?: readonly Tag[];
  readonly totalCount: number;
  readonly countsByStatus: {
    readonly all: number;
    readonly todo: number;
    readonly in_progress: number;
    readonly done: number;
    readonly overdue: number;
  };
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  tagFilter,
  onTagFilterChange,
  sortOption,
  onSortOptionChange,
  availableTags = [],
  countsByStatus,
}) => {
  const statusTabs: { id: TaskStatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Tasks', count: countsByStatus.all },
    { id: 'todo', label: 'To Do', count: countsByStatus.todo },
    { id: 'in_progress', label: 'In Progress', count: countsByStatus.in_progress },
    { id: 'done', label: 'Completed', count: countsByStatus.done },
    { id: 'overdue', label: 'Overdue', count: countsByStatus.overdue },
  ];

  const tagOptions = [
    { value: 'all', label: 'All Tags' },
    ...availableTags.map((t) => ({ value: t.id, label: `#${t.name}` })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Top row: Status Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--wb-color-border)',
          paddingBottom: '0.75rem',
        }}
      >
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusFilterChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--wb-radius-md)',
                fontSize: 'var(--wb-text-sm)',
                fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
                backgroundColor: isActive
                  ? 'var(--wb-color-primary, #3b82f6)'
                  : 'var(--wb-color-bg-subtle)',
                color: isActive ? '#ffffff' : 'var(--wb-color-fg)',
                border: '1px solid',
                borderColor: isActive
                  ? 'var(--wb-color-primary, #3b82f6)'
                  : 'var(--wb-color-border)',
                cursor: 'pointer',
                transition: 'all var(--wb-duration-fast)',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--wb-radius-full)',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'var(--wb-color-bg-muted)',
                  color: isActive ? '#ffffff' : 'var(--wb-color-fg-muted)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls row: Search, Priority, Tag, Sort */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Search task title & description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={15} />}
        />

        <Select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriorityFilter)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />

        {availableTags.length > 0 && (
          <Select
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value as EntityId | 'all')}
            options={tagOptions}
          />
        )}

        <Select
          value={sortOption}
          onChange={(e) => onSortOptionChange(e.target.value as TaskSortOption)}
          options={[
            { value: 'order', label: 'Manual Order' },
            { value: 'due_date', label: 'Due Date (Soonest)' },
            { value: 'priority_desc', label: 'Priority (Highest)' },
            { value: 'created_desc', label: 'Newest First' },
            { value: 'title_asc', label: 'Title (A-Z)' },
          ]}
        />
      </div>
    </div>
  );
};
