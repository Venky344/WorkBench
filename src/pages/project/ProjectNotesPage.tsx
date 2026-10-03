import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import {
  ResourceFilterBar,
  ResourceSortOption,
  NoteCard,
  NoteEditorDialog,
} from '@/components/resources';
import { useNoteService, useTagService } from '@/app/providers';
import { Note, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { Plus, StickyNote } from 'lucide-react';

export const ProjectNotesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const navigate = useNavigate();
  const noteService = useNoteService();
  const tagService = useTagService();

  const [notes, setNotes] = useState<readonly Note[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ResourceSortOption>('updated_desc');
  const [selectedTagId, setSelectedTagId] = useState<EntityId | null>(null);

  // Dialog state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const loadNotesAndTags = useCallback(async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const [loadedNotes, loadedTags] = await Promise.all([
        noteService.listNotesByProject(project.id),
        tagService.listTags(project.workspaceId),
      ]);
      setNotes(loadedNotes);
      setTags(loadedTags);
    } catch {
      toast.error('Failed to load project notes', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [noteService, tagService, project?.id, project?.workspaceId]);

  useEffect(() => {
    loadNotesAndTags();
  }, [loadNotesAndTags]);

  const handleDeleteNote = async (note: Note) => {
    try {
      await noteService.deleteNote(note.id, project.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      toast.success(`Note "${note.title}" deleted.`, 'Note Deleted');
    } catch {
      toast.error('Failed to delete note', 'Error');
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const updated = await noteService.togglePin(note.id, project.id);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      toast.success(
        updated.isPinned ? `Pinned "${updated.title}".` : `Unpinned "${updated.title}".`,
        'Pin Updated',
      );
    } catch {
      toast.error('Failed to toggle pin', 'Error');
    }
  };

  const handleNoteSaved = (saved: Note) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === saved.id);
      if (exists) {
        return prev.map((n) => (n.id === saved.id ? saved : n));
      }
      return [saved, ...prev];
    });
  };

  // Filter & sort notes (pinned notes always surfaced first if sorting by update/create)
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
      );
    }

    if (selectedTagId) {
      result = result.filter((n) => n.tags && n.tags.includes(selectedTagId));
    }

    result.sort((a, b) => {
      // If one is pinned and the other is not, pinned comes first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      switch (sort) {
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'updated_desc':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [notes, search, sort, selectedTagId]);

  if (isLoading) {
    return <LoadingState message="Loading notes..." />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header & Create Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-lg)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
            }}
          >
            Project Notes
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Markdown notes, technical specifications, and working scratchpads.
          </p>
        </div>

        {!project.isArchived && (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setEditingNote(null);
              setIsEditorOpen(true);
            }}
          >
            New Note
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      {notes.length > 0 && (
        <ResourceFilterBar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          availableTags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
          placeholder="Filter notes by title or content..."
          count={filteredNotes.length}
        />
      )}

      {/* Notes Grid or Empty State */}
      {notes.length === 0 ? (
        <div style={{ padding: '3rem 0' }}>
          <EmptyState
            icon={<StickyNote size={40} />}
            title="No notes yet"
            description="Create project notes, markdown specifications, or meeting minutes."
            actionLabel={!project.isArchived ? 'Create First Note' : undefined}
            onAction={
              !project.isArchived
                ? () => {
                    setEditingNote(null);
                    setIsEditorOpen(true);
                  }
                : undefined
            }
          />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ padding: '2rem 0' }}>
          <EmptyState
            title="No matching notes"
            description="Try adjusting your search query or tag filter."
            actionLabel="Clear Filters"
            actionVariant="ghost"
            onAction={() => {
              setSearch('');
              setSelectedTagId(null);
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              tags={tags}
              onOpen={(n) => navigate(`/projects/${project.id}/notes/${n.id}`)}
              onEdit={(n) => {
                setEditingNote(n);
                setIsEditorOpen(true);
              }}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteNote}
              isReadOnly={project.isArchived}
            />
          ))}
        </div>
      )}

      {/* Note Editor Dialog */}
      <NoteEditorDialog
        isOpen={isEditorOpen}
        note={editingNote}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onNoteSaved={handleNoteSaved}
      />
    </div>
  );
};
