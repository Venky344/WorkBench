import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { ChatGroupColorPicker } from './ChatGroupColorPicker';
import { ChatGroupIconPicker } from './ChatGroupIconPicker';
import { useChatGroupService } from '@/app/providers';
import { ChatGroup } from '@/domain/entities';
import { toast } from '@/stores/toast.store';

export interface EditChatGroupDialogProps {
  readonly isOpen: boolean;
  readonly group: ChatGroup | null;
  readonly onClose: () => void;
  readonly onGroupUpdated: (group: ChatGroup) => void;
}

export const EditChatGroupDialog: React.FC<EditChatGroupDialogProps> = ({
  isOpen,
  group,
  onClose,
  onGroupUpdated,
}) => {
  const chatGroupService = useChatGroupService();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('message-square');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description ?? '');
      setColor(group.color ?? 'blue');
      setIcon(group.icon ?? 'message-square');
      setError(null);
    }
  }, [group, isOpen]);

  if (!group) return null;

  const handleClose = () => {
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await chatGroupService.updateGroup(group.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        color,
        icon,
      });

      toast.success(`Chat group "${updated.name}" updated.`, 'Group Updated');
      handleClose();
      onGroupUpdated(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update chat group';
      setError(msg);
      toast.error(msg, 'Update Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Chat Group"
      description={`Update name, description, color, or icon for "${group.name}".`}
      maxWidth="500px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Name */}
        <Input
          id="edit-group-name"
          label="Group Name"
          required
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
          id="edit-group-description"
          label="Description (Optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color */}
        <div>
          <label
            htmlFor="edit-group-color-picker"
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
          <ChatGroupColorPicker id="edit-group-color-picker" value={color} onChange={setColor} />
        </div>

        {/* Icon */}
        <div>
          <label
            htmlFor="edit-group-icon-picker"
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
          <ChatGroupIconPicker id="edit-group-icon-picker" value={icon} onChange={setIcon} />
        </div>

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
