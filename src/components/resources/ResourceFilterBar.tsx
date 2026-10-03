import React from 'react';
import { Input, Select, Button } from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { Search, X, Tag as TagIcon } from 'lucide-react';

export type ResourceSortOption = 'updated_desc' | 'created_desc' | 'name_asc' | 'name_desc';

export interface ResourceFilterBarProps {
  readonly search: string;
  readonly onSearchChange: (query: string) => void;
  readonly sort: ResourceSortOption;
  readonly onSortChange: (sort: ResourceSortOption) => void;
  readonly availableTags?: readonly Tag[];
  readonly selectedTagId?: EntityId | null;
  readonly onTagSelect?: (tagId: EntityId | null) => void;
  readonly placeholder?: string;
  readonly count?: number;
  readonly style?: React.CSSProperties;
}

export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  availableTags = [],
  selectedTagId = null,
  onTagSelect,
  placeholder = 'Filter by title, description, or tags...',
  count,
  style,
}) => {
  return (
    <div
      className="wb-resource-filter-bar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Filter Input */}
        <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            leftIcon={<Search size={15} />}
            rightIcon={
              search ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear filter search"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--wb-color-fg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Sort Selector */}
        <div style={{ width: '180px', flexShrink: 0 }}>
          <Select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ResourceSortOption)}
            options={[
              { value: 'updated_desc', label: 'Recently Updated' },
              { value: 'created_desc', label: 'Recently Added' },
              { value: 'name_asc', label: 'Name (A to Z)' },
              { value: 'name_desc', label: 'Name (Z to A)' },
            ]}
            aria-label="Sort items"
          />
        </div>

        {/* Item Counter */}
        {count !== undefined && (
          <span
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              whiteSpace: 'nowrap',
              marginLeft: 'auto',
            }}
          >
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Tag Filter Pills */}
      {availableTags.length > 0 && onTagSelect && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            flexWrap: 'wrap',
            paddingTop: '0.25rem',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              marginRight: '0.25rem',
            }}
          >
            <TagIcon size={12} />
            <span>Filter by tag:</span>
          </span>

          <Button
            variant={selectedTagId === null ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTagSelect(null)}
          >
            All
          </Button>

          {availableTags.map((tag) => {
            const isSelected = selectedTagId === tag.id;
            return (
              <div
                key={tag.id}
                onClick={() => onTagSelect(isSelected ? null : tag.id)}
                style={{
                  cursor: 'pointer',
                  opacity: isSelected || selectedTagId === null ? 1 : 0.5,
                  transform: isSelected ? 'scale(1.04)' : 'none',
                  transition: 'all var(--wb-duration-fast) ease',
                }}
              >
                <TagBadge tag={tag} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
