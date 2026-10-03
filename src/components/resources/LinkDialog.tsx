import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useLinkService } from '@/app/providers';
import { Link, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { Globe, AlertCircle } from 'lucide-react';
import { LinkService } from '@/services/link.service';

export interface LinkDialogProps {
  readonly link?: Link | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onLinkSaved: (link: Link) => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  link,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onLinkSaved,
}) => {
  const linkService = useLinkService();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (link) {
      setUrl(link.url);
      setTitle(link.title);
      setDescription(link.description || '');
      setSelectedTagIds(link.tags || []);
      setValidationError(null);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setSelectedTagIds([]);
      setValidationError(null);
    }
  }, [link, isOpen]);

  const handleUrlBlur = () => {
    if (!url.trim()) return;
    try {
      const { domain } = LinkService.validateAndParseUrl(url);
      setValidationError(null);
      if (!title.trim()) {
        setTitle(domain);
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid URL format');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validate URL
    try {
      LinkService.validateAndParseUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid URL format';
      setValidationError(msg);
      return;
    }

    setIsSaving(true);
    setValidationError(null);

    try {
      if (link) {
        const updated = await linkService.updateLink(link.id, {
          url: url.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Link "${updated.title}" updated.`, 'Link Saved');
        onLinkSaved(updated);
      } else {
        const created = await linkService.createLink({
          workspaceId,
          projectId,
          url: url.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Link "${created.title}" added.`, 'Link Created');
        onLinkSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save link';
      setValidationError(msg);
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={link ? 'Edit Web Link' : 'Add Web Link'}
      description="Save an external documentation or reference URL."
      maxWidth="500px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {validationError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-danger-subtle)',
              color: 'var(--wb-color-danger)',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        <Input
          label="URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setValidationError(null);
          }}
          onBlur={handleUrlBlur}
          placeholder="https://example.com/docs"
          required
          leftIcon={<Globe size={15} />}
        />

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. API Reference Documentation"
          required
        />

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary or purpose of this external link..."
          rows={2}
        />

        <TagPicker
          workspaceId={workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
          label="Tags (Optional)"
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!url.trim() || isSaving}
          >
            {link ? 'Save Changes' : 'Add Link'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
