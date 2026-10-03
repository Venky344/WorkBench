import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  EmptyState,
  LoadingState,
  ErrorState,
  Dialog,
  DialogFooter,
  Input,
  Textarea,
  Select,
} from '@/components/ui';
import { TagPicker } from '@/components/organization';
import {
  DecisionCard,
  DecisionDetailDialog,
  DecisionFilterBar,
  DecisionStatusFilter,
  DecisionSortOption,
} from '@/components/decisions';
import {
  useDecisionService,
  useProjectService,
  useTagService,
  useWorkspaceContext,
} from '@/app/providers';
import { Decision, Tag, Project, DecisionStatus } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { Plus, GitCommit } from 'lucide-react';

export const DecisionsPage: React.FC = () => {
  const { workspace } = useWorkspaceContext();
  const decisionService = useDecisionService();
  const projectService = useProjectService();
  const tagService = useTagService();

  const [decisions, setDecisions] = useState<readonly Decision[]>([]);
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DecisionStatusFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<DecisionSortOption>('created_desc');

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [detailDecision, setDetailDecision] = useState<Decision | null>(null);

  // Form states
  const [targetProjectId, setTargetProjectId] = useState<EntityId>('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('accepted');
  const [decisionText, setDecisionText] = useState('');
  const [rationale, setRationale] = useState('');
  const [implications, setImplications] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!workspace) return;
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedDecisions, fetchedProjects, fetchedTags] = await Promise.all([
        decisionService.listDecisionsByWorkspace(workspace.id),
        projectService.listProjects(workspace.id),
        tagService.listTags(workspace.id),
      ]);
      setDecisions(fetchedDecisions);
      setProjects(fetchedProjects);
      setTags(fetchedTags);
      setTargetProjectId((prev) => prev || (fetchedProjects[0]?.id ?? ''));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load workspace decisions';
      setError(msg);
      toast.error(msg, 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  }, [workspace, decisionService, projectService, tagService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateDialog = () => {
    setEditingDecision(null);
    setTitle('');
    setStatus('accepted');
    setDecisionText('');
    setRationale('');
    setImplications('');
    setSelectedTagIds([]);
    if (projects.length > 0 && projects[0]) {
      setTargetProjectId(projects[0].id);
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (decision: Decision) => {
    setEditingDecision(decision);
    setTargetProjectId(decision.projectId);
    setTitle(decision.title);
    setStatus(decision.status);
    setDecisionText(decision.decision);
    setRationale(decision.rationale);
    setImplications(decision.implications || '');
    setSelectedTagIds(decision.tags || []);
    setIsDialogOpen(true);
  };

  const handleDeleteDecision = async (decision: Decision) => {
    if (!window.confirm(`Are you sure you want to delete decision "${decision.title}"?`)) {
      return;
    }
    try {
      await decisionService.deleteDecision(decision.id, decision.projectId);
      setDecisions((prev) => prev.filter((d) => d.id !== decision.id));
      if (detailDecision?.id === decision.id) {
        setDetailDecision(null);
      }
      toast.success(`Decision "${decision.title}" deleted.`, 'Decision Deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete decision';
      toast.error(msg, 'Delete Error');
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !workspace ||
      !title.trim() ||
      !decisionText.trim() ||
      !rationale.trim() ||
      !targetProjectId
    )
      return;

    setIsSaving(true);
    try {
      if (editingDecision) {
        const updated = await decisionService.updateDecision(
          editingDecision.id,
          {
            title: title.trim(),
            status,
            decision: decisionText.trim(),
            rationale: rationale.trim(),
            implications: implications.trim() || null,
            tags: selectedTagIds,
          },
          editingDecision.projectId,
        );
        setDecisions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        if (detailDecision?.id === updated.id) {
          setDetailDecision(updated);
        }
        toast.success(`Decision "${updated.title}" updated.`, 'Decision Saved');
      } else {
        const created = await decisionService.createDecision({
          workspaceId: workspace.id,
          projectId: targetProjectId,
          title: title.trim(),
          status,
          decision: decisionText.trim(),
          rationale: rationale.trim(),
          implications: implications.trim() || undefined,
          tags: selectedTagIds,
        });
        setDecisions((prev) => [created, ...prev]);
        toast.success(`Decision "${created.title}" recorded.`, 'Decision Recorded');
      }
      setIsDialogOpen(false);
      setEditingDecision(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save decision';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  // Status counts
  const countsByStatus = useMemo(() => {
    let accepted = 0;
    let proposed = 0;
    let superseded = 0;
    let rejected = 0;

    for (const d of decisions) {
      if (d.status === 'accepted') accepted++;
      else if (d.status === 'proposed') proposed++;
      else if (d.status === 'superseded') superseded++;
      else if (d.status === 'rejected') rejected++;
    }

    return {
      all: decisions.length,
      accepted,
      proposed,
      superseded,
      rejected,
    };
  }, [decisions]);

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    for (const p of projects) {
      map.set(p.id, p.name);
    }
    return map;
  }, [projects]);

  // Filtered and sorted decisions
  const filteredDecisions = useMemo(() => {
    let result = [...decisions];

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      result = result.filter((d) => d.tags && d.tags.includes(tagFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.decision.toLowerCase().includes(q) ||
          d.rationale.toLowerCase().includes(q) ||
          (d.implications && d.implications.toLowerCase().includes(q)),
      );
    }

    return result.sort((a, b) => {
      if (sortOption === 'created_asc') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      if (sortOption === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [decisions, statusFilter, tagFilter, searchQuery, sortOption]);

  const isFormValid =
    title.trim().length > 0 &&
    decisionText.trim().length > 0 &&
    rationale.trim().length > 0 &&
    Boolean(targetProjectId);

  if (isLoading) {
    return <LoadingState message="Loading decision log..." />;
  }

  if (error) {
    return <ErrorState title="Error Loading Decisions" message={error} onRetry={loadData} />;
  }

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header */}
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
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            Decision Log
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Structured Architecture Decision Records (ADRs) across all workspace projects.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={openCreateDialog}
          disabled={projects.length === 0}
        >
          Record Decision
        </Button>
      </div>

      {decisions.length > 0 && (
        <DecisionFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          availableTags={tags}
          totalCount={decisions.length}
          countsByStatus={countsByStatus}
        />
      )}

      {/* Decision List or Empty State */}
      {filteredDecisions.length === 0 ? (
        <div style={{ padding: '2rem 0' }}>
          <EmptyState
            icon={<GitCommit size={36} />}
            title={
              decisions.length === 0 ? 'No decisions recorded' : 'No decisions match your filters'
            }
            description={
              decisions.length === 0
                ? projects.length === 0
                  ? 'Create a project first before logging decisions.'
                  : 'Document architectural patterns, choices, and trade-offs by recording your first decision.'
                : 'Try adjusting your search terms or status filters.'
            }
            actionLabel={
              decisions.length === 0 && projects.length > 0 ? 'Record First Decision' : undefined
            }
            onAction={decisions.length === 0 && projects.length > 0 ? openCreateDialog : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredDecisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              projectName={projectMap.get(decision.projectId)}
              tags={tags}
              onViewDetails={setDetailDecision}
              onEdit={openEditDialog}
              onDelete={handleDeleteDecision}
            />
          ))}
        </div>
      )}

      {/* Record / Edit Dialog */}
      {workspace && (
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={editingDecision ? 'Edit Decision Record' : 'Record New Decision'}
          description="Architectural Decision Record (ADR) capturing choice, rationale, and consequences."
          maxWidth="680px"
        >
          <form
            onSubmit={handleSubmitDecision}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: editingDecision ? '1fr 180px' : '1fr 1fr 180px',
                gap: '1rem',
              }}
            >
              {!editingDecision && (
                <Select
                  label="Project"
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  required
                />
              )}

              <Input
                label="Decision Title / ADR Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ADR-001: Adopt Local-First Architecture"
                required
              />

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                options={[
                  { value: 'proposed', label: 'Proposed' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'superseded', label: 'Superseded' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
            </div>

            <Textarea
              label="Decision (What was chosen?)"
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              placeholder="State the clear, actionable choice or architecture pattern adopted..."
              rows={3}
              required
            />

            <Textarea
              label="Context & Rationale (Why was this decision made?)"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain the background problem, alternatives evaluated, trade-offs, and reasons..."
              rows={4}
              required
            />

            <Textarea
              label="Consequences & Outcomes (Optional)"
              value={implications}
              onChange={(e) => setImplications(e.target.value)}
              placeholder="Document the technical impact, constraints, or subsequent work required..."
              rows={3}
            />

            <TagPicker
              workspaceId={workspace.id}
              selectedTagIds={selectedTagIds}
              onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
              label="Tags (Optional)"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={!isFormValid || isSaving}
              >
                {editingDecision ? 'Save Changes' : 'Record Decision'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* Full Record Details Modal */}
      <DecisionDetailDialog
        decision={detailDecision}
        isOpen={Boolean(detailDecision)}
        onClose={() => setDetailDecision(null)}
        onEdit={openEditDialog}
        tags={tags}
      />
    </div>
  );
};
