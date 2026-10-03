import React from 'react';
import { Input, Select } from '@/components/ui';
import { Tag, DecisionStatus } from '@/domain/entities';
import { EntityId } from '@/types';
import { Search } from 'lucide-react';

export type DecisionStatusFilter = 'all' | DecisionStatus;
export type DecisionSortOption = 'created_desc' | 'created_asc' | 'title_asc';

export interface DecisionFilterBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly statusFilter: DecisionStatusFilter;
  readonly onStatusFilterChange: (status: DecisionStatusFilter) => void;
  readonly tagFilter: EntityId | 'all';
  readonly onTagFilterChange: (tagId: EntityId | 'all') => void;
  readonly sortOption: DecisionSortOption;
  readonly onSortOptionChange: (sort: DecisionSortOption) => void;
  readonly availableTags?: readonly Tag[];
  readonly totalCount: number;
  readonly countsByStatus: {
    readonly all: number;
    readonly accepted: number;
    readonly proposed: number;
    readonly superseded: number;
    readonly rejected: number;
  };
}

export const DecisionFilterBar: React.FC<DecisionFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tagFilter,
  onTagFilterChange,
  sortOption,
  onSortOptionChange,
  availableTags = [],
  countsByStatus,
}) => {
  const statusTabs: { id: DecisionStatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Decisions', count: countsByStatus.all },
    { id: 'accepted', label: 'Accepted', count: countsByStatus.accepted },
    { id: 'proposed', label: 'Proposed', count: countsByStatus.proposed },
    { id: 'superseded', label: 'Superseded', count: countsByStatus.superseded },
    { id: 'rejected', label: 'Rejected', count: countsByStatus.rejected },
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

      {/* Controls row: Search, Tag, Sort */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Search title, decision, rationale, implications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={15} />}
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
          onChange={(e) => onSortOptionChange(e.target.value as DecisionSortOption)}
          options={[
            { value: 'created_desc', label: 'Newest First' },
            { value: 'created_asc', label: 'Oldest First' },
            { value: 'title_asc', label: 'Title (A-Z)' },
          ]}
        />
      </div>
    </div>
  );
};
