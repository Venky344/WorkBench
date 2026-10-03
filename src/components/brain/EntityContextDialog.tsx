import React, { useState, useEffect } from 'react';
import { EntityType } from '@/domain/entities';
import { EntityContextSummary, ConnectedEntity } from '@/domain/brain';
import { EntityId } from '@/types';
import { Dialog, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { useBrainService, useWorkspaceContext } from '@/app/providers';
import {
  getEntityTypeIcon,
  getEntityTypeLabel,
  getRelationshipTypeBadgeVariant,
  getRelationshipTypeLabel,
} from './brain-utils';
import { ConnectedEntityCard } from './ConnectedEntityCard';
import { ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';

export interface EntityContextDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly entityType?: EntityType;
  readonly entityId?: EntityId;
  readonly onNavigateToEntity?: (entity: ConnectedEntity) => void;
}

export const EntityContextDialog: React.FC<EntityContextDialogProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
}) => {
  const { workspace } = useWorkspaceContext();
  const brainService = useBrainService();

  const [contextData, setContextData] = useState<EntityContextSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Target entity currently being inspected
  const [activeTarget, setActiveTarget] = useState<{
    type: EntityType;
    id: EntityId;
  } | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      setActiveTarget({ type: entityType, id: entityId });
    } else {
      setActiveTarget(null);
    }
  }, [entityType, entityId, isOpen]);

  useEffect(() => {
    if (!isOpen || !workspace || !activeTarget) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadContext = async () => {
      try {
        const data = await brainService.getEntityContext(
          workspace.id,
          activeTarget.type,
          activeTarget.id,
        );
        if (isMounted) {
          setContextData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load entity context');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadContext();

    return () => {
      isMounted = false;
    };
  }, [isOpen, workspace, activeTarget, brainService]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace Brain Context"
      description="Deterministic connection graph and explainable context"
      maxWidth="780px"
    >
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <Skeleton height="80px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </div>
      ) : error || !contextData ? (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--wb-color-destructive)', fontSize: 'var(--wb-text-sm)' }}>
            {error ?? 'Context not available'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Target Entity Overview Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--wb-radius-lg)',
              backgroundColor: 'var(--wb-color-surface)',
              border: '1px solid var(--wb-color-border)',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--wb-radius-md)',
                  backgroundColor: 'var(--wb-color-surface-active)',
                  color: 'var(--wb-color-primary)',
                  flexShrink: 0,
                }}
              >
                {getEntityTypeIcon(contextData.target.entityType, 20)}
              </div>
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <Badge variant="primary" badgeStyle="subtle">
                    {getEntityTypeLabel(contextData.target.entityType)}
                  </Badge>
                  {contextData.project && (
                    <Badge variant="neutral" badgeStyle="subtle">
                      Project: {contextData.project.name}
                    </Badge>
                  )}
                </div>
                <h3
                  style={{
                    margin: '0.375rem 0 0.125rem 0',
                    fontSize: 'var(--wb-text-base)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    color: 'var(--wb-color-fg)',
                  }}
                >
                  {contextData.target.title}
                </h3>
                {contextData.target.subtitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--wb-text-xs)',
                      color: 'var(--wb-color-fg-muted)',
                    }}
                  >
                    {contextData.target.subtitle}
                  </p>
                )}
              </div>
            </div>

            {contextData.sharedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                {contextData.sharedTags.map((tag) => (
                  <Badge key={tag.id} variant="neutral">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Explicit Relationships Section */}
          {(contextData.explicitOutgoing.length > 0 || contextData.explicitIncoming.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  color: 'var(--wb-color-fg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={14} color="var(--wb-color-primary)" />
                <span>
                  Explicit Connections (
                  {contextData.explicitOutgoing.length + contextData.explicitIncoming.length})
                </span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Outgoing */}
                {contextData.explicitOutgoing.map((out) => (
                  <div
                    key={out.relationship.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--wb-radius-md)',
                      backgroundColor: 'var(--wb-color-bg-subtle)',
                      border: '1px solid var(--wb-color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <ArrowUpRight size={16} color="var(--wb-color-primary)" />
                      <span
                        style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}
                      >
                        This item
                      </span>
                      <Badge
                        variant={getRelationshipTypeBadgeVariant(out.relationship.relationshipType)}
                      >
                        {getRelationshipTypeLabel(out.relationship.relationshipType)}
                      </Badge>
                      <span
                        style={{
                          fontSize: 'var(--wb-text-sm)',
                          fontWeight: 'var(--wb-weight-medium)',
                        }}
                      >
                        {out.target.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveTarget({ type: out.target.entityType, id: out.target.entityId });
                      }}
                    >
                      Inspect
                    </Button>
                  </div>
                ))}

                {/* Incoming */}
                {contextData.explicitIncoming.map((inc) => (
                  <div
                    key={inc.relationship.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--wb-radius-md)',
                      backgroundColor: 'var(--wb-color-bg-subtle)',
                      border: '1px solid var(--wb-color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <ArrowDownLeft size={16} color="var(--wb-color-info)" />
                      <span
                        style={{
                          fontSize: 'var(--wb-text-sm)',
                          fontWeight: 'var(--wb-weight-medium)',
                        }}
                      >
                        {inc.source.title}
                      </span>
                      <Badge
                        variant={getRelationshipTypeBadgeVariant(inc.relationship.relationshipType)}
                      >
                        {getRelationshipTypeLabel(inc.relationship.relationshipType)}
                      </Badge>
                      <span
                        style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}
                      >
                        This item
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveTarget({ type: inc.source.entityType, id: inc.source.entityId });
                      }}
                    >
                      Inspect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discovered Related Items Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                Connected & Related Items ({contextData.relatedEntities.length})
              </h4>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
                Discovered via tags, references, and project graph
              </span>
            </div>

            {contextData.relatedEntities.length === 0 ? (
              <EmptyState
                title="No other connections found"
                description="This item currently has no explicit links, shared tags, or direct references."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {contextData.relatedEntities.map((item) => (
                  <ConnectedEntityCard
                    key={`${item.entityType}:${item.entityId}`}
                    entity={item}
                    onInspectContext={(ent) => {
                      setActiveTarget({ type: ent.entityType, id: ent.entityId });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};
