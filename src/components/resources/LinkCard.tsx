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
import { Link as LinkEntity, Tag } from '@/domain/entities';
import { ExternalLink, Globe, Edit2, Trash2 } from 'lucide-react';

export interface LinkCardProps {
  readonly link: LinkEntity;
  readonly tags?: readonly Tag[];
  readonly onEdit: (link: LinkEntity) => void;
  readonly onDelete: (link: LinkEntity) => void;
  readonly isReadOnly?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  tags = [],
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const linkTags = tags.filter((t) => link.tags && link.tags.includes(t.id));

  const handleOpenExternal = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Card
        variant="default"
        className="wb-link-card"
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
              <Globe size={18} color="var(--wb-color-primary)" style={{ flexShrink: 0 }} />
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                }}
                onClick={handleOpenExternal}
                title={link.title}
              >
                {link.title}
              </CardTitle>
            </div>

            <Badge variant="neutral" style={{ flexShrink: 0, fontSize: '10px' }}>
              {link.domain}
            </Badge>
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: 'var(--wb-color-primary)',
              textDecoration: 'none',
              marginTop: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {link.url}
          </a>

          {link.description && (
            <CardDescription style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.5rem' }}>
              {link.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {linkTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {linkTags.map((tag) => (
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
            Updated {new Date(link.updatedAt).toLocaleDateString()}
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
              variant="outline"
              size="sm"
              rightIcon={<ExternalLink size={12} />}
              onClick={handleOpenExternal}
              aria-label={`Open link ${link.title}`}
            >
              Open Link
            </Button>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(link)}
                  aria-label={`Edit ${link.title}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${link.title}`}
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
        title="Delete Web Link?"
        description={`Are you sure you want to delete "${link.title}"?`}
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
              onDelete(link);
            }}
          >
            Delete Link
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
