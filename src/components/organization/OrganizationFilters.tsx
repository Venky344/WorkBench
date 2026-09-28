import React from 'react';
import { Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { Input, Button } from '@/components/ui';
import { TagBadge } from './TagBadge';
import { Search, X, Filter } from 'lucide-react';

export interface StatusFilterOption {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

export interface OrganizationFiltersProps {
  readonly statusOptions: readonly StatusFilterOption[];
  readonly activeStatus: string;
  readonly onStatusChange: (status: string) => void;
  readonly availableTags: readonly Tag[];
  readonly selectedTagId: EntityId | null;
  readonly onTagSelect: (tagId: EntityId | null) => void;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onClearFilters: () => void;
  readonly searchPlaceholder?: string;
  readonly isFiltered: boolean;
}

export const OrganizationFilters: React.FC<OrganizationFiltersProps> = ({
  statusOptions,
  activeStatus,
  onStatusChange,
  availableTags,
  selectedTagId,
  onTagSelect,
  searchQuery,
  onSearchChange,
  onClearFilters,
  searchPlaceholder = 'Search items...',
  isFiltered,
}) => {
  return (
    <div
      className="wb-organization-filters"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        backgroundColor: 'var(--wb-color-surface)',
        padding: '1rem',
        borderRadius: 'var(--wb-radius-lg)',
        border: '1px solid var(--wb-color-border-subtle)',
      }}
    >
      {/* Top Controls: Status Tabs & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Status Tabs */}
        <div
          role="tablist"
          aria-label="Filter status"
          style={{
            display: 'flex',
            gap: '0.375rem',
            backgroundColor: 'var(--wb-color-surface-card)',
            padding: '0.25rem',
            borderRadius: 'var(--wb-radius-md)',
            border: '1px solid var(--wb-color-border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          {statusOptions.map((opt) => {
            const isActive = activeStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onStatusChange(opt.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: 'var(--wb-text-xs)',
                  fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
                  borderRadius: 'var(--wb-radius-sm)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--wb-color-surface-active)' : 'transparent',
                  color: isActive ? 'var(--wb-color-fg)' : 'var(--wb-color-fg-muted)',
                  cursor: 'pointer',
                  transition: 'var(--wb-transition-colors)',
                }}
              >
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '0.0625rem 0.375rem',
                      borderRadius: 'var(--wb-radius-full)',
                      backgroundColor: isActive
                        ? 'var(--wb-color-surface-card)'
                        : 'var(--wb-color-surface-active)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Action */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={onClearFilters}
            style={{ fontSize: 'var(--wb-text-xs)' }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Bottom Controls: Search & Tag Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px' }}>
          <Input
            id="organization-filter-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {/* Tag Pills List */}
        {availableTags.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginRight: '0.25rem',
              }}
            >
              <Filter size={12} /> Tags:
            </span>

            {availableTags.map((tag) => {
              const isSelected = selectedTagId === tag.id;
              return (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  size="sm"
                  interactive
                  isSelected={isSelected}
                  onClick={() => onTagSelect(isSelected ? null : tag.id)}
                />
              );
            })}

            {selectedTagId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagSelect(null)}
                style={{ padding: '0.125rem 0.375rem', fontSize: '11px', height: 'auto' }}
              >
                Clear Tag
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
