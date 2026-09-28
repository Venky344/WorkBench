import React from 'react';
import { Chat, ChatGroup } from '@/domain/entities';
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
} from '@/components/ui';
import { ChevronDown, ChevronRight, MoreVertical, Pin, Edit3, Trash2, Plus } from 'lucide-react';
import { ChatCard } from './ChatCard';
import { getChatGroupColorVar, renderChatGroupIcon } from './chat-theme';

export interface ChatGroupSectionProps {
  readonly group: ChatGroup;
  readonly chats: readonly Chat[];
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: (group: ChatGroup) => void;
  readonly onEditGroup: (group: ChatGroup) => void;
  readonly onTogglePinGroup: (group: ChatGroup) => void;
  readonly onDeleteGroup: (group: ChatGroup) => void;
  readonly onAddChatInGroup: (group: ChatGroup) => void;
  // Card action handlers
  readonly onOpenChat: (chat: Chat) => void;
  readonly onEditChat: (chat: Chat) => void;
  readonly onTogglePinChat: (chat: Chat) => void;
  readonly onToggleFavoriteChat: (chat: Chat) => void;
  readonly onMoveChat: (chat: Chat) => void;
  readonly onRemoveFromGroup: (chat: Chat) => void;
  readonly onDuplicateChat: (chat: Chat) => void;
  readonly onToggleArchiveChat: (chat: Chat) => void;
  readonly onDeleteChat: (chat: Chat) => void;
}

export const ChatGroupSection: React.FC<ChatGroupSectionProps> = ({
  group,
  chats,
  isCollapsed,
  onToggleCollapse,
  onEditGroup,
  onTogglePinGroup,
  onDeleteGroup,
  onAddChatInGroup,
  onOpenChat,
  onEditChat,
  onTogglePinChat,
  onToggleFavoriteChat,
  onMoveChat,
  onRemoveFromGroup,
  onDuplicateChat,
  onToggleArchiveChat,
  onDeleteChat,
}) => {
  const colorVar = getChatGroupColorVar(group.color);

  return (
    <div
      className="wb-chat-group-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderRadius: 'var(--wb-radius-lg)',
        border: '1px solid var(--wb-color-border-subtle)',
        backgroundColor: 'var(--wb-color-surface)',
        padding: '0.875rem 1rem',
      }}
    >
      {/* Group Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => onToggleCollapse(group)}
        >
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--wb-color-fg-muted)',
            }}
            aria-label={isCollapsed ? `Expand group ${group.name}` : `Collapse group ${group.name}`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </button>

          <div
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-surface-active)',
              color: colorVar,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {renderChatGroupIcon(group.icon, 16)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: 'var(--wb-text-base)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                {group.name}
              </span>

              <Badge variant="neutral" badgeStyle="subtle">
                {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </Badge>

              {group.isPinned && (
                <Badge variant="warning" badgeStyle="outline" style={{ fontSize: '10px' }}>
                  Pinned Group
                </Badge>
              )}
            </div>

            {group.description && (
              <p
                style={{
                  margin: '0.125rem 0 0 0',
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-fg-muted)',
                }}
              >
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Group Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => onAddChatInGroup(group)}
            style={{ fontSize: 'var(--wb-text-xs)' }}
          >
            New Chat
          </Button>

          <Tooltip content={group.isPinned ? 'Unpin group' : 'Pin group'}>
            <Button
              variant="ghost"
              size="sm"
              aria-label={group.isPinned ? 'Unpin group' : 'Pin group'}
              onClick={() => onTogglePinGroup(group)}
              style={{
                padding: '0.25rem',
                height: 'auto',
                color: group.isPinned ? 'var(--wb-color-warning)' : 'var(--wb-color-fg-subtle)',
              }}
            >
              <Pin
                size={15}
                fill={group.isPinned ? 'var(--wb-color-warning)' : 'none'}
                strokeWidth={2}
              />
            </Button>
          </Tooltip>

          <DropdownMenu
            align="right"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Options for group ${group.name}`}
                style={{ padding: '0.25rem', height: 'auto', color: 'var(--wb-color-fg-muted)' }}
              >
                <MoreVertical size={16} />
              </Button>
            }
          >
            <DropdownMenuItem icon={<Plus size={14} />} onClick={() => onAddChatInGroup(group)}>
              Add Chat in Group
            </DropdownMenuItem>

            <DropdownMenuItem icon={<Edit3 size={14} />} onClick={() => onEditGroup(group)}>
              Edit Group
            </DropdownMenuItem>

            <DropdownMenuItem icon={<Pin size={14} />} onClick={() => onTogglePinGroup(group)}>
              {group.isPinned ? 'Unpin Group' : 'Pin Group'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              destructive
              icon={<Trash2 size={14} />}
              onClick={() => onDeleteGroup(group)}
            >
              Delete Group...
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Group Children (Chats) */}
      {!isCollapsed && (
        <div style={{ marginTop: '0.5rem' }}>
          {chats.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--wb-color-surface-active)',
                borderRadius: 'var(--wb-radius-md)',
                color: 'var(--wb-color-fg-muted)',
                fontSize: 'var(--wb-text-xs)',
              }}
            >
              <p style={{ margin: 0 }}>No conversations in this group yet.</p>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => onAddChatInGroup(group)}
                style={{ marginTop: '0.5rem', fontSize: 'var(--wb-text-xs)' }}
              >
                Create conversation in &quot;{group.name}&quot;
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1rem',
              }}
            >
              {chats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  group={group}
                  onOpen={onOpenChat}
                  onEdit={onEditChat}
                  onTogglePin={onTogglePinChat}
                  onToggleFavorite={onToggleFavoriteChat}
                  onMoveToGroup={onMoveChat}
                  onRemoveFromGroup={onRemoveFromGroup}
                  onDuplicate={onDuplicateChat}
                  onToggleArchive={onToggleArchiveChat}
                  onDelete={onDeleteChat}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
