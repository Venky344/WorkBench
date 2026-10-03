import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Badge,
  LoadingState,
  ErrorState,
  Dialog,
  DialogFooter,
} from '@/components/ui';
import { TagPicker, TagBadge } from '@/components/organization';
import { useNoteService, useTagService } from '@/app/providers';
import { Note, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { ArrowLeft, Pin, Edit2, Trash2, Save, X, StickyNote, Calendar } from 'lucide-react';

export const ProjectNoteDetailPage: React.FC = () => {
  const { projectId, noteId } = useParams<{ projectId: string; noteId: string }>();
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const navigate = useNavigate();
  const noteService = useNoteService();
  const tagService = useTagService();

  const [note, setNote] = useState<Note | null>(null);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTagIds, setEditTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadNote = useCallback(async () => {
    if (!noteId || !projectId) return;
    setIsLoading(true);
    setNotFound(false);

    try {
      const [loadedNote, loadedTags] = await Promise.all([
        noteService.getNote(noteId),
        tagService.listTags(project.workspaceId),
      ]);

      if (!loadedNote || loadedNote.projectId !== projectId) {
        setNotFound(true);
        setNote(null);
      } else {
        setNote(loadedNote);
        setEditTitle(loadedNote.title);
        setEditContent(loadedNote.content);
        setEditTagIds(loadedNote.tags || []);
      }
      setTags(loadedTags);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, projectId, project.workspaceId, noteService, tagService]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = async () => {
    if (!note || !editTitle.trim()) return;
    setIsSaving(true);

    try {
      const updated = await noteService.updateNote(note.id, {
        title: editTitle.trim(),
        content: editContent,
        tags: editTagIds,
      });
      setNote(updated);
      setIsEditing(false);
      toast.success('Note updated successfully.', 'Saved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save note';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async () => {
    if (!note) return;
    try {
      const updated = await noteService.togglePin(note.id, project.id);
      setNote(updated);
      toast.success(
        updated.isPinned ? `Pinned "${updated.title}".` : `Unpinned "${updated.title}".`,
        'Pin Updated',
      );
    } catch {
      toast.error('Failed to update pin', 'Error');
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      await noteService.deleteNote(note.id, project.id);
      toast.success(`Note "${note.title}" deleted.`, 'Note Deleted');
      navigate(`/projects/${project.id}/notes`);
    } catch {
      toast.error('Failed to delete note', 'Error');
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading note details..." />;
  }

  if (notFound || !note) {
    return (
      <ErrorState
        title="Note Not Found"
        message="The note you requested could not be found in this project. It may have been deleted or moved."
        retryLabel="Back to Project Notes"
        onRetry={() => navigate(`/projects/${project.id}/notes`)}
      />
    );
  }

  const noteTags = tags.filter((t) => note.tags && note.tags.includes(t.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px' }}>
      {/* Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={15} />}
          onClick={() => navigate(`/projects/${project.id}/notes`)}
        >
          Back to Notes Directory
        </Button>

        {!project.isArchived && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<X size={15} />}
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(note.title);
                    setEditContent(note.content);
                    setEditTagIds(note.tags || []);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save size={15} />}
                  isLoading={isSaving}
                  onClick={handleSave}
                  disabled={!editTitle.trim()}
                >
                  Save Note
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={note.isPinned ? 'secondary' : 'ghost'}
                  size="sm"
                  leftIcon={<Pin size={15} />}
                  onClick={handleTogglePin}
                >
                  {note.isPinned ? 'Pinned' : 'Pin Note'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={15} />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Note
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={15} />}
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Note Document Surface */}
      <Card variant="default">
        <CardHeader>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <Input
                label="Note Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title..."
                required
              />
              <TagPicker
                workspaceId={project.workspaceId}
                selectedTagIds={editTagIds}
                onChange={(ids: readonly EntityId[], _t: readonly Tag[]) => setEditTagIds(ids)}
                label="Tags"
              />
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <StickyNote size={24} color="var(--wb-color-primary)" />
                  <CardTitle
                    style={{ fontSize: 'var(--wb-text-xl)', fontWeight: 'var(--wb-weight-bold)' }}
                  >
                    {note.title}
                  </CardTitle>
                </div>
                {note.isPinned && <Badge variant="primary">Pinned</Badge>}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-fg-muted)',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} />
                  Created {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>

              {noteTags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.375rem',
                    marginTop: '0.75rem',
                  }}
                >
                  {noteTags.map((t) => (
                    <TagBadge key={t.id} tag={t} size="sm" />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write Markdown or text content..."
              rows={18}
              style={{
                fontFamily: 'var(--wb-font-mono, monospace)',
                fontSize: 'var(--wb-text-xs)',
                lineHeight: 1.6,
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'var(--wb-font-sans)',
                minHeight: '200px',
              }}
            >
              {note.content || (
                <span style={{ color: 'var(--wb-color-fg-subtle)', fontStyle: 'italic' }}>
                  No content written yet. Click &quot;Edit Note&quot; to begin writing.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Note?"
        description={`Are you sure you want to delete note "${note.title}"?`}
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
              handleDelete();
            }}
          >
            Delete Note
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
