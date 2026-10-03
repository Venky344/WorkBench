import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { Button, EmptyState, LoadingState, ErrorState } from '@/components/ui';
import {
  DecisionCard,
  DecisionDialog,
  DecisionDetailDialog,
  DecisionFilterBar,
  DecisionStatusFilter,
  DecisionSortOption,
} from '@/components/decisions';
import { useDecisionService, useTagService, useWorkspaceContext } from '@/app/providers';
import { Decision, Tag } from '@/domain/entities';
import { toast } from '@/stores/toast.store';
import { Plus, GitCommit } from 'lucide-react';

export const ProjectDecisionsPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const { workspace } = useWorkspaceContext();
  const decisionService = useDecisionService();
  const tagService = useTagService();

  const [decisions, setDecisions] = useState<readonly Decision[]>([]);
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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedDecisions, fetchedTags] = await Promise.all([
        decisionService.listDecisionsByProject(project.id),
        workspace ? tagService.listTags(workspace.id) : Promise.resolve([]),
      ]);
      setDecisions(fetchedDecisions);
      setTags(fetchedTags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load project decisions';
      setError(msg);
      toast.error(msg, 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  }, [decisionService, tagService, project.id, workspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditDecision = (decision: Decision) => {
    setEditingDecision(decision);
    setIsDialogOpen(true);
  };

  const handleDeleteDecision = async (decision: Decision) => {
    if (!window.confirm(`Are you sure you want to delete decision "${decision.title}"?`)) {
      return;
    }
    try {
      await decisionService.deleteDecision(decision.id, project.id);
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

  const handleDecisionSaved = (savedDecision: Decision) => {
    setDecisions((prev) => {
      const exists = prev.some((d) => d.id === savedDecision.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDecision.id ? savedDecision : d));
      }
      return [savedDecision, ...prev];
    });
    if (detailDecision?.id === savedDecision.id) {
      setDetailDecision(savedDecision);
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

  // Filtered and sorted decisions
  const filteredDecisions = useMemo(() => {
    let result = [...decisions];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter((d) => d.tags && d.tags.includes(tagFilter));
    }

    // Search query
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

    // Sorting
    return result.sort((a, b) => {
      if (sortOption === 'created_asc') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      if (sortOption === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      // default: created_desc
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [decisions, statusFilter, tagFilter, searchQuery, sortOption]);

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
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            Architectural Decisions & Log
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Structured Architecture Decision Records (ADRs) and trade-offs for &quot;{project.name}
            &quot;.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditingDecision(null);
            setIsDialogOpen(true);
          }}
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
                ? `Capture meaningful architectural choices, technical context, and trade-offs for "${project.name}".`
                : 'Try adjusting your search terms or status filters.'
            }
            actionLabel={decisions.length === 0 ? 'Record First Decision' : undefined}
            onAction={
              decisions.length === 0
                ? () => {
                    setEditingDecision(null);
                    setIsDialogOpen(true);
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredDecisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              tags={tags}
              onViewDetails={setDetailDecision}
              onEdit={handleEditDecision}
              onDelete={handleDeleteDecision}
            />
          ))}
        </div>
      )}

      {/* Decision Editor Modal */}
      {workspace && (
        <DecisionDialog
          decision={editingDecision}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingDecision(null);
          }}
          workspaceId={workspace.id}
          projectId={project.id}
          onDecisionSaved={handleDecisionSaved}
        />
      )}

      {/* Full Decision Record Details Modal */}
      <DecisionDetailDialog
        decision={detailDecision}
        isOpen={Boolean(detailDecision)}
        onClose={() => setDetailDecision(null)}
        onEdit={handleEditDecision}
        tags={tags}
      />
    </div>
  );
};
