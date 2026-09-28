import React, { useState } from 'react';
import { Dialog, DialogFooter, Button } from '@/components/ui';
import { useChatService } from '@/app/providers';
import { Chat } from '@/domain/entities';
import { toast } from '@/stores/toast.store';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteChatDialogProps {
  readonly isOpen: boolean;
  readonly chat: Chat | null;
  readonly onClose: () => void;
  readonly onChatDeleted: (chatId: string) => void;
}

export const DeleteChatDialog: React.FC<DeleteChatDialogProps> = ({
  isOpen,
  chat,
  onClose,
  onChatDeleted,
}) => {
  const chatService = useChatService();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!chat) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await chatService.deleteChat(chat.id);
      toast.success(`Conversation "${chat.title}" was permanently removed.`, 'Chat Deleted');
      onClose();
      onChatDeleted(chat.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete conversation';
      toast.error(msg, 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Delete "${chat.title}"?`} maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem',
            borderRadius: 'var(--wb-radius-md)',
            backgroundColor: 'var(--wb-color-danger-subtle)',
            color: 'var(--wb-color-danger)',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ fontSize: 'var(--wb-text-xs)', lineHeight: 'var(--wb-leading-relaxed)' }}>
            This permanently removes the chat record from this project. This action cannot be
            undone.
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
          Are you sure you want to delete <strong>{chat.title}</strong>?
        </p>

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            leftIcon={<Trash2 size={16} />}
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete Conversation
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
