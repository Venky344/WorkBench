import React, { useState } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { ChatGroupColorPicker } from './ChatGroupColorPicker';
import { ChatGroupIconPicker } from './ChatGroupIconPicker';
import { useChatGroupService, useWorkspaceContext } from '@/app/providers';
import { ChatGroup } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface CreateChatGroupDialogProps {
  readonly isOpen: boolean;
  readonly projectId: EntityId;
  readonly onClose: () => void;
  readonly onGroupCreated: (group: ChatGroup) => void;
}

export const CreateChatGroupDialog: React.FC<CreateChatGroupDialogProps> = ({
  isOpen,
  projectId,
  onClose,
  onGroupCreated,
}) => {
  const chatGroupService = useChatGroupService();
  const { workspace } = useWorkspaceContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('message-square');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('blue');
    setIcon('message-square');
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

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await chatGroupService.createGroup({
        workspaceId: workspace.id,
        projectId,
        name: trimmedName,
        description: description.trim() || undefined,
        color,
        icon,
      });

      toast.success(`Chat group "${created.name}" created.`, 'Group Created');
      handleClose();
      onGroupCreated(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create chat group';
      setError(msg);
      toast.error(msg, 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Chat Group"
      description="Create a category folder to organize related conversations in this project."
      maxWidth="500px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Name */}
        <Input
          id="create-group-name"
          label="Group Name"
          required
          placeholder="e.g. Planning, Architecture, Bug Triage..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          errorMessage={error ?? undefined}
          autoFocus
        />

        {/* Description */}
        <Textarea
          id="create-group-description"
          label="Description (Optional)"
          placeholder="Brief description of the topics in this group..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color */}
        <div>
          <label
            htmlFor="create-group-color-picker"
            style={{
              display: 'block',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
              color: 'var(--wb-color-fg-muted)',
              marginBottom: '0.5rem',
            }}
          >
            Group Color
          </label>
          <ChatGroupColorPicker id="create-group-color-picker" value={color} onChange={setColor} />
        </div>

        {/* Icon */}
        <div>
          <label
            htmlFor="create-group-icon-picker"
            style={{
              display: 'block',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
              color: 'var(--wb-color-fg-muted)',
              marginBottom: '0.5rem',
            }}
          >
            Group Icon
          </label>
          <ChatGroupIconPicker id="create-group-icon-picker" value={icon} onChange={setIcon} />
        </div>

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Group
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
