import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Checkbox } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useNoteService } from '@/app/providers';
import { Note, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface NoteEditorDialogProps {
  readonly note?: Note | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onNoteSaved: (note: Note) => void;
}

export const NoteEditorDialog: React.FC<NoteEditorDialogProps> = ({
  note,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onNoteSaved,
}) => {
  const noteService = useNoteService();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setSelectedTagIds(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setSelectedTagIds([]);
    }
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      if (note) {
        const updated = await noteService.updateNote(note.id, {
          title: title.trim(),
          content,
          isPinned,
          tags: selectedTagIds,
        });
        toast.success(`Note "${updated.title}" updated.`, 'Note Saved');
        onNoteSaved(updated);
      } else {
        const created = await noteService.createNote({
          workspaceId,
          projectId,
          title: title.trim(),
          content,
          isPinned,
          tags: selectedTagIds,
        });
        toast.success(`Note "${created.title}" created.`, 'Note Created');
        onNoteSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save note';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={note ? 'Edit Note' : 'Create New Note'}
      description="Markdown notes, technical specifications, and working scratchpads."
      maxWidth="680px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          label="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Architecture Decisions & Technical Specs"
          required
        />

        <Textarea
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note in plain text or Markdown format..."
          rows={12}
          style={{
            fontFamily: 'var(--wb-font-mono, monospace)',
            fontSize: 'var(--wb-text-xs)',
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Checkbox
            id="pin-note-checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            label="Pin note to top of project directory"
          />
        </div>

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
            disabled={!title.trim() || isSaving}
          >
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
