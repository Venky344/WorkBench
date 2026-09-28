import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { useChatService } from '@/app/providers';
import { Chat, ChatGroup } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface EditChatDialogProps {
  readonly isOpen: boolean;
  readonly chat: Chat | null;
  readonly groups: readonly ChatGroup[];
  readonly onClose: () => void;
  readonly onChatUpdated: (chat: Chat) => void;
}

export const EditChatDialog: React.FC<EditChatDialogProps> = ({
  isOpen,
  chat,
  groups,
  onClose,
  onChatUpdated,
}) => {
  const chatService = useChatService();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (chat) {
      setTitle(chat.title);
      setDescription(chat.description ?? '');
      setGroupId(chat.chatGroupId ?? '');
      setTagInput(chat.tags ? chat.tags.join(', ') : '');
      setError(null);
    }
  }, [chat, isOpen]);

  if (!chat) return null;

  const handleClose = () => {
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Conversation title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const updated = await chatService.updateChat(chat.id, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        chatGroupId: groupId ? (groupId as EntityId) : null,
        tags,
      });

      toast.success(`Conversation "${updated.title}" updated.`, 'Chat Updated');
      handleClose();
      onChatUpdated(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update conversation';
      setError(msg);
      toast.error(msg, 'Update Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupOptions = [
    { value: '', label: 'No Group (Ungrouped)' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Conversation Details"
      description={`Update metadata and organization group for "${chat.title}".`}
      maxWidth="540px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Title */}
        <Input
          id="edit-chat-title"
          label="Conversation Title"
          required
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
          id="edit-chat-description"
          label="Description / Context (Optional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Group Selector */}
        <Select
          id="edit-chat-group"
          label="Chat Group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          options={groupOptions}
        />

        {/* Tags */}
        <Input
          id="edit-chat-tags"
          label="Tags (Comma separated)"
          placeholder="architecture, auth, sprint-1"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />

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
