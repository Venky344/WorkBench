import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Input, Select, EmptyState, Dialog, DialogFooter } from '@/components/ui';
import { MemoryItem, MemoryType, MemoryImportance, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { useMemoryService, useTagService } from '@/app/providers';
import { toast } from '@/stores/toast.store';
import { MemoryItemCard } from './MemoryItemCard';
import { CreateEditMemoryDialog } from './CreateEditMemoryDialog';
import { MemoryDetailDialog } from './MemoryDetailDialog';
import { getMemoryTypeInfo, isMemoryDueForReview } from './memory-utils';
import { BrainCircuit, Plus, Layers, Archive, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ProjectMemoryPanelProps {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
}

type TabType = 'all' | 'grouped' | 'review' | 'archived';
type SortOption = 'updated_desc' | 'importance_desc' | 'title_asc' | 'review_asc';

export const ProjectMemoryPanel: React.FC<ProjectMemoryPanelProps> = ({
  workspaceId,
  projectId,
}) => {
  const memoryService = useMemoryService();
  const tagService = useTagService();
  const navigate = useNavigate();

  const [memories, setMemories] = useState<readonly MemoryItem[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [selectedTagId, setSelectedTagId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [viewingMemory, setViewingMemory] = useState<MemoryItem | null>(null);
  const [deletingMemory, setDeletingMemory] = useState<MemoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId || !workspaceId) return;
    setIsLoading(true);
    try {
      const [allMemories, allTags] = await Promise.all([
        memoryService.listMemoriesByProject(projectId),
        tagService.listTags(workspaceId).catch(() => []),
      ]);
      setMemories(allMemories);
      setTags(allTags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load project memory';
      toast.error(msg, 'Load Error');
    } finally {
      setIsLoading(false);
    }
  }, [memoryService, tagService, projectId, workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summaries
  const activeMemories = useMemo(() => memories.filter((m) => m.status === 'active'), [memories]);

  const archivedMemories = useMemo(
    () => memories.filter((m) => m.status === 'archived'),
    [memories],
  );

  const reviewDueMemories = useMemo(
    () => activeMemories.filter((m) => isMemoryDueForReview(m.reviewDate)),
    [activeMemories],
  );

  const highImportanceCount = useMemo(
    () =>
      activeMemories.filter((m) => m.importance === 'critical' || m.importance === 'high').length,
    [activeMemories],
  );

  // Filter & Sort
  const filteredMemories = useMemo(() => {
    let list = activeTab === 'archived' ? [...archivedMemories] : [...activeMemories];

    if (activeTab === 'review') {
      list = list.filter((m) => isMemoryDueForReview(m.reviewDate));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    if (selectedType !== 'all') {
      list = list.filter((m) => m.type === selectedType);
    }

    if (selectedImportance !== 'all') {
      list = list.filter((m) => m.importance === selectedImportance);
    }

    if (selectedTagId !== 'all') {
      list = list.filter((m) => m.tags && m.tags.includes(selectedTagId));
    }

    // Sort
    const importanceWeight: Record<MemoryImportance, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    list.sort((a, b) => {
      if (sortBy === 'importance_desc') {
        const diff = importanceWeight[b.importance] - importanceWeight[a.importance];
        if (diff !== 0) return diff;
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'review_asc') {
        const dateA = a.reviewDate ? Date.parse(a.reviewDate) : Infinity;
        const dateB = b.reviewDate ? Date.parse(b.reviewDate) : Infinity;
        return dateA - dateB;
      }
      // default: updated_desc
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    });

    return list;
  }, [
    activeTab,
    activeMemories,
    archivedMemories,
    searchQuery,
    selectedType,
    selectedImportance,
    selectedTagId,
    sortBy,
  ]);

  // Grouped by Type map
  const groupedByType = useMemo(() => {
    const groups: Record<MemoryType, MemoryItem[]> = {
      fact: [],
      goal: [],
      constraint: [],
      preference: [],
      decision: [],
      key_context: [],
      note: [],
    };

    filteredMemories.forEach((m) => {
      if (groups[m.type]) {
        groups[m.type].push(m);
      } else {
        groups.note.push(m);
      }
    });

    return groups;
  }, [filteredMemories]);

  // Actions
  const handleArchive = async (memory: MemoryItem) => {
    try {
      const updated = await memoryService.archiveMemory(memory.id, projectId);
      toast.success(`Memory "${updated.title}" archived.`, 'Memory Archived');
      setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Archive failed', 'Error');
    }
  };

  const handleRestore = async (memory: MemoryItem) => {
    try {
      const updated = await memoryService.restoreMemory(memory.id, projectId);
      toast.success(`Memory "${updated.title}" restored.`, 'Memory Restored');
      setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Restore failed', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMemory) return;
    setIsDeleting(true);
    try {
      await memoryService.deleteMemory(deletingMemory.id, projectId);
      toast.success(`Memory "${deletingMemory.title}" deleted.`, 'Memory Deleted');
      setMemories((prev) => prev.filter((m) => m.id !== deletingMemory.id));
      setDeletingMemory(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateToSource = (entityType: string, entityId: string) => {
    switch (entityType) {
      case 'chat':
        navigate(`/projects/${projectId}/chats/${entityId}`);
        break;
      case 'note':
        navigate(`/projects/${projectId}/notes/${entityId}`);
        break;
      case 'file':
        navigate(`/projects/${projectId}/files`);
        break;
      case 'task':
        navigate(`/projects/${projectId}/tasks`);
        break;
      case 'decision':
        navigate(`/projects/${projectId}/decisions`);
        break;
      case 'link':
      case 'bookmark':
      case 'code_snippet':
      case 'reference':
        navigate(`/projects/${projectId}/resources`);
        break;
      default:
        navigate(`/projects/${projectId}`);
        break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--wb-radius-md, 8px)',
            backgroundColor: 'var(--wb-color-bg-card, #ffffff)',
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--wb-radius-sm, 6px)',
              backgroundColor: 'var(--wb-color-primary-subtle, rgba(99,102,241,0.1))',
              color: 'var(--wb-color-primary, #6366f1)',
            }}
          >
            <BrainCircuit size={20} />
          </div>
          <div>
            <div
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wb-color-fg-primary)' }}
            >
              {activeMemories.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>
              Active Context Items
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--wb-radius-md, 8px)',
            backgroundColor: 'var(--wb-color-bg-card, #ffffff)',
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--wb-radius-sm, 6px)',
              backgroundColor:
                reviewDueMemories.length > 0
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'var(--wb-color-bg-secondary, rgba(0,0,0,0.05))',
              color:
                reviewDueMemories.length > 0
                  ? 'var(--wb-color-warning, #f59e0b)'
                  : 'var(--wb-color-fg-muted)',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wb-color-fg-primary)' }}
            >
              {reviewDueMemories.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>
              Needs Review
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--wb-radius-md, 8px)',
            backgroundColor: 'var(--wb-color-bg-card, #ffffff)',
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--wb-radius-sm, 6px)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--wb-color-destructive, #ef4444)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wb-color-fg-primary)' }}
            >
              {highImportanceCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>
              High / Critical Priority
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--wb-radius-md, 8px)',
            backgroundColor: 'var(--wb-color-bg-card, #ffffff)',
            border: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--wb-radius-sm, 6px)',
              backgroundColor: 'var(--wb-color-bg-secondary, rgba(0,0,0,0.05))',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <Archive size={20} />
          </div>
          <div>
            <div
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wb-color-fg-primary)' }}
            >
              {archivedMemories.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>Archived</div>
          </div>
        </div>
      </div>

      {/* Tabs & Add Memory Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All Active ({activeMemories.length})
          </Button>
          <Button
            variant={activeTab === 'grouped' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('grouped')}
          >
            <Layers size={14} style={{ marginRight: '0.25rem' }} /> Grouped by Type
          </Button>
          <Button
            variant={activeTab === 'review' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('review')}
            style={{
              color:
                activeTab !== 'review' && reviewDueMemories.length > 0
                  ? 'var(--wb-color-warning, #f59e0b)'
                  : undefined,
            }}
          >
            <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} /> Needs Review (
            {reviewDueMemories.length})
          </Button>
          <Button
            variant={activeTab === 'archived' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('archived')}
          >
            <Archive size={14} style={{ marginRight: '0.25rem' }} /> Archive (
            {archivedMemories.length})
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingMemory(null);
            setIsCreateOpen(true);
          }}
        >
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> Add Memory
        </Button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Search memory title, content, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={[
            { value: 'all', label: 'All Memory Types' },
            { value: 'fact', label: 'Facts' },
            { value: 'goal', label: 'Goals' },
            { value: 'constraint', label: 'Constraints' },
            { value: 'preference', label: 'Preferences' },
            { value: 'decision', label: 'Decisions' },
            { value: 'key_context', label: 'Key Context' },
            { value: 'note', label: 'Notes' },
          ]}
        />

        <Select
          value={selectedImportance}
          onChange={(e) => setSelectedImportance(e.target.value)}
          options={[
            { value: 'all', label: 'All Importance' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />

        <Select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
          options={[
            { value: 'all', label: 'All Tags' },
            ...tags.map((t) => ({ value: t.id, label: `#${t.name}` })),
          ]}
        />

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          options={[
            { value: 'updated_desc', label: 'Sort: Recently Updated' },
            { value: 'importance_desc', label: 'Sort: Importance' },
            { value: 'title_asc', label: 'Sort: Title A-Z' },
            { value: 'review_asc', label: 'Sort: Review Date' },
          ]}
        />
      </div>

      {/* Memory Content Area */}
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--wb-color-fg-muted)' }}>
          Loading project memory...
        </div>
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          icon={
            activeTab === 'archived' ? (
              <Archive size={24} />
            ) : activeTab === 'review' ? (
              <AlertTriangle size={24} />
            ) : (
              <BrainCircuit size={24} />
            )
          }
          title={
            activeTab === 'archived'
              ? 'No Archived Memories'
              : activeTab === 'review'
                ? 'No Memories Due For Review'
                : searchQuery ||
                    selectedType !== 'all' ||
                    selectedImportance !== 'all' ||
                    selectedTagId !== 'all'
                  ? 'No Matching Memories'
                  : 'No Project Memory Recorded'
          }
          description={
            activeTab === 'archived'
              ? 'Archived project memory items will appear here.'
              : activeTab === 'review'
                ? 'All project memories are up to date and within their review schedule.'
                : searchQuery ||
                    selectedType !== 'all' ||
                    selectedImportance !== 'all' ||
                    selectedTagId !== 'all'
                  ? 'Try clearing or changing your filters to see more results.'
                  : 'Preserve crucial facts, goals, constraints, preferences, or orientation notes so you never lose context.'
          }
          actionLabel={
            activeTab !== 'archived' && activeTab !== 'review' ? 'Create First Memory' : undefined
          }
          onAction={
            activeTab !== 'archived' && activeTab !== 'review'
              ? () => {
                  setEditingMemory(null);
                  setIsCreateOpen(true);
                }
              : undefined
          }
        />
      ) : activeTab === 'grouped' ? (
        // Grouped by Type View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(
            [
              'fact',
              'goal',
              'constraint',
              'preference',
              'decision',
              'key_context',
              'note',
            ] as MemoryType[]
          ).map((type) => {
            const items = groupedByType[type];
            if (!items || items.length === 0) return null;
            const typeInfo = getMemoryTypeInfo(type);
            const TypeIcon = typeInfo.icon;

            return (
              <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingBottom: '0.375rem',
                    borderBottom: '1px solid var(--wb-color-border-subtle, rgba(0,0,0,0.08))',
                  }}
                >
                  <span
                    style={{ color: typeInfo.color, display: 'inline-flex', alignItems: 'center' }}
                  >
                    <TypeIcon size={18} />
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {typeInfo.label}s ({items.length})
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--wb-color-fg-muted)' }}>
                    • {typeInfo.description}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {items.map((item) => (
                    <MemoryItemCard
                      key={item.id}
                      memory={item}
                      tags={tags}
                      onViewDetails={(m) => setViewingMemory(m)}
                      onEdit={(m) => {
                        setEditingMemory(m);
                        setIsCreateOpen(true);
                      }}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onDelete={(m) => setDeletingMemory(m)}
                      onNavigateToSource={handleNavigateToSource}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat List View (All / Needs Review / Archived)
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredMemories.map((item) => (
            <MemoryItemCard
              key={item.id}
              memory={item}
              tags={tags}
              onViewDetails={(m) => setViewingMemory(m)}
              onEdit={(m) => {
                setEditingMemory(m);
                setIsCreateOpen(true);
              }}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={(m) => setDeletingMemory(m)}
              onNavigateToSource={handleNavigateToSource}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <CreateEditMemoryDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingMemory(null);
        }}
        workspaceId={workspaceId}
        projectId={projectId}
        memory={editingMemory}
        onMemorySaved={(saved) => {
          setMemories((prev) => {
            const exists = prev.some((m) => m.id === saved.id);
            if (exists) {
              return prev.map((m) => (m.id === saved.id ? saved : m));
            }
            return [saved, ...prev];
          });
        }}
      />

      {/* View Detail Dialog */}
      <MemoryDetailDialog
        isOpen={!!viewingMemory}
        onClose={() => setViewingMemory(null)}
        memory={viewingMemory}
        tags={tags}
        onEdit={(m) => {
          setViewingMemory(null);
          setEditingMemory(m);
          setIsCreateOpen(true);
        }}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={(m) => {
          setViewingMemory(null);
          setDeletingMemory(m);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deletingMemory}
        onClose={() => setDeletingMemory(null)}
        title="Delete Project Memory"
        description="Are you sure you want to permanently delete this memory item? This action cannot be undone."
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{deletingMemory?.title}</p>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--wb-color-fg-muted)',
              marginTop: '0.25rem',
            }}
          >
            {deletingMemory?.content}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeletingMemory(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Memory'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
