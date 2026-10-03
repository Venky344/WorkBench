import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useDecisionService } from '@/app/providers';
import { Decision, Tag, DecisionStatus } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface DecisionDialogProps {
  readonly decision?: Decision | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onDecisionSaved: (decision: Decision) => void;
}

export const DecisionDialog: React.FC<DecisionDialogProps> = ({
  decision,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onDecisionSaved,
}) => {
  const decisionService = useDecisionService();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('accepted');
  const [decisionText, setDecisionText] = useState('');
  const [rationale, setRationale] = useState('');
  const [implications, setImplications] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (decision) {
      setTitle(decision.title);
      setStatus(decision.status);
      setDecisionText(decision.decision);
      setRationale(decision.rationale);
      setImplications(decision.implications || '');
      setSelectedTagIds(decision.tags || []);
    } else {
      setTitle('');
      setStatus('accepted');
      setDecisionText('');
      setRationale('');
      setImplications('');
      setSelectedTagIds([]);
    }
  }, [decision, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decisionText.trim() || !rationale.trim()) return;

    setIsSaving(true);
    try {
      if (decision) {
        const updated = await decisionService.updateDecision(
          decision.id,
          {
            title: title.trim(),
            status,
            decision: decisionText.trim(),
            rationale: rationale.trim(),
            implications: implications.trim() || null,
            tags: selectedTagIds,
          },
          projectId,
        );
        toast.success(`Decision "${updated.title}" updated.`, 'Decision Saved');
        onDecisionSaved(updated);
      } else {
        const created = await decisionService.createDecision({
          workspaceId,
          projectId,
          title: title.trim(),
          status,
          decision: decisionText.trim(),
          rationale: rationale.trim(),
          implications: implications.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Decision "${created.title}" recorded.`, 'Decision Recorded');
        onDecisionSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save decision';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 && decisionText.trim().length > 0 && rationale.trim().length > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={decision ? 'Edit Decision Record' : 'Record New Decision'}
      description="Architectural Decision Record (ADR) capturing choice, rationale, and consequences."
      maxWidth="680px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem' }}>
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
          workspaceId={workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
          label="Tags (Optional)"
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!isFormValid || isSaving}
          >
            {decision ? 'Save Changes' : 'Record Decision'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
