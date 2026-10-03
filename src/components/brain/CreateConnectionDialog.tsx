import React, { useState, useEffect, useId } from 'react';
import { EntityType, RelationshipType } from '@/domain/entities';
import { ConnectedEntity } from '@/domain/brain';
import { EntityId } from '@/types';
import { Dialog, DialogFooter, Button, Select, Input } from '@/components/ui';
import { useBrainService, useWorkspaceContext } from '@/app/providers';
import { toast } from '@/stores/toast.store';
import { getEntityTypeLabel, getRelationshipTypeLabel } from './brain-utils';

export interface CreateConnectionDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly projectId?: EntityId;
  readonly initialSource?: ConnectedEntity;
  readonly onConnectionCreated?: () => void;
}

const RELATIONSHIP_TYPES: readonly RelationshipType[] = [
  'relates_to',
  'references',
  'implements',
  'documents',
  'supersedes',
  'contains',
  'derived_from',
];

export const CreateConnectionDialog: React.FC<CreateConnectionDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  initialSource,
  onConnectionCreated,
}) => {
  const { workspace } = useWorkspaceContext();
  const brainService = useBrainService();
  const formId = useId();

  const [availableEntities, setAvailableEntities] = useState<readonly ConnectedEntity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  const [sourceKey, setSourceKey] = useState<string>('');
  const [targetKey, setTargetKey] = useState<string>('');
  const [relType, setRelType] = useState<RelationshipType>('relates_to');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSourceKey('');
      setTargetKey('');
      setRelType('relates_to');
      setNote('');
      return;
    }

    if (initialSource) {
      setSourceKey(`${initialSource.entityType}:${initialSource.entityId}`);
    } else {
      setSourceKey('');
    }
    setTargetKey('');
    setRelType('relates_to');
    setNote('');

    if (!workspace || !projectId) return;

    let isMounted = true;
    setIsLoadingEntities(true);

    const loadEntities = async () => {
      try {
        const summary = await brainService.getProjectContext(workspace.id, projectId);
        if (isMounted) {
          setAvailableEntities(summary.recentItems);
        }
      } catch (err) {
        console.error('Failed to load entities for connection', err);
      } finally {
        if (isMounted) {
          setIsLoadingEntities(false);
        }
      }
    };

    void loadEntities();

    return () => {
      isMounted = false;
    };
  }, [isOpen, workspace, projectId, initialSource, brainService]);

  const parseKey = (key: string): { type: EntityType; id: EntityId } | null => {
    const parts = key.split(':');
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { type: parts[0] as EntityType, id: parts[1] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    const sourceParsed = parseKey(sourceKey);
    const targetParsed = parseKey(targetKey);

    if (!sourceParsed || !targetParsed) {
      toast.error('Please select both a source and target entity.', 'Validation Error');
      return;
    }

    if (sourceParsed.type === targetParsed.type && sourceParsed.id === targetParsed.id) {
      toast.error('Cannot link an entity to itself.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await brainService.linkEntities({
        workspaceId: workspace.id,
        sourceEntityType: sourceParsed.type,
        sourceEntityId: sourceParsed.id,
        relationshipType: relType,
        targetEntityType: targetParsed.type,
        targetEntityId: targetParsed.id,
        metadata: note.trim() ? { note: note.trim() } : undefined,
      });

      toast.success('Connection created successfully in the Brain.', 'Link Created');
      onConnectionCreated?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create connection';
      toast.error(msg, 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceOptions = [
    { value: '', label: 'Select source resource...' },
    ...availableEntities.map((ent) => ({
      value: `${ent.entityType}:${ent.entityId}`,
      label: `[${getEntityTypeLabel(ent.entityType)}] ${ent.title}`,
    })),
  ];

  const targetOptions = [
    { value: '', label: 'Select target resource...' },
    ...availableEntities
      .filter((ent) => `${ent.entityType}:${ent.entityId}` !== sourceKey)
      .map((ent) => ({
        value: `${ent.entityType}:${ent.entityId}`,
        label: `[${getEntityTypeLabel(ent.entityType)}] ${ent.title}`,
      })),
  ];

  const relTypeOptions = RELATIONSHIP_TYPES.map((type) => ({
    value: type,
    label: `${getRelationshipTypeLabel(type)} (${type})`,
  }));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Entities in Brain"
      description="Create a typed, explainable connection between resources"
      maxWidth="520px"
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Source Entity Selection */}
        <Select
          label="Source Entity"
          value={sourceKey}
          onChange={(e) => setSourceKey(e.target.value)}
          disabled={isLoadingEntities || isSubmitting}
          options={sourceOptions}
        />

        {/* Relationship Type */}
        <Select
          label="Relationship Type"
          value={relType}
          onChange={(e) => setRelType(e.target.value as RelationshipType)}
          disabled={isSubmitting}
          options={relTypeOptions}
        />

        {/* Target Entity Selection */}
        <Select
          label="Target Entity"
          value={targetKey}
          onChange={(e) => setTargetKey(e.target.value)}
          disabled={isLoadingEntities || isSubmitting}
          options={targetOptions}
        />

        {/* Optional Note / Metadata */}
        <Input
          label="Annotation / Context (Optional)"
          type="text"
          placeholder="e.g., Required for implementing authentication workflow"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
        />

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            disabled={!sourceKey || !targetKey || isLoadingEntities}
          >
            Create Connection
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
