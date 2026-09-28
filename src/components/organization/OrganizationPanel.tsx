import React from 'react';
import { EntityId } from '@/types';
import { Tag } from '@/domain/entities';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { TagPicker } from './TagPicker';
import { Pin, Heart, Archive, Clock, Calendar, Tag as TagIcon } from 'lucide-react';

export interface OrganizationPanelProps {
  readonly workspaceId: EntityId;
  readonly entityType: 'project' | 'chat';
  readonly selectedTagIds: readonly EntityId[];
  readonly onTagsChange: (tagIds: readonly EntityId[], tags: readonly Tag[]) => void;
  readonly isPinned: boolean;
  readonly onTogglePin: () => void;
  readonly isFavorite?: boolean;
  readonly onToggleFavorite?: () => void;
  readonly isArchived: boolean;
  readonly onToggleArchive?: () => void;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly lastActivityAt?: string;
  readonly readOnly?: boolean;
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({
  workspaceId,
  entityType,
  selectedTagIds,
  onTagsChange,
  isPinned,
  onTogglePin,
  isFavorite,
  onToggleFavorite,
  isArchived,
  onToggleArchive,
  createdAt,
  updatedAt,
  lastActivityAt,
  readOnly = false,
}) => {
  return (
    <Card variant="default" className="wb-organization-panel">
      <CardHeader style={{ paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TagIcon size={18} color="var(--wb-color-primary)" />
            <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
              Organization & Metadata
            </CardTitle>
          </div>
          <Badge variant={isArchived ? 'warning' : 'neutral'} badgeStyle="subtle">
            {isArchived ? 'Archived' : 'Active'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Tags Section */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
              marginBottom: '0.375rem',
            }}
          >
            Assigned Tags
          </label>
          <TagPicker
            workspaceId={workspaceId}
            selectedTagIds={selectedTagIds}
            onChange={onTagsChange}
            disabled={readOnly || isArchived}
            placeholder={`Add tags to this ${entityType}...`}
          />
        </div>

        {/* Quick Flags & Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant={isPinned ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Pin size={14} fill={isPinned ? 'currentColor' : 'none'} />}
            onClick={onTogglePin}
            disabled={readOnly || isArchived}
            style={{ fontSize: 'var(--wb-text-xs)' }}
          >
            {isPinned ? 'Pinned' : 'Pin Item'}
          </Button>

          {onToggleFavorite !== undefined && isFavorite !== undefined && (
            <Button
              variant={isFavorite ? 'destructive' : 'outline'}
              size="sm"
              leftIcon={<Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />}
              onClick={onToggleFavorite}
              disabled={readOnly || isArchived}
              style={{ fontSize: 'var(--wb-text-xs)' }}
            >
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
          )}

          {onToggleArchive && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Archive size={14} />}
              onClick={onToggleArchive}
              disabled={readOnly}
              style={{ fontSize: 'var(--wb-text-xs)' }}
            >
              {isArchived ? 'Restore' : 'Archive'}
            </Button>
          )}
        </div>

        {/* Timestamps & Info */}
        <div
          style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--wb-color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-muted)',
          }}
        >
          {createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={13} /> Created:
              </span>
              <span style={{ color: 'var(--wb-color-fg)' }}>
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
          )}

          {updatedAt && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={13} /> Updated:
              </span>
              <span style={{ color: 'var(--wb-color-fg)' }}>
                {new Date(updatedAt).toLocaleString()}
              </span>
            </div>
          )}

          {lastActivityAt && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={13} /> Last Activity:
              </span>
              <span style={{ color: 'var(--wb-color-fg)' }}>
                {new Date(lastActivityAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
