import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useMemoryService, useServices } from '@/app/providers';
import {
  MemoryItem,
  MemoryType,
  MemoryImportance,
  MemorySourceReference,
  EntityType,
} from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

export interface CreateEditMemoryDialogProps {
  readonly memory?: MemoryItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onMemorySaved: (memory: MemoryItem) => void;
}

interface AvailableSourceItem {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly title: string;
}

export const CreateEditMemoryDialog: React.FC<CreateEditMemoryDialogProps> = ({
  memory,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onMemorySaved,
}) => {
  const memoryService = useMemoryService();
  const services = useServices();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MemoryType>('fact');
  const [importance, setImportance] = useState<MemoryImportance>('medium');
  const [content, setContent] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [sourceReferences, setSourceReferences] = useState<MemorySourceReference[]>([]);

  const [availableSources, setAvailableSources] = useState<AvailableSourceItem[]>([]);
  const [selectedSourceKey, setSelectedSourceKey] = useState('');
  const [sourceExcerpt, setSourceExcerpt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load available project source entities for reference attachment
  useEffect(() => {
    if (!isOpen || !projectId) return;

    let mounted = true;
    const loadProjectSources = async () => {
      try {
        const [chats, notes, files, links, bookmarks, references, snippets, tasks, decisions] =
          await Promise.all([
            services.chatService.listChats(projectId).catch(() => []),
            services.noteService.listNotesByProject(projectId).catch(() => []),
            services.fileService.listFilesByProject(projectId).catch(() => []),
            services.linkService.listLinksByProject(projectId).catch(() => []),
            services.bookmarkService.listBookmarksByProject(projectId).catch(() => []),
            services.referenceService.listReferencesByProject(projectId).catch(() => []),
            services.codeSnippetService.listCodeSnippetsByProject(projectId).catch(() => []),
            services.taskService.listTasksByProject(projectId).catch(() => []),
            services.decisionService.listDecisionsByProject(projectId).catch(() => []),
          ]);

        if (!mounted) return;

        const items: AvailableSourceItem[] = [
          ...chats.map((c: { id: string; title: string }) => ({
            entityType: 'chat' as EntityType,
            entityId: c.id,
            title: `Chat: ${c.title}`,
          })),
          ...notes.map((n: { id: string; title: string }) => ({
            entityType: 'note' as EntityType,
            entityId: n.id,
            title: `Note: ${n.title}`,
          })),
          ...files.map((f: { id: string; originalFilename?: string; name: string }) => ({
            entityType: 'file' as EntityType,
            entityId: f.id,
            title: `File: ${f.originalFilename || f.name}`,
          })),
          ...links.map((l: { id: string; title?: string; url: string }) => ({
            entityType: 'link' as EntityType,
            entityId: l.id,
            title: `Link: ${l.title || l.url}`,
          })),
          ...bookmarks.map((b: { id: string; title?: string; targetUrl?: string }) => ({
            entityType: 'bookmark' as EntityType,
            entityId: b.id,
            title: `Bookmark: ${b.title || b.targetUrl || 'Bookmark'}`,
          })),
          ...references.map((r: { id: string; title: string }) => ({
            entityType: 'reference' as EntityType,
            entityId: r.id,
            title: `Reference: ${r.title}`,
          })),
          ...snippets.map((s: { id: string; title?: string; language: string }) => ({
            entityType: 'code_snippet' as EntityType,
            entityId: s.id,
            title: `Snippet: ${s.title || s.language}`,
          })),
          ...tasks.map((t: { id: string; title: string }) => ({
            entityType: 'task' as EntityType,
            entityId: t.id,
            title: `Task: ${t.title}`,
          })),
          ...decisions.map((d: { id: string; title: string }) => ({
            entityType: 'decision' as EntityType,
            entityId: d.id,
            title: `Decision: ${d.title}`,
          })),
        ];

        setAvailableSources(items);
      } catch {
        // ignore load errors
      }
    };

    loadProjectSources();

    return () => {
      mounted = false;
    };
  }, [isOpen, projectId, services]);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setType(memory.type);
      setImportance(memory.importance);
      setContent(memory.content);
      setReviewDate(memory.reviewDate || '');
      setSelectedTagIds(memory.tags || []);
      setSourceReferences(memory.sourceReferences ? [...memory.sourceReferences] : []);
    } else {
      setTitle('');
      setType('fact');
      setImportance('medium');
      setContent('');
      setReviewDate('');
      setSelectedTagIds([]);
      setSourceReferences([]);
    }
    setSelectedSourceKey('');
    setSourceExcerpt('');
  }, [memory, isOpen]);

  const handleAddSource = () => {
    if (!selectedSourceKey) return;
    const [entityType, entityId] = selectedSourceKey.split(':');
    if (!entityType || !entityId) return;

    const sourceItem = availableSources.find(
      (s) => s.entityType === entityType && s.entityId === entityId,
    );

    // Prevent duplicate source reference
    const exists = sourceReferences.some(
      (s) => s.entityType === entityType && s.entityId === entityId,
    );
    if (exists) {
      toast.info('This source entity is already referenced.', 'Already Added');
      return;
    }

    const newRef: MemorySourceReference = {
      entityType: entityType as EntityType,
      entityId,
      title: sourceItem?.title || undefined,
      excerpt: sourceExcerpt.trim() || undefined,
    };

    setSourceReferences([...sourceReferences, newRef]);
    setSelectedSourceKey('');
    setSourceExcerpt('');
  };

  const handleRemoveSource = (index: number) => {
    setSourceReferences(sourceReferences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      if (memory) {
        const updated = await memoryService.updateMemory(
          memory.id,
          {
            title: title.trim(),
            content: content.trim(),
            type,
            importance,
            reviewDate: reviewDate ? reviewDate : null,
            tags: selectedTagIds,
            sourceReferences,
          },
          projectId,
        );
        toast.success(`Memory "${updated.title}" updated.`, 'Memory Saved');
        onMemorySaved(updated);
      } else {
        const created = await memoryService.createMemory({
          workspaceId,
          projectId,
          title: title.trim(),
          content: content.trim(),
          type,
          importance,
          reviewDate: reviewDate ? reviewDate : undefined,
          tags: selectedTagIds,
          sourceReferences,
        });
        toast.success(`Memory "${created.title}" created.`, 'Memory Recorded');
        onMemorySaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save memory';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={memory ? 'Edit Project Memory' : 'Create Project Memory'}
      description={
        memory
          ? 'Update the preserved context, importance, review date, or source provenance.'
          : 'Preserve an important fact, goal, constraint, preference, or context note for this project.'
      }
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Title */}
        <Input
          label="Title *"
          placeholder="e.g. Primary database is PostgreSQL 16 on AWS Aurora"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Type & Importance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Type *"
            value={type}
            onChange={(e) => setType(e.target.value as MemoryType)}
            options={[
              { value: 'fact', label: 'Fact — Verified reality' },
              { value: 'goal', label: 'Goal — Target outcome / criteria' },
              { value: 'constraint', label: 'Constraint — Limitation or rule' },
              { value: 'preference', label: 'Preference — Team convention' },
              { value: 'decision', label: 'Decision — Core architectural choice' },
              { value: 'key_context', label: 'Key Context — Vital orientation' },
              { value: 'note', label: 'Note — Deliberate context note' },
            ]}
          />

          <Select
            label="Importance *"
            value={importance}
            onChange={(e) => setImportance(e.target.value as MemoryImportance)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
          />
        </div>

        {/* Content */}
        <Textarea
          label="Memory Content *"
          placeholder="Describe the context clearly and deliberately. What should anyone returning to this project know?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />

        {/* Review Date */}
        <Input
          label="Review Date (Optional)"
          type="date"
          value={reviewDate}
          onChange={(e) => setReviewDate(e.target.value)}
          helperText="Flag this memory for review on or after this date (e.g. quarterly check or after roadmap milestone)."
        />

        {/* Source References Attachment */}
        <div
          style={{
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            borderRadius: 'var(--wb-radius-md, 6px)',
            padding: '0.75rem',
            backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.02))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--wb-text-sm, 0.875rem)',
              fontWeight: 'var(--wb-weight-semibold, 600)',
              marginBottom: '0.5rem',
              color: 'var(--wb-color-fg-primary)',
            }}
          >
            <LinkIcon size={14} />
            <span>Source Entity Provenance (Optional)</span>
          </div>

          {sourceReferences.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                marginBottom: '0.75rem',
              }}
            >
              {sourceReferences.map((ref, idx) => (
                <div
                  key={`${ref.entityType}:${ref.entityId}:${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: 'var(--wb-color-bg-primary, #ffffff)',
                    border: '1px solid var(--wb-color-border, rgba(0,0,0,0.1))',
                    borderRadius: 'var(--wb-radius-sm, 4px)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>
                      {ref.title || `${ref.entityType} (${ref.entityId.slice(0, 8)})`}
                    </span>
                    {ref.excerpt && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>
                        &ldquo;{ref.excerpt}&rdquo;
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSource(idx)}
                    title="Remove Source Reference"
                    aria-label="Remove source reference"
                    style={{ color: 'var(--wb-color-destructive, #ef4444)' }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {availableSources.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '0.5rem',
                  alignItems: 'end',
                }}
              >
                <Select
                  value={selectedSourceKey}
                  onChange={(e) => setSelectedSourceKey(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Project Record as Source --' },
                    ...availableSources.map((s) => ({
                      value: `${s.entityType}:${s.entityId}`,
                      label: s.title,
                    })),
                  ]}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSource}
                  disabled={!selectedSourceKey}
                  style={{ height: '36px' }}
                >
                  <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Source
                </Button>
              </div>
              {selectedSourceKey && (
                <Input
                  placeholder="Optional excerpt or note explaining this reference..."
                  value={sourceExcerpt}
                  onChange={(e) => setSourceExcerpt(e.target.value)}
                />
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: 'var(--wb-color-fg-muted)' }}>
              No other records found in this project to link as sources.
            </div>
          )}
        </div>

        {/* Tags */}
        <TagPicker
          workspaceId={workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(newIds) => setSelectedTagIds(newIds)}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isFormValid || isSaving}>
            {isSaving ? 'Saving...' : memory ? 'Save Changes' : 'Create Memory'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
