import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useBookmarkService } from '@/app/providers';
import { Bookmark, EntityType, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface BookmarkDialogProps {
  readonly bookmark?: Bookmark | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onBookmarkSaved: (bookmark: Bookmark) => void;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  bookmark,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onBookmarkSaved,
}) => {
  const bookmarkService = useBookmarkService();

  const [title, setTitle] = useState('');
  const [targetEntityType, setTargetEntityType] = useState<EntityType>('chat');
  const [targetEntityId, setTargetEntityId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [note, setNote] = useState('');
  const [order, setOrder] = useState('0');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setTargetEntityType(bookmark.targetEntityType);
      setTargetEntityId(bookmark.targetEntityId);
      setTargetUrl(bookmark.targetUrl || '');
      setNote(bookmark.note || '');
      setOrder(String(bookmark.order ?? 0));
      setSelectedTagIds(bookmark.tags || []);
    } else {
      setTitle('');
      setTargetEntityType('chat');
      setTargetEntityId('');
      setTargetUrl('');
      setNote('');
      setOrder('0');
      setSelectedTagIds([]);
    }
  }, [bookmark, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      if (bookmark) {
        const updated = await bookmarkService.updateBookmark(bookmark.id, {
          title: title.trim(),
          targetEntityType,
          targetEntityId: targetEntityId.trim() || bookmark.id,
          targetUrl: targetUrl.trim() || undefined,
          note: note.trim() || undefined,
          order: parseInt(order, 10) || 0,
          tags: selectedTagIds,
        });
        toast.success(`Bookmark "${updated.title}" updated.`, 'Bookmark Saved');
        onBookmarkSaved(updated);
      } else {
        const created = await bookmarkService.createBookmark({
          workspaceId,
          projectId,
          title: title.trim(),
          targetEntityType,
          targetEntityId: targetEntityId.trim() || projectId,
          targetUrl: targetUrl.trim() || undefined,
          note: note.trim() || undefined,
          order: parseInt(order, 10) || 0,
          tags: selectedTagIds,
        });
        toast.success(`Bookmark "${created.title}" added.`, 'Bookmark Created');
        onBookmarkSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save bookmark';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={bookmark ? 'Edit Bookmark' : 'Add Fast Pointer / Bookmark'}
      description={
        bookmark
          ? 'Update bookmark details, target, and annotations.'
          : 'Create a fast link or entity pointer in this project.'
      }
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <Input
            label="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Primary Project Specification"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Target Resource Type"
              value={targetEntityType}
              onChange={(e) => setTargetEntityType(e.target.value as EntityType)}
              options={[
                { value: 'chat', label: 'Chat Conversation' },
                { value: 'file', label: 'File Attachment' },
                { value: 'note', label: 'Note' },
                { value: 'link', label: 'External Link' },
                { value: 'project', label: 'Project' },
                { value: 'task', label: 'Task' },
                { value: 'decision', label: 'Decision' },
              ]}
            />

            <Input
              label="Target ID or Reference"
              value={targetEntityId}
              onChange={(e) => setTargetEntityId(e.target.value)}
              placeholder="Entity ID (optional)"
            />
          </div>

          <Input
            label="Target Navigation URL (Optional)"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="e.g. /projects/... or https://..."
          />

          <Textarea
            label="Annotation / Note (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why this item is bookmarked..."
            rows={2}
          />

          <TagPicker
            workspaceId={workspaceId}
            selectedTagIds={selectedTagIds}
            onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
            label="Tags (Optional)"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!title.trim() || isSaving}
          >
            {bookmark ? 'Save Changes' : 'Add Bookmark'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
