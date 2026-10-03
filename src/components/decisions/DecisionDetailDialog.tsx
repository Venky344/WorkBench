import React from 'react';
import { Dialog, DialogFooter, Button, Badge } from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { Decision, Tag } from '@/domain/entities';
import { getDecisionStatusBadgeVariant } from './decision-utils';
import { GitCommit, Calendar, Edit2 } from 'lucide-react';

export interface DecisionDetailDialogProps {
  readonly decision?: Decision | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onEdit: (decision: Decision) => void;
  readonly tags?: readonly Tag[];
}

export const DecisionDetailDialog: React.FC<DecisionDetailDialogProps> = ({
  decision,
  isOpen,
  onClose,
  onEdit,
  tags = [],
}) => {
  if (!decision) return null;

  const formattedCreated = new Date(decision.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdated = new Date(decision.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const decisionTags = (decision.tags || [])
    .map((tagId) => tags.find((t) => t.id === tagId) || tagId)
    .filter(Boolean);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <GitCommit size={20} color="var(--wb-color-primary)" />
          <span>{decision.title}</span>
          <Badge variant={getDecisionStatusBadgeVariant(decision.status)} dot>
            {decision.status.toUpperCase()}
          </Badge>
        </div>
      }
      description={`Record ID: ${decision.id}`}
      maxWidth="720px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Metadata info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--wb-color-bg-subtle)',
            borderRadius: 'var(--wb-radius-md)',
            border: '1px solid var(--wb-color-border)',
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} />
            Created: {formattedCreated}
          </span>
          {decision.updatedAt !== decision.createdAt && <span>Updated: {formattedUpdated}</span>}
        </div>

        {/* What was decided */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <h4
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-bold)',
              color: 'var(--wb-color-fg-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Decision
          </h4>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              borderRadius: 'var(--wb-radius-md)',
              border: '1px solid var(--wb-color-border)',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {decision.decision}
          </div>
        </div>

        {/* Context and Rationale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <h4
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-bold)',
              color: 'var(--wb-color-fg-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Context & Rationale
          </h4>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              borderRadius: 'var(--wb-radius-md)',
              border: '1px solid var(--wb-color-border)',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {decision.rationale}
          </div>
        </div>

        {/* Consequences and Outcomes */}
        {decision.implications && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-bold)',
                color: 'var(--wb-color-fg-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Consequences & Outcomes
            </h4>
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--wb-color-bg-subtle)',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg)',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {decision.implications}
            </div>
          </div>
        )}

        {/* Tags */}
        {decisionTags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-bold)',
                color: 'var(--wb-color-fg-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tags
            </h4>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}
            >
              {decisionTags.map((t, idx) => (
                <TagBadge key={typeof t === 'string' ? `${t}-${idx}` : t.id} tag={t} size="md" />
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<Edit2 size={14} />}
            onClick={() => {
              onClose();
              onEdit(decision);
            }}
          >
            Edit Record
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
