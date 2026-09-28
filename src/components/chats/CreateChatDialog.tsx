import React, { useState } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useChatService, useWorkspaceContext } from '@/app/providers';
import { Chat, ChatGroup } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface CreateChatDialogProps {
  readonly isOpen: boolean;
  readonly projectId: EntityId;
  readonly defaultGroupId?: EntityId;
  readonly groups: readonly ChatGroup[];
  readonly onClose: () => void;
  readonly onChatCreated: (chat: Chat) => void;
}

export const CreateChatDialog: React.FC<CreateChatDialogProps> = ({
  isOpen,
  projectId,
  defaultGroupId,
  groups,
  onClose,
  onChatCreated,
}) => {
  const chatService = useChatService();
  const { workspace } = useWorkspaceContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState<string>(defaultGroupId ?? '');
  const [source, setSource] = useState('manual');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaultGroupId if it changes
  React.useEffect(() => {
    if (defaultGroupId) {
      setGroupId(defaultGroupId);
    }
  }, [defaultGroupId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGroupId(defaultGroupId ?? '');
    setSource('manual');
    setSelectedTagIds([]);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) {
      setError('Workspace is not ready yet');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Conversation title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await chatService.createChat({
        workspaceId: workspace.id,
        projectId,
        chatGroupId: groupId ? (groupId as EntityId) : undefined,
        title: trimmedTitle,
        description: description.trim() || undefined,
        source: source.trim() || 'manual',
        tags: selectedTagIds,
      });

      toast.success(`Conversation "${created.title}" created.`, 'Chat Created');
      handleClose();
      onChatCreated(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(msg);
      toast.error(msg, 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupOptions = [
    { value: '', label: 'No Group (Ungrouped)' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];

  const sourceOptions = [
    { value: 'manual', label: 'Local / Manual conversation' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'perplexity', label: 'Perplexity' },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Conversation"
      description="Create a persistent conversation record in this project to organize discussions and notes."
      maxWidth="540px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Title */}
        <Input
          id="create-chat-title"
          label="Conversation Title"
          required
          placeholder="e.g. Authentication Architecture, Database Migration Strategy..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          errorMessage={error ?? undefined}
          autoFocus
        />

        {/* Description */}
        <Textarea
          id="create-chat-description"
          label="Description / Context (Optional)"
          placeholder="Summary of this conversation topic, key objectives, or notes..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Group Selector */}
        <Select
          id="create-chat-group"
          label="Chat Group (Optional)"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          options={groupOptions}
        />

        {/* Source Metadata */}
        <Select
          id="create-chat-source"
          label="Origin / Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          options={sourceOptions}
          helperText="Foundational origin metadata for this conversation record."
        />

        {/* Tags */}
        {workspace && (
          <TagPicker
            workspaceId={workspace.id}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            label="Tags (Optional)"
            placeholder="Assign or create tags for this conversation..."
          />
        )}

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Conversation
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
