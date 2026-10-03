import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Bookmark, Tag } from '@/domain/entities';
import { Bookmark as BookmarkIcon, ExternalLink, ArrowRight, Edit2, Trash2 } from 'lucide-react';

export interface BookmarkCardProps {
  readonly bookmark: Bookmark;
  readonly tags?: readonly Tag[];
  readonly onEdit: (bookmark: Bookmark) => void;
  readonly onDelete: (bookmark: Bookmark) => void;
  readonly isReadOnly?: boolean;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  tags = [],
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const bookmarkTags = tags.filter((t) => bookmark.tags && bookmark.tags.includes(t.id));

  const handleNavigate = () => {
    if (bookmark.targetUrl) {
      if (bookmark.targetUrl.startsWith('http://') || bookmark.targetUrl.startsWith('https://')) {
        window.open(bookmark.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate(bookmark.targetUrl);
      }
    } else if (bookmark.targetEntityType === 'chat') {
      navigate(`/projects/${bookmark.projectId}/chats/${bookmark.targetEntityId}`);
    } else if (bookmark.targetEntityType === 'note') {
      navigate(`/projects/${bookmark.projectId}/notes/${bookmark.targetEntityId}`);
    } else if (bookmark.targetEntityType === 'file') {
      navigate(`/projects/${bookmark.projectId}/files`);
    } else if (bookmark.targetEntityType === 'project') {
      navigate(`/projects/${bookmark.targetEntityId}`);
    }
  };

  return (
    <>
      <Card
        variant="default"
        className="wb-bookmark-card"
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
              <BookmarkIcon size={18} color="var(--wb-color-accent)" style={{ flexShrink: 0 }} />
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                }}
                onClick={handleNavigate}
                title={bookmark.title}
              >
                {bookmark.title}
              </CardTitle>
            </div>

            <Badge variant="primary" style={{ flexShrink: 0, fontSize: '10px' }}>
              {bookmark.targetEntityType.toUpperCase()}
            </Badge>
          </div>

          {bookmark.note && (
            <CardDescription style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.5rem' }}>
              {bookmark.note}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {bookmark.targetUrl && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--wb-color-fg-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Target: {bookmark.targetUrl}
            </div>
          )}

          {bookmarkTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {bookmarkTags.map((tag) => (
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
            Updated {new Date(bookmark.updatedAt).toLocaleDateString()}
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
              rightIcon={
                bookmark.targetUrl?.startsWith('http') ? (
                  <ExternalLink size={12} />
                ) : (
                  <ArrowRight size={12} />
                )
              }
              onClick={handleNavigate}
            >
              Jump to Target
            </Button>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(bookmark)}
                  aria-label={`Edit ${bookmark.title}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${bookmark.title}`}
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
        title="Delete Bookmark?"
        description={`Are you sure you want to delete bookmark "${bookmark.title}"?`}
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
              onDelete(bookmark);
            }}
          >
            Delete Bookmark
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
