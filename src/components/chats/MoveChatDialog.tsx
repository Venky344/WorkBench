import React, { useState } from 'react';
import { Dialog, DialogFooter, Button, Radio } from '@/components/ui';
import { useChatService } from '@/app/providers';
import { Chat, ChatGroup } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { FolderInput, FolderMinus } from 'lucide-react';
import { getChatGroupColorVar, renderChatGroupIcon } from './chat-theme';

export interface MoveChatDialogProps {
  readonly isOpen: boolean;
  readonly chat: Chat | null;
  readonly groups: readonly ChatGroup[];
  readonly onClose: () => void;
  readonly onChatMoved: (chat: Chat) => void;
}

export const MoveChatDialog: React.FC<MoveChatDialogProps> = ({
  isOpen,
  chat,
  groups,
  onClose,
  onChatMoved,
}) => {
  const chatService = useChatService();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (chat) {
      setSelectedGroupId(chat.chatGroupId ?? '');
    }
  }, [chat, isOpen]);

  if (!chat) return null;

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  const handleMove = async () => {
    setIsSubmitting(true);
    try {
      const targetGroupId = selectedGroupId ? (selectedGroupId as EntityId) : null;
      const updated = await chatService.moveChatToGroup(chat.id, targetGroupId);

      const targetGroup = groups.find((g) => g.id === targetGroupId);
      const groupName = targetGroup ? `"${targetGroup.name}"` : 'Ungrouped';
      toast.success(`Moved conversation to ${groupName}.`, 'Conversation Moved');

      handleClose();
      onChatMoved(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to move conversation';
      toast.error(msg, 'Move Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Move Conversation to Group"
      description={`Select a destination group within this project for "${chat.title}".`}
      maxWidth="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          role="radiogroup"
          aria-label="Target group"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '0.25rem',
          }}
        >
          {/* Option: No group */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--wb-radius-md)',
              border:
                selectedGroupId === ''
                  ? '1px solid var(--wb-color-primary)'
                  : '1px solid var(--wb-color-border-subtle)',
              backgroundColor:
                selectedGroupId === ''
                  ? 'var(--wb-color-primary-subtle)'
                  : 'var(--wb-color-surface)',
              cursor: 'pointer',
              transition: 'all var(--wb-duration-fast) var(--wb-ease-default)',
            }}
          >
            <Radio
              name="move-group-select"
              value=""
              checked={selectedGroupId === ''}
              onChange={() => setSelectedGroupId('')}
            />
            <FolderMinus size={18} color="var(--wb-color-fg-muted)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--wb-text-sm)', fontWeight: 'var(--wb-weight-medium)' }}>
                No Group (Ungrouped)
              </div>
              <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
                Keep conversation in project without category grouping
              </div>
            </div>
          </label>

          {/* Project Groups */}
          {groups.map((group) => {
            const isSelected = selectedGroupId === group.id;
            const groupColor = getChatGroupColorVar(group.color);
            return (
              <label
                key={group.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--wb-radius-md)',
                  border: isSelected
                    ? '1px solid var(--wb-color-primary)'
                    : '1px solid var(--wb-color-border-subtle)',
                  backgroundColor: isSelected
                    ? 'var(--wb-color-primary-subtle)'
                    : 'var(--wb-color-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--wb-duration-fast) var(--wb-ease-default)',
                }}
              >
                <Radio
                  name="move-group-select"
                  value={group.id}
                  checked={isSelected}
                  onChange={() => setSelectedGroupId(group.id)}
                />
                <div
                  style={{
                    color: groupColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderChatGroupIcon(group.icon, 18)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 'var(--wb-text-sm)',
                      fontWeight: 'var(--wb-weight-medium)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    {group.name}
                  </div>
                  {group.description && (
                    <div
                      style={{
                        fontSize: 'var(--wb-text-xs)',
                        color: 'var(--wb-color-fg-subtle)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {group.description}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<FolderInput size={16} />}
            isLoading={isSubmitting}
            onClick={handleMove}
          >
            Move Conversation
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
