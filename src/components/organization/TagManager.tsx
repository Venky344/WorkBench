import React, { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { useTagService } from '@/app/providers';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogFooter,
  Badge,
  EmptyState,
  LoadingState,
} from '@/components/ui';
import { TagBadge } from './TagBadge';
import { TAG_COLOR_OPTIONS } from './tag-theme';
import { toast } from '@/stores/toast.store';
import { Search, Plus, Edit3, Trash2, Tag as TagIcon, Info, Hash } from 'lucide-react';

export interface TagManagerProps {
  readonly workspaceId: EntityId;
}

export const TagManager: React.FC<TagManagerProps> = ({ workspaceId }) => {
  const tagService = useTagService();

  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [usageCounts, setUsageCounts] = useState<
    Record<EntityId, { projectCount: number; chatCount: number; totalCount: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTagsAndUsage = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const loadedTags = await tagService.listTags(workspaceId);
      setTags(loadedTags);

      // Load usage counts for each tag
      const counts: Record<
        EntityId,
        { projectCount: number; chatCount: number; totalCount: number }
      > = {};
      for (const t of loadedTags) {
        counts[t.id] = await tagService.getTagUsageCount(workspaceId, t.id);
      }
      setUsageCounts(counts);
    } catch {
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  }, [tagService, workspaceId]);

  useEffect(() => {
    loadTagsAndUsage();
  }, [loadTagsAndUsage]);

  const filteredTags = tags.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim().replace(/^#+/, '');
    return (
      t.normalizedName.includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setFormName('');
    setFormColor('blue');
    setFormDescription('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormColor(tag.color ?? 'blue');
    setFormDescription(tag.description ?? '');
    setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim().replace(/^#+/, '').trim();
    if (!trimmed) {
      setFormError('Tag name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const created = await tagService.createTag({
        workspaceId,
        name: trimmed,
        color: formColor,
        description: formDescription.trim() || undefined,
      });

      toast.success(`Tag "#${created.name}" created.`, 'Tag Created');
      setIsCreateOpen(false);
      await loadTagsAndUsage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tag';
      setFormError(msg);
      toast.error(msg, 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    const trimmed = formName.trim().replace(/^#+/, '').trim();
    if (!trimmed) {
      setFormError('Tag name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const updated = await tagService.updateTag(editingTag.id, {
        name: trimmed,
        color: formColor,
        description: formDescription.trim() || undefined,
      });

      toast.success(`Tag "#${updated.name}" updated.`, 'Tag Updated');
      setEditingTag(null);
      await loadTagsAndUsage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update tag';
      setFormError(msg);
      toast.error(msg, 'Update Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    setIsSubmitting(true);
    try {
      await tagService.deleteTag(deletingTag.id);
      toast.success(
        `Tag "#${deletingTag.name}" deleted and removed from assigned items.`,
        'Tag Deleted',
      );
      setDeletingTag(null);
      await loadTagsAndUsage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tag';
      toast.error(msg, 'Delete Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading workspace tags..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Actions Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            id="tag-manager-search"
            placeholder="Search tags by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          New Tag
        </Button>
      </div>

      {/* Tags List */}
      {filteredTags.length === 0 ? (
        <EmptyState
          icon={<TagIcon size={36} />}
          title={searchQuery ? 'No matching tags found' : 'No tags in workspace yet'}
          description={
            searchQuery
              ? 'Try changing your search keywords or create a new tag.'
              : 'Tags allow you to organize and classify projects and conversations across your workspace.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Create First Tag'}
          onAction={searchQuery ? () => setSearchQuery('') : handleOpenCreate}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: 'var(--wb-color-surface)',
            borderRadius: 'var(--wb-radius-lg)',
            border: '1px solid var(--wb-color-border-subtle)',
            overflow: 'hidden',
          }}
        >
          {filteredTags.map((tag) => {
            const usage = usageCounts[tag.id] ?? { projectCount: 0, chatCount: 0, totalCount: 0 };
            return (
              <div
                key={tag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid var(--wb-color-border-subtle)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                    minWidth: '200px',
                  }}
                >
                  <TagBadge tag={tag} size="md" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: 'var(--wb-text-xs)',
                          fontFamily: 'monospace',
                          color: 'var(--wb-color-fg-muted)',
                        }}
                      >
                        {tag.normalizedName}
                      </span>
                    </div>
                    {tag.description && (
                      <p
                        style={{
                          margin: '0.125rem 0 0 0',
                          fontSize: 'var(--wb-text-xs)',
                          color: 'var(--wb-color-fg-muted)',
                        }}
                      >
                        {tag.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge variant="neutral" badgeStyle="subtle">
                    {usage.totalCount} {usage.totalCount === 1 ? 'item' : 'items'} (
                    {usage.projectCount} projects, {usage.chatCount} chats)
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit tag ${tag.name}`}
                    leftIcon={<Edit3 size={14} />}
                    onClick={() => handleOpenEdit(tag)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete tag ${tag.name}`}
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setDeletingTag(tag)}
                    style={{ color: 'var(--wb-color-destructive)' }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tag Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Workspace Tag"
        description="Create a canonical tag for organizing projects and conversations."
        maxWidth="480px"
      >
        <form
          noValidate
          onSubmit={handleCreateSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <Input
            id="create-tag-name"
            label="Tag Name"
            required
            placeholder="e.g. frontend, high-priority, research..."
            leftIcon={<Hash size={15} />}
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (formError) setFormError(null);
            }}
            errorMessage={formError ?? undefined}
            autoFocus
          />

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-medium)',
                color: 'var(--wb-color-fg-muted)',
                marginBottom: '0.5rem',
              }}
            >
              Tag Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TAG_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-label={`Select ${opt.label} color`}
                  onClick={() => setFormColor(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--wb-radius-md)',
                    border:
                      formColor === opt.id
                        ? `2px solid ${opt.colorVar}`
                        : '1px solid var(--wb-color-border)',
                    backgroundColor: formColor === opt.id ? opt.bgSubtleVar : 'transparent',
                    color: opt.colorVar,
                    cursor: 'pointer',
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-medium)',
                  }}
                >
                  <span
                    style={{
                      width: '0.625rem',
                      height: '0.625rem',
                      borderRadius: 'var(--wb-radius-full)',
                      backgroundColor: opt.colorVar,
                    }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            id="create-tag-description"
            label="Description (Optional)"
            placeholder="Brief explanation of when to use this tag..."
            rows={2}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <DialogFooter style={{ marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Tag
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog
        isOpen={!!editingTag}
        onClose={() => setEditingTag(null)}
        title={editingTag ? `Edit Tag "#${editingTag.name}"` : 'Edit Tag'}
        description="Update tag display name, color token, or usage description."
        maxWidth="480px"
      >
        <form
          noValidate
          onSubmit={handleEditSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <Input
            id="edit-tag-name"
            label="Tag Name"
            required
            placeholder="e.g. frontend, high-priority, research..."
            leftIcon={<Hash size={15} />}
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (formError) setFormError(null);
            }}
            errorMessage={formError ?? undefined}
            autoFocus
          />

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-medium)',
                color: 'var(--wb-color-fg-muted)',
                marginBottom: '0.5rem',
              }}
            >
              Tag Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TAG_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-label={`Select ${opt.label} color`}
                  onClick={() => setFormColor(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--wb-radius-md)',
                    border:
                      formColor === opt.id
                        ? `2px solid ${opt.colorVar}`
                        : '1px solid var(--wb-color-border)',
                    backgroundColor: formColor === opt.id ? opt.bgSubtleVar : 'transparent',
                    color: opt.colorVar,
                    cursor: 'pointer',
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-medium)',
                  }}
                >
                  <span
                    style={{
                      width: '0.625rem',
                      height: '0.625rem',
                      borderRadius: 'var(--wb-radius-full)',
                      backgroundColor: opt.colorVar,
                    }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            id="edit-tag-description"
            label="Description (Optional)"
            placeholder="Brief explanation of when to use this tag..."
            rows={2}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <DialogFooter style={{ marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTag(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Tag Modal */}
      <Dialog
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        title={deletingTag ? `Delete Tag "#${deletingTag.name}"?` : 'Delete Tag'}
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-info-subtle)',
              color: 'var(--wb-color-info)',
            }}
          >
            <Info size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: 'var(--wb-text-xs)', lineHeight: 'var(--wb-leading-relaxed)' }}>
              <strong>Safety Note:</strong> Deleting this tag will remove it from all assigned
              projects and conversations.{' '}
              <strong>Projects and conversations will not be deleted.</strong>
            </div>
          </div>

          <p
            style={{ margin: 0, fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}
          >
            Are you sure you want to permanently delete the tag{' '}
            <strong>#{deletingTag?.name}</strong>?
          </p>

          <DialogFooter style={{ marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTag(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              leftIcon={<Trash2 size={16} />}
              isLoading={isSubmitting}
              onClick={handleDelete}
            >
              Delete Tag
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};
