import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, EntityType } from '@/domain/entities';
import { ProjectContextSummary } from '@/domain/brain';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Skeleton,
  EmptyState,
} from '@/components/ui';
import { useBrainService, useWorkspaceContext } from '@/app/providers';
import { toast } from '@/stores/toast.store';
import {
  getEntityTypeLabel,
  getRelationshipTypeBadgeVariant,
  getRelationshipTypeLabel,
} from './brain-utils';
import { ConnectedEntityCard } from './ConnectedEntityCard';
import { CreateConnectionDialog } from './CreateConnectionDialog';
import { EntityContextDialog } from './EntityContextDialog';
import {
  Network,
  Plus,
  Trash2,
  Search,
  MessageSquare,
  FileText,
  StickyNote,
  CheckSquare,
  GitCommit,
  Tag as TagIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface ProjectBrainContextPanelProps {
  readonly project: Project;
}

export const ProjectBrainContextPanel: React.FC<ProjectBrainContextPanelProps> = ({ project }) => {
  const { workspace } = useWorkspaceContext();
  const brainService = useBrainService();

  const [contextSummary, setContextSummary] = useState<ProjectContextSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states for the Related Items Explorer
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectedEntity, setInspectedEntity] = useState<{
    type: EntityType;
    id: string;
  } | null>(null);

  const loadProjectContext = useCallback(async () => {
    if (!workspace) return;
    setIsLoading(true);
    setError(null);
    try {
      const summary = await brainService.getProjectContext(workspace.id, project.id);
      setContextSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project context');
    } finally {
      setIsLoading(false);
    }
  }, [workspace, project.id, brainService]);

  useEffect(() => {
    void loadProjectContext();
  }, [loadProjectContext]);

  const handleDeleteRelationship = async (relId: string) => {
    if (!workspace) return;
    try {
      const success = await brainService.unlinkRelationship(workspace.id, relId);
      if (success) {
        toast.success('Connection removed from Brain.', 'Unlinked');
        void loadProjectContext();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete connection', 'Error');
    }
  };

  // Filtered items in the explorer
  const filteredItems = useMemo(() => {
    if (!contextSummary) return [];
    let items = contextSummary.recentItems;

    if (filterType !== 'all') {
      items = items.filter((item) => item.entityType === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [contextSummary, filterType, searchQuery]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="140px" />
        <Skeleton height="200px" />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (error || !contextSummary) {
    return (
      <Card variant="default" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--wb-color-destructive)', margin: 0 }}>
          {error ?? 'Project context unavailable'}
        </p>
        <Button
          variant="outline"
          size="sm"
          style={{ marginTop: '1rem' }}
          onClick={() => void loadProjectContext()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  const { counts, tasksSummary, decisionsSummary, explicitRelationships, projectTags } =
    contextSummary;

  return (
    <div
      className="wb-project-brain-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Overview Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
        }}
      >
        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <MessageSquare size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)' }}>Chats</span>
          </div>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            {counts.chats}
          </p>
        </Card>

        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <FileText size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)' }}>Files</span>
          </div>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            {counts.files}
          </p>
        </Card>

        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <StickyNote size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)' }}>Notes</span>
          </div>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            {counts.notes}
          </p>
        </Card>

        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <CheckSquare size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)' }}>Tasks</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.375rem',
              marginTop: '0.5rem',
            }}
          >
            <span style={{ fontSize: 'var(--wb-text-2xl)', fontWeight: 'var(--wb-weight-bold)' }}>
              {counts.tasks}
            </span>
            {tasksSummary.overdue > 0 && (
              <Badge variant="destructive">{tasksSummary.overdue} overdue</Badge>
            )}
          </div>
        </Card>

        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <GitCommit size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)' }}>ADRs / Decisions</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.375rem',
              marginTop: '0.5rem',
            }}
          >
            <span style={{ fontSize: 'var(--wb-text-2xl)', fontWeight: 'var(--wb-weight-bold)' }}>
              {counts.decisions}
            </span>
            {decisionsSummary.accepted > 0 && (
              <Badge variant="success">{decisionsSummary.accepted} accepted</Badge>
            )}
          </div>
        </Card>

        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-primary)',
            }}
          >
            <Sparkles size={16} />
            <span style={{ fontSize: 'var(--wb-text-xs)', fontWeight: 'var(--wb-weight-medium)' }}>
              Brain Links
            </span>
          </div>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
              color: 'var(--wb-color-primary)',
            }}
          >
            {counts.explicitRelationships}
          </p>
        </Card>
      </div>

      {/* Project Tags Bar */}
      {projectTags.length > 0 && (
        <Card variant="default" style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.625rem',
            }}
          >
            <TagIcon size={15} color="var(--wb-color-fg-muted)" />
            <span
              style={{
                fontSize: 'var(--wb-text-sm)',
                fontWeight: 'var(--wb-weight-medium)',
                color: 'var(--wb-color-fg)',
              }}
            >
              Connected Project Tags ({projectTags.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {projectTags.map((tag) => (
              <Badge key={tag.id} variant="neutral" badgeStyle="subtle">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Explicit Relational Graph Section */}
      <Card variant="default">
        <CardHeader
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--wb-color-border-subtle)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: 'var(--wb-radius-md)',
                backgroundColor: 'var(--wb-color-surface-active)',
                color: 'var(--wb-color-primary)',
              }}
            >
              <Network size={16} />
            </div>
            <div>
              <CardTitle style={{ fontSize: 'var(--wb-text-base)', margin: 0 }}>
                Explicit Brain Connections
              </CardTitle>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Connect Entities
          </Button>
        </CardHeader>

        <CardContent style={{ paddingTop: '1rem' }}>
          {explicitRelationships.length === 0 ? (
            <EmptyState
              title="No explicit connections yet"
              description="Create typed connections between chats, notes, tasks, decisions, and files to structure your project context."
              actionLabel="Create First Connection"
              onAction={() => setIsCreateOpen(true)}
              actionVariant="outline"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {explicitRelationships.map((detail) => (
                <div
                  key={detail.relationship.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--wb-radius-md)',
                    backgroundColor: 'var(--wb-color-bg-subtle)',
                    border: '1px solid var(--wb-color-border-subtle)',
                    gap: '1rem',
                  }}
                >
                  {/* Source */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Badge variant="neutral" badgeStyle="subtle">
                      {getEntityTypeLabel(detail.source.entityType)}
                    </Badge>
                    <span
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-medium)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={detail.source.title}
                    >
                      {detail.source.title}
                    </span>
                  </div>

                  {/* Edge Type */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowRight size={14} color="var(--wb-color-fg-subtle)" />
                    <Badge
                      variant={getRelationshipTypeBadgeVariant(
                        detail.relationship.relationshipType,
                      )}
                    >
                      {getRelationshipTypeLabel(detail.relationship.relationshipType)}
                    </Badge>
                    <ArrowRight size={14} color="var(--wb-color-fg-subtle)" />
                  </div>

                  {/* Target */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Badge variant="neutral" badgeStyle="subtle">
                      {getEntityTypeLabel(detail.target.entityType)}
                    </Badge>
                    <span
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-medium)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={detail.target.title}
                    >
                      {detail.target.title}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Inspect Source Context"
                      onClick={() =>
                        setInspectedEntity({
                          type: detail.source.entityType,
                          id: detail.source.entityId,
                        })
                      }
                    >
                      <Network size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete Connection"
                      onClick={() => void handleDeleteRelationship(detail.relationship.id)}
                    >
                      <Trash2 size={14} color="var(--wb-color-destructive)" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Resources Explorer */}
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--wb-text-base)',
                fontWeight: 'var(--wb-weight-semibold)',
              }}
            >
              Connected Resources Explorer
            </h3>
            <p
              style={{
                margin: '0.125rem 0 0 0',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-muted)',
              }}
            >
              Inspect explainable relationships across all resources in this project
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ width: '180px' }}>
              <Select
                id="brain-filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Resource Types</option>
                <option value="chat">Chats</option>
                <option value="file">Files</option>
                <option value="note">Notes</option>
                <option value="link">Links</option>
                <option value="bookmark">Bookmarks</option>
                <option value="code_snippet">Code Snippets</option>
                <option value="task">Tasks</option>
                <option value="decision">Decisions</option>
              </Select>
            </div>

            <div style={{ width: '220px' }}>
              <Input
                id="brain-search-input"
                type="search"
                placeholder="Search connected items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={14} />}
              />
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="No matching resources"
            description="No items found matching the current search query or resource filter."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredItems.map((item) => (
              <ConnectedEntityCard
                key={`${item.entityType}:${item.entityId}`}
                entity={item}
                onInspectContext={(ent) =>
                  setInspectedEntity({ type: ent.entityType, id: ent.entityId })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Connection Dialog */}
      <CreateConnectionDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={project.id}
        onConnectionCreated={() => void loadProjectContext()}
      />

      {/* Entity Context Inspection Modal */}
      {inspectedEntity && (
        <EntityContextDialog
          isOpen={!!inspectedEntity}
          onClose={() => setInspectedEntity(null)}
          entityType={inspectedEntity.type}
          entityId={inspectedEntity.id}
        />
      )}
    </div>
  );
};
