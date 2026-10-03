import React from 'react';
import { ConnectedEntity } from '@/domain/brain';
import { Card, Badge, Button } from '@/components/ui';
import { getEntityTypeIcon, getEntityTypeLabel, getOriginBadgeVariant } from './brain-utils';
import { Network, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ConnectedEntityCardProps {
  readonly entity: ConnectedEntity;
  readonly onInspectContext?: (entity: ConnectedEntity) => void;
  readonly isSelected?: boolean;
  readonly onSelect?: (entity: ConnectedEntity) => void;
}

export const ConnectedEntityCard: React.FC<ConnectedEntityCardProps> = ({
  entity,
  onInspectContext,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();

  const getEntityRoute = (): string | null => {
    if (!entity.projectId) return null;
    switch (entity.entityType) {
      case 'chat':
        return `/projects/${entity.projectId}/chats/${entity.entityId}`;
      case 'note':
        return `/projects/${entity.projectId}/notes/${entity.entityId}`;
      case 'file':
        return `/projects/${entity.projectId}/files`;
      case 'task':
        return `/projects/${entity.projectId}/tasks`;
      case 'decision':
        return `/projects/${entity.projectId}/decisions`;
      case 'link':
      case 'bookmark':
      case 'code_snippet':
      case 'reference':
        return `/projects/${entity.projectId}/resources`;
      case 'project':
        return `/projects/${entity.entityId}`;
      default:
        return null;
    }
  };

  const targetRoute = getEntityRoute();

  return (
    <Card
      variant={isSelected ? 'interactive' : 'default'}
      className="wb-connected-entity-card"
      style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        border: isSelected
          ? '1px solid var(--wb-color-primary)'
          : '1px solid var(--wb-color-border-subtle)',
        backgroundColor: isSelected
          ? 'var(--wb-color-surface-active)'
          : 'var(--wb-color-bg-subtle)',
        transition: 'var(--wb-transition-colors)',
        cursor: onSelect ? 'pointer' : 'default',
      }}
      onClick={() => onSelect?.(entity)}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-surface)',
              color: 'var(--wb-color-primary)',
              flexShrink: 0,
            }}
          >
            {getEntityTypeIcon(entity.entityType, 16)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Badge variant="neutral" badgeStyle="subtle">
                {getEntityTypeLabel(entity.entityType)}
              </Badge>
              {entity.projectName && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--wb-color-fg-subtle)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  in {entity.projectName}
                </span>
              )}
            </div>
            <h4
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: 'var(--wb-text-sm)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={entity.title}
            >
              {entity.title}
            </h4>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          {onInspectContext && (
            <Button
              variant="ghost"
              size="sm"
              title="Inspect Brain Context"
              onClick={(e) => {
                e.stopPropagation();
                onInspectContext(entity);
              }}
            >
              <Network size={14} />
            </Button>
          )}
          {targetRoute && (
            <Button
              variant="ghost"
              size="sm"
              title="Navigate to Resource"
              onClick={(e) => {
                e.stopPropagation();
                navigate(targetRoute);
              }}
            >
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Subtitle / Description if present */}
      {entity.subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-muted)',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entity.subtitle}
        </p>
      )}

      {/* Tags if present */}
      {entity.tags && entity.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {entity.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '11px',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--wb-radius-sm)',
                backgroundColor: 'var(--wb-color-surface)',
                color: 'var(--wb-color-fg-muted)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Relationship Explanations */}
      {entity.explanations.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            borderTop: '1px dashed var(--wb-color-border-subtle)',
            paddingTop: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              color: 'var(--wb-color-fg-subtle)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            Why connected:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {entity.explanations.map((exp, idx) => (
              <Badge
                key={`${exp.origin}-${idx}`}
                variant={getOriginBadgeVariant(exp.origin)}
                badgeStyle="subtle"
                title={exp.description}
              >
                {exp.description}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
