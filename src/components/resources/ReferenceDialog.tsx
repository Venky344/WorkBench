import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useReferenceService } from '@/app/providers';
import { Reference, ReferenceKind, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface ReferenceDialogProps {
  readonly reference?: Reference | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onReferenceSaved: (reference: Reference) => void;
}

export const ReferenceDialog: React.FC<ReferenceDialogProps> = ({
  reference,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onReferenceSaved,
}) => {
  const referenceService = useReferenceService();

  const [title, setTitle] = useState('');
  const [referenceKind, setReferenceKind] = useState<ReferenceKind>('url');
  const [targetUri, setTargetUri] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reference) {
      setTitle(reference.title);
      setReferenceKind(reference.referenceKind);
      setTargetUri(reference.targetUri);
      setAnnotation(reference.annotation || '');
      setSelectedTagIds(reference.tags || []);
    } else {
      setTitle('');
      setReferenceKind('url');
      setTargetUri('');
      setAnnotation('');
      setSelectedTagIds([]);
    }
  }, [reference, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetUri.trim()) return;

    setIsSaving(true);
    try {
      if (reference) {
        const updated = await referenceService.updateReference(reference.id, {
          title: title.trim(),
          referenceKind,
          targetUri: targetUri.trim(),
          annotation: annotation.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Reference "${updated.title}" updated.`, 'Reference Saved');
        onReferenceSaved(updated);
      } else {
        const created = await referenceService.createReference({
          workspaceId,
          projectId,
          title: title.trim(),
          referenceKind,
          targetUri: targetUri.trim(),
          annotation: annotation.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Reference "${created.title}" added.`, 'Reference Created');
        onReferenceSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save reference';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={reference ? 'Edit Reference / Citation' : 'Add Reference / Citation'}
      description={
        reference
          ? 'Update reference details, URI, or annotations.'
          : 'Track external specifications, docs, papers, or local resources.'
      }
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <Input
            label="Reference Title / Citation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. RFC 9110 HTTP Semantics Standard"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <Select
              label="Reference Type"
              value={referenceKind}
              onChange={(e) => setReferenceKind(e.target.value as ReferenceKind)}
              options={[
                { value: 'url', label: 'Web URL / Spec' },
                { value: 'file', label: 'Local File / PDF' },
                { value: 'citation', label: 'Academic Citation' },
                { value: 'internal', label: 'Internal Note / Doc' },
              ]}
            />

            <Input
              label="Target URI / Identifier"
              value={targetUri}
              onChange={(e) => setTargetUri(e.target.value)}
              placeholder="https://www.rfc-editor.org/rfc/rfc9110"
              required
            />
          </div>

          <Textarea
            label="Annotation / Context (Optional)"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            placeholder="Key quotes, relevant chapter, section, or usage context..."
            rows={3}
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
            disabled={!title.trim() || !targetUri.trim() || isSaving}
          >
            {reference ? 'Save Changes' : 'Add Reference'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
