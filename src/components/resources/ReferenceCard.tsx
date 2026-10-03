import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Dialog,
  DialogFooter,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Reference, Tag } from '@/domain/entities';
import { BookOpen, ExternalLink, Edit2, Trash2 } from 'lucide-react';

export interface ReferenceCardProps {
  readonly reference: Reference;
  readonly tags?: readonly Tag[];
  readonly onEdit: (reference: Reference) => void;
  readonly onDelete: (reference: Reference) => void;
  readonly isReadOnly?: boolean;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  reference,
  tags = [],
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const referenceTags = tags.filter((t) => reference.tags && reference.tags.includes(t.id));

  const isHttp =
    reference.targetUri.startsWith('http://') || reference.targetUri.startsWith('https://');

  const handleOpen = () => {
    if (isHttp) {
      window.open(reference.targetUri, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Card
        variant="default"
        className="wb-reference-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
              <BookOpen size={18} color="var(--wb-color-primary)" style={{ flexShrink: 0 }} />
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={reference.title}
              >
                {reference.title}
              </CardTitle>
            </div>

            <Badge variant="neutral" style={{ flexShrink: 0, fontSize: '10px' }}>
              {reference.referenceKind.toUpperCase()}
            </Badge>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--wb-color-fg-muted)',
              fontFamily: 'var(--wb-font-mono, monospace)',
              marginTop: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {reference.targetUri}
          </div>

          {reference.annotation && (
            <CardDescription style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.5rem' }}>
              {reference.annotation}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {referenceTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {referenceTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: '11px',
              color: 'var(--wb-color-fg-subtle)',
              marginTop: '0.75rem',
            }}
          >
            Updated {new Date(reference.updatedAt).toLocaleDateString()}
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
            {isHttp ? (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink size={12} />}
                onClick={handleOpen}
              >
                Open Source
              </Button>
            ) : (
              <div />
            )}

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(reference)}
                  aria-label={`Edit ${reference.title}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${reference.title}`}
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
        title="Delete Reference?"
        description={`Are you sure you want to delete reference "${reference.title}"?`}
        maxWidth="450px"
      >
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowDeleteConfirm(false);
              onDelete(reference);
            }}
          >
            Delete Reference
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
