import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { MemoryItem, Tag } from '@/domain/entities';
import { getMemoryTypeInfo, getImportanceBadgeVariant, isMemoryDueForReview } from './memory-utils';
import {
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Link as LinkIcon,
  MessageSquare,
  FileText,
  CheckSquare,
  GitCommit,
  Bookmark,
  Code2,
  ExternalLink,
} from 'lucide-react';

export interface MemoryItemCardProps {
  readonly memory: MemoryItem;
  readonly tags?: readonly Tag[];
  readonly onViewDetails: (memory: MemoryItem) => void;
  readonly onEdit: (memory: MemoryItem) => void;
  readonly onArchive?: (memory: MemoryItem) => void;
  readonly onRestore?: (memory: MemoryItem) => void;
  readonly onDelete: (memory: MemoryItem) => void;
  readonly onNavigateToSource?: (entityType: string, entityId: string) => void;
}

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'chat':
      return MessageSquare;
    case 'note':
      return FileText;
    case 'file':
      return FileText;
    case 'task':
      return CheckSquare;
    case 'decision':
      return GitCommit;
    case 'link':
      return LinkIcon;
    case 'bookmark':
      return Bookmark;
    case 'code_snippet':
      return Code2;
    default:
      return LinkIcon;
  }
};

export const MemoryItemCard: React.FC<MemoryItemCardProps> = ({
  memory,
  tags = [],
  onViewDetails,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onNavigateToSource,
}) => {
  const typeInfo = getMemoryTypeInfo(memory.type);
  const TypeIcon = typeInfo.icon;
  const isDue = isMemoryDueForReview(memory.reviewDate);

  const formattedUpdated = new Date(memory.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const memoryTags = (memory.tags || [])
    .map((tagId) => tags.find((t) => t.id === tagId) || tagId)
    .filter(Boolean);

  return (
    <Card
      variant="default"
      style={{
        display: 'flex',
        flexDirection: 'column',
        opacity: memory.status === 'archived' ? 0.75 : 1,
        borderColor: isDue ? 'var(--wb-color-warning, #f59e0b)' : undefined,
      }}
    >
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.5rem',
            width: '100%',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: 'var(--wb-radius-sm, 4px)',
                backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.05))',
                color: typeInfo.color,
                flexShrink: 0,
              }}
            >
              <TypeIcon size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-base, 1rem)',
                  fontWeight: 'var(--wb-weight-semibold, 600)',
                  cursor: 'pointer',
                }}
                onClick={() => onViewDetails(memory)}
              >
                {memory.title}
              </CardTitle>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            <Badge variant={getImportanceBadgeVariant(memory.importance)}>
              {memory.importance}
            </Badge>
            <Badge badgeStyle="outline">{typeInfo.label}</Badge>
            {memory.status === 'archived' && <Badge variant="neutral">Archived</Badge>}
            {isDue && (
              <Badge
                variant="warning"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                title={`Review due since ${memory.reviewDate}`}
              >
                <AlertTriangle size={12} />
                Needs Review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ flex: 1, paddingTop: '0.25rem', paddingBottom: '0.75rem' }}>
        <p
          style={{
            color: 'var(--wb-color-fg-secondary, #64748b)',
            fontSize: 'var(--wb-text-sm, 0.875rem)',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => onViewDetails(memory)}
        >
          {memory.content}
        </p>

        {/* Source References */}
        {memory.sourceReferences && memory.sourceReferences.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {memory.sourceReferences.map((src, idx) => {
              const SourceIcon = getSourceIcon(src.entityType);
              return (
                <div
                  key={`${src.entityType}-${src.entityId}-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--wb-radius-sm, 4px)',
                    backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.04))',
                    border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
                    fontSize: '0.75rem',
                    color: 'var(--wb-color-fg-muted, #64748b)',
                    cursor: onNavigateToSource ? 'pointer' : 'default',
                  }}
                  onClick={() =>
                    onNavigateToSource && onNavigateToSource(src.entityType, src.entityId)
                  }
                  title={
                    src.excerpt
                      ? `Excerpt: ${src.excerpt}`
                      : `${src.entityType}: ${src.title || src.entityId}`
                  }
                >
                  <SourceIcon size={12} />
                  <span
                    style={{
                      maxWidth: '140px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {src.title || `${src.entityType}`}
                  </span>
                  {onNavigateToSource && <ExternalLink size={10} style={{ opacity: 0.7 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {memoryTags.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {memoryTags.map((tag) =>
              typeof tag === 'string' ? (
                <Badge key={tag} variant="neutral">
                  #{tag}
                </Badge>
              ) : (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ),
            )}
          </div>
        )}
      </CardContent>

      <CardFooter
        style={{
          borderTop: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: 'var(--wb-text-xs, 0.75rem)',
            color: 'var(--wb-color-fg-muted, #94a3b8)',
          }}
        >
          <span>Updated {formattedUpdated}</span>
          {memory.reviewDate && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isDue ? 'var(--wb-color-warning, #f59e0b)' : undefined,
              }}
            >
              <Calendar size={12} />
              Review: {memory.reviewDate}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(memory)}
            title="Edit Memory"
            aria-label="Edit memory"
          >
            <Edit2 size={14} />
          </Button>

          {memory.status === 'active' && onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(memory)}
              title="Archive Memory"
              aria-label="Archive memory"
            >
              <Archive size={14} />
            </Button>
          )}

          {memory.status === 'archived' && onRestore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(memory)}
              title="Restore to Active"
              aria-label="Restore memory"
            >
              <RotateCcw size={14} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(memory)}
            title="Delete Memory"
            aria-label="Delete memory"
            style={{ color: 'var(--wb-color-destructive, #ef4444)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
