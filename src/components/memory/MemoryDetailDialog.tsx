import React, { useEffect, useState } from 'react';
import { Dialog, DialogFooter, Button, Badge } from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { MemoryItem, Tag } from '@/domain/entities';
import { ResolvedMemorySource } from '@/domain/memory/memory.types';
import { useMemoryService } from '@/app/providers';
import { getMemoryTypeInfo, getImportanceBadgeVariant, isMemoryDueForReview } from './memory-utils';
import {
  Calendar,
  Clock,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  AlertTriangle,
  FileQuestion,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MemoryDetailDialogProps {
  readonly memory: MemoryItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly tags?: readonly Tag[];
  readonly onEdit: (memory: MemoryItem) => void;
  readonly onArchive?: (memory: MemoryItem) => void;
  readonly onRestore?: (memory: MemoryItem) => void;
  readonly onDelete: (memory: MemoryItem) => void;
}

export const MemoryDetailDialog: React.FC<MemoryDetailDialogProps> = ({
  memory,
  isOpen,
  onClose,
  tags = [],
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const memoryService = useMemoryService();
  const navigate = useNavigate();
  const [resolvedSources, setResolvedSources] = useState<readonly ResolvedMemorySource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  useEffect(() => {
    if (!isOpen || !memory) {
      setResolvedSources([]);
      return;
    }

    let mounted = true;
    const loadSources = async () => {
      setIsLoadingSources(true);
      try {
        const resolved = await memoryService.resolveSourceEntities(memory);
        if (mounted) {
          setResolvedSources(resolved);
        }
      } catch {
        if (mounted) {
          setResolvedSources([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingSources(false);
        }
      }
    };

    loadSources();

    return () => {
      mounted = false;
    };
  }, [isOpen, memory, memoryService]);

  if (!memory) return null;

  const typeInfo = getMemoryTypeInfo(memory.type);
  const TypeIcon = typeInfo.icon;
  const isDue = isMemoryDueForReview(memory.reviewDate);

  const memoryTags = (memory.tags || [])
    .map((tagId) => tags.find((t) => t.id === tagId) || tagId)
    .filter(Boolean);

  const handleSourceClick = (src: ResolvedMemorySource) => {
    if (src.route && src.exists) {
      onClose();
      navigate(src.route);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={memory.title}
      description={`Project Memory • ${typeInfo.label}`}
      maxWidth="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Badges & Status */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--wb-radius-sm, 4px)',
              backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.05))',
              color: typeInfo.color,
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <TypeIcon size={14} />
            <span>{typeInfo.label}</span>
          </div>

          <Badge variant={getImportanceBadgeVariant(memory.importance)}>
            Importance: {memory.importance}
          </Badge>

          {memory.status === 'archived' ? (
            <Badge variant="neutral">Status: Archived</Badge>
          ) : (
            <Badge variant="success">Status: Active</Badge>
          )}

          {isDue && (
            <Badge
              variant="warning"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <AlertTriangle size={12} />
              Needs Review
            </Badge>
          )}
        </div>

        {/* Content Box */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--wb-radius-md, 6px)',
            backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.03))',
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontSize: 'var(--wb-text-base, 0.9375rem)',
            color: 'var(--wb-color-fg-primary)',
          }}
        >
          {memory.content}
        </div>

        {/* Source References & Provenance */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--wb-text-sm, 0.875rem)',
              fontWeight: 'var(--wb-weight-semibold, 600)',
              marginBottom: '0.5rem',
              color: 'var(--wb-color-fg-secondary)',
            }}
          >
            <LinkIcon size={14} />
            <span>Source Record Provenance ({resolvedSources.length})</span>
          </div>

          {isLoadingSources ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--wb-color-fg-muted)' }}>
              Resolving source records...
            </div>
          ) : resolvedSources.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {resolvedSources.map((src, idx) => (
                <div
                  key={`${src.entityType}:${src.entityId}:${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--wb-radius-sm, 4px)',
                    border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
                    backgroundColor: src.exists
                      ? 'var(--wb-color-bg-primary, #ffffff)'
                      : 'var(--wb-color-bg-secondary, rgba(0,0,0,0.02))',
                    opacity: src.exists ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Badge badgeStyle="outline">{src.entityType}</Badge>
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          color: src.exists
                            ? 'var(--wb-color-fg-primary)'
                            : 'var(--wb-color-fg-muted)',
                        }}
                      >
                        {src.title || src.entityId}
                      </span>
                      {!src.exists && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--wb-color-warning, #f59e0b)',
                          }}
                        >
                          <FileQuestion size={12} />
                          (Source unavailable or deleted)
                        </span>
                      )}
                    </div>
                    {src.excerpt && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--wb-color-fg-muted)',
                          marginTop: '0.25rem',
                          fontStyle: 'italic',
                        }}
                      >
                        &ldquo;{src.excerpt}&rdquo;
                      </div>
                    )}
                  </div>

                  {src.exists && src.route && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSourceClick(src)}
                      style={{ flexShrink: 0, marginLeft: '0.5rem' }}
                    >
                      <ExternalLink size={13} style={{ marginRight: '0.25rem' }} /> Open Source
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: 'var(--wb-color-fg-muted)' }}>
              No explicit source records linked to this memory.
            </div>
          )}
        </div>

        {/* Tags */}
        {memoryTags.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 'var(--wb-text-xs, 0.75rem)',
                fontWeight: 'var(--wb-weight-semibold, 600)',
                color: 'var(--wb-color-fg-muted)',
                marginBottom: '0.375rem',
              }}
            >
              TAGS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
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
          </div>
        )}

        {/* Timestamps & Review Date Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            fontSize: 'var(--wb-text-xs, 0.75rem)',
            color: 'var(--wb-color-fg-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={13} />
            <span>Created: {new Date(memory.createdAt).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={13} />
            <span>Updated: {new Date(memory.updatedAt).toLocaleString()}</span>
          </div>
          {memory.reviewDate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: isDue ? 'var(--wb-color-warning, #f59e0b)' : undefined,
              }}
            >
              <Calendar size={13} />
              <span>Review Date: {memory.reviewDate}</span>
            </div>
          )}
          {memory.archivedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Archive size={13} />
              <span>Archived: {new Date(memory.archivedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              onDelete(memory);
            }}
            style={{ color: 'var(--wb-color-destructive, #ef4444)' }}
          >
            <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Delete
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {memory.status === 'active' && onArchive && (
              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  onArchive(memory);
                }}
              >
                <Archive size={14} style={{ marginRight: '0.25rem' }} /> Archive
              </Button>
            )}

            {memory.status === 'archived' && onRestore && (
              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  onRestore(memory);
                }}
              >
                <RotateCcw size={14} style={{ marginRight: '0.25rem' }} /> Restore
              </Button>
            )}

            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
            >
              <Edit2 size={14} style={{ marginRight: '0.25rem' }} /> Edit
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
