import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Decision, Tag } from '@/domain/entities';
import { getDecisionStatusBadgeVariant } from './decision-utils';
import { GitCommit, Edit2, Trash2, Folder, ExternalLink } from 'lucide-react';

export interface DecisionCardProps {
  readonly decision: Decision;
  readonly projectName?: string;
  readonly tags?: readonly Tag[];
  readonly onViewDetails: (decision: Decision) => void;
  readonly onEdit: (decision: Decision) => void;
  readonly onDelete: (decision: Decision) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  projectName,
  tags = [],
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const formattedDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const decisionTags = (decision.tags || [])
    .map((tagId) => tags.find((t) => t.id === tagId) || tagId)
    .filter(Boolean);

  return (
    <Card variant="default">
      <CardHeader>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}
          >
            <GitCommit
              size={18}
              style={{
                color:
                  decision.status === 'accepted'
                    ? 'var(--wb-color-success, #22c55e)'
                    : decision.status === 'proposed'
                      ? 'var(--wb-color-warning, #f59e0b)'
                      : 'var(--wb-color-fg-muted)',
                flexShrink: 0,
              }}
            />
            <CardTitle
              style={{
                fontSize: 'var(--wb-text-base)',
                fontWeight: 'var(--wb-weight-semibold)',
                wordBreak: 'break-word',
              }}
            >
              {decision.title}
            </CardTitle>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={getDecisionStatusBadgeVariant(decision.status)} dot>
              {decision.status.toUpperCase()}
            </Badge>

            {projectName && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-fg-muted)',
                  backgroundColor: 'var(--wb-color-bg-subtle)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--wb-radius-sm)',
                }}
              >
                <Folder size={11} />
                {projectName}
              </span>
            )}
          </div>
        </div>

        <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
          Decided on {formattedDate}
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div>
          <span
            style={{
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Decision
          </span>
          <p
            style={{
              margin: '0.125rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg)',
              lineHeight: 1.4,
            }}
          >
            {decision.decision}
          </p>
        </div>

        <div>
          <span
            style={{
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Rationale & Context
          </span>
          <p
            style={{
              margin: '0.125rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
              lineHeight: 1.4,
            }}
          >
            {decision.rationale}
          </p>
        </div>

        {decision.implications && (
          <div>
            <span
              style={{
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Consequences & Outcomes
            </span>
            <p
              style={{
                margin: '0.125rem 0 0 0',
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                lineHeight: 1.4,
              }}
            >
              {decision.implications}
            </p>
          </div>
        )}

        {decisionTags.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexWrap: 'wrap',
              marginTop: '0.25rem',
            }}
          >
            {decisionTags.map((t, idx) => (
              <TagBadge key={typeof t === 'string' ? `${t}-${idx}` : t.id} tag={t} size="sm" />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(decision)}
          leftIcon={<ExternalLink size={13} />}
        >
          View Full Record
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(decision)}
            aria-label={`Edit decision "${decision.title}"`}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(decision)}
            aria-label={`Delete decision "${decision.title}"`}
            style={{ color: 'var(--wb-color-destructive)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
