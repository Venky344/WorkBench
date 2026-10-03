import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Dialog,
  DialogFooter,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Note, Tag } from '@/domain/entities';
import { StickyNote, Pin, Edit2, Trash2, ExternalLink } from 'lucide-react';

export interface NoteCardProps {
  readonly note: Note;
  readonly tags?: readonly Tag[];
  readonly onOpen: (note: Note) => void;
  readonly onEdit: (note: Note) => void;
  readonly onTogglePin?: (note: Note) => void;
  readonly onDelete: (note: Note) => void;
  readonly isReadOnly?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  tags = [],
  onOpen,
  onEdit,
  onTogglePin,
  onDelete,
  isReadOnly = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const noteTags = tags.filter((t) => note.tags && note.tags.includes(t.id));

  // Snippet preview (first ~140 chars)
  const previewText =
    note.content.length > 140
      ? `${note.content.slice(0, 140)}...`
      : note.content || 'Empty note...';

  return (
    <>
      <Card
        variant="default"
        className="wb-note-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderColor: note.isPinned ? 'var(--wb-color-primary)' : undefined,
          transition: 'all var(--wb-duration-fast) ease',
        }}
      >
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <StickyNote size={18} color="var(--wb-color-primary)" style={{ flexShrink: 0 }} />
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onClick={() => onOpen(note)}
                title={note.title}
              >
                {note.title}
              </CardTitle>
            </div>

            {note.isPinned && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '11px',
                  color: 'var(--wb-color-primary)',
                  fontWeight: 'var(--wb-weight-medium)',
                  backgroundColor: 'var(--wb-color-primary-subtle, rgba(59, 130, 246, 0.1))',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--wb-radius-sm)',
                }}
              >
                <Pin size={11} />
                <span>Pinned</span>
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent
          style={{
            flex: 1,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          onClick={() => onOpen(note)}
        >
          <p
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {previewText}
          </p>

          <div>
            {noteTags.length > 0 && (
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.75rem' }}
              >
                {noteTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}

            <div
              style={{
                fontSize: '11px',
                color: 'var(--wb-color-fg-subtle)',
                marginTop: '0.625rem',
              }}
            >
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>

        <CardFooter
          style={{ borderTop: '1px solid var(--wb-color-border-subtle)', paddingTop: '0.5rem' }}
        >
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
              size="sm"
              rightIcon={<ExternalLink size={12} />}
              onClick={() => onOpen(note)}
            >
              Open Note
            </Button>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {onTogglePin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTogglePin(note)}
                    style={{ color: note.isPinned ? 'var(--wb-color-primary)' : undefined }}
                    aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin size={13} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(note)}
                  aria-label={`Edit ${note.title}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${note.title}`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Note?"
        description={`Are you sure you want to delete note "${note.title}"? This action cannot be undone.`}
        maxWidth="440px"
      >
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowDeleteConfirm(false);
              onDelete(note);
            }}
          >
            Delete Note
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
