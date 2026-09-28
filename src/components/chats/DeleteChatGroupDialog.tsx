import React, { useState } from 'react';
import { Dialog, DialogFooter, Button } from '@/components/ui';
import { useChatGroupService } from '@/app/providers';
import { ChatGroup } from '@/domain/entities';
import { toast } from '@/stores/toast.store';
import { Info, Trash2 } from 'lucide-react';

export interface DeleteChatGroupDialogProps {
  readonly isOpen: boolean;
  readonly group: ChatGroup | null;
  readonly onClose: () => void;
  readonly onGroupDeleted: (groupId: string) => void;
}

export const DeleteChatGroupDialog: React.FC<DeleteChatGroupDialogProps> = ({
  isOpen,
  group,
  onClose,
  onGroupDeleted,
}) => {
  const chatGroupService = useChatGroupService();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!group) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await chatGroupService.deleteGroup(group.id);
      toast.success(
        `Chat group "${group.name}" was deleted. Chats were kept and ungrouped.`,
        'Group Deleted',
      );
      onClose();
      onGroupDeleted(group.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete chat group';
      toast.error(msg, 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete Group "${group.name}"?`}
      maxWidth="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem',
            borderRadius: 'var(--wb-radius-md)',
            backgroundColor: 'var(--wb-color-info-subtle)',
            color: 'var(--wb-color-info)',
          }}
        >
          <Info size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ fontSize: 'var(--wb-text-xs)', lineHeight: 'var(--wb-leading-relaxed)' }}>
            <strong>Safety Note:</strong> Deleting this group will <strong>not</strong> delete the
            chats inside it. The chats will remain in the project without a group.
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
          Are you sure you want to remove the group category <strong>{group.name}</strong>?
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
            Delete Group
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
