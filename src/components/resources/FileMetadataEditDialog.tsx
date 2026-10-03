import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useFileService } from '@/app/providers';
import { FileEntity, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface FileMetadataEditDialogProps {
  readonly file: FileEntity | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFileUpdated: (file: FileEntity) => void;
}

export const FileMetadataEditDialog: React.FC<FileMetadataEditDialogProps> = ({
  file,
  isOpen,
  onClose,
  onFileUpdated,
}) => {
  const fileService = useFileService();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setDescription(file.description || '');
      setSelectedTagIds(file.tags || []);
    }
  }, [file]);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const updated = await fileService.updateFileMetadata(file.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        tags: selectedTagIds,
      });

      toast.success(`File "${updated.name}" updated.`, 'File Saved');
      onFileUpdated(updated);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update file metadata';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit File Metadata"
      description={`Original Filename: ${file.originalFilename}`}
      maxWidth="500px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Project Architecture Diagram"
          required
        />

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Context or notes about this file..."
          rows={3}
        />

        <TagPicker
          workspaceId={file.workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
          label="Tags"
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!name.trim() || isSaving}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
