import React from 'react';
import { Chat, ChatGroup } from '@/domain/entities';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
} from '@/components/ui';
import {
  MessageSquare,
  MoreVertical,
  Pin,
  Heart,
  FolderInput,
  FolderMinus,
  Edit3,
  Copy,
  Archive,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { getChatGroupColorVar } from './chat-theme';

export interface ChatCardProps {
  readonly chat: Chat;
  readonly group?: ChatGroup;
  readonly onOpen: (chat: Chat) => void;
  readonly onEdit: (chat: Chat) => void;
  readonly onTogglePin: (chat: Chat) => void;
  readonly onToggleFavorite: (chat: Chat) => void;
  readonly onMoveToGroup: (chat: Chat) => void;
  readonly onRemoveFromGroup?: (chat: Chat) => void;
  readonly onDuplicate: (chat: Chat) => void;
  readonly onToggleArchive: (chat: Chat) => void;
  readonly onDelete: (chat: Chat) => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const timestamp = Date.parse(isoString);
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  group,
  onOpen,
  onEdit,
  onTogglePin,
  onToggleFavorite,
  onMoveToGroup,
  onRemoveFromGroup,
  onDuplicate,
  onToggleArchive,
  onDelete,
}) => {
  const groupColor = group ? getChatGroupColorVar(group.color) : 'var(--wb-color-primary)';

  return (
    <Card
      variant="default"
      className="wb-chat-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all var(--wb-duration-normal) var(--wb-ease-default)',
        position: 'relative',
        opacity: chat.isArchived ? 0.75 : 1,
        borderLeft: group ? `4px solid ${groupColor}` : undefined,
      }}
    >
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Icon & Title & Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--wb-radius-md)',
                backgroundColor: 'var(--wb-color-surface-active)',
                color: group ? groupColor : 'var(--wb-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}
            >
              <MessageSquare size={16} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <CardTitle
                  style={{
                    fontSize: 'var(--wb-text-base)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    margin: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(chat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 'inherit',
                    }}
                    aria-label={`Open chat ${chat.title}`}
                  >
                    {chat.title}
                  </button>
                </CardTitle>

                {group && (
                  <Badge variant="neutral" badgeStyle="outline" style={{ fontSize: '11px' }}>
                    {group.name}
                  </Badge>
                )}

                {chat.source && chat.source !== 'manual' && (
                  <Badge variant="info" badgeStyle="subtle" style={{ fontSize: '10px' }}>
                    {chat.source}
                  </Badge>
                )}
              </div>

              {chat.description && (
                <CardDescription
                  style={{
                    marginTop: '0.375rem',
                    fontSize: 'var(--wb-text-xs)',
                    lineHeight: 'var(--wb-leading-relaxed)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {chat.description}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Quick Action Buttons (Favorite + Pin + Dropdown Menu) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tooltip
              content={chat.isFavorite ? 'Unfavorite conversation' : 'Favorite conversation'}
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label={chat.isFavorite ? 'Unfavorite conversation' : 'Favorite conversation'}
                onClick={() => onToggleFavorite(chat)}
                style={{
                  padding: '0.25rem',
                  height: 'auto',
                  color: chat.isFavorite ? 'var(--wb-color-danger)' : 'var(--wb-color-fg-subtle)',
                }}
              >
                <Heart
                  size={15}
                  fill={chat.isFavorite ? 'var(--wb-color-danger)' : 'none'}
                  strokeWidth={2}
                />
              </Button>
            </Tooltip>

            <Tooltip content={chat.isPinned ? 'Unpin conversation' : 'Pin conversation'}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={chat.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                onClick={() => onTogglePin(chat)}
                style={{
                  padding: '0.25rem',
                  height: 'auto',
                  color: chat.isPinned ? 'var(--wb-color-warning)' : 'var(--wb-color-fg-subtle)',
                }}
              >
                <Pin
                  size={15}
                  fill={chat.isPinned ? 'var(--wb-color-warning)' : 'none'}
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
                  aria-label={`Chat options for ${chat.title}`}
                  style={{ padding: '0.25rem', height: 'auto', color: 'var(--wb-color-fg-muted)' }}
                >
                  <MoreVertical size={16} />
                </Button>
              }
            >
              <DropdownMenuItem icon={<ExternalLink size={14} />} onClick={() => onOpen(chat)}>
                Open Chat
              </DropdownMenuItem>

              <DropdownMenuItem icon={<Edit3 size={14} />} onClick={() => onEdit(chat)}>
                Edit Details
              </DropdownMenuItem>

              <DropdownMenuItem
                icon={<FolderInput size={14} />}
                onClick={() => onMoveToGroup(chat)}
              >
                Move to Group...
              </DropdownMenuItem>

              {chat.chatGroupId && onRemoveFromGroup && (
                <DropdownMenuItem
                  icon={<FolderMinus size={14} />}
                  onClick={() => onRemoveFromGroup(chat)}
                >
                  Remove from Group
                </DropdownMenuItem>
              )}

              <DropdownMenuItem icon={<Copy size={14} />} onClick={() => onDuplicate(chat)}>
                Duplicate Chat
              </DropdownMenuItem>

              <DropdownMenuItem icon={<Pin size={14} />} onClick={() => onTogglePin(chat)}>
                {chat.isPinned ? 'Unpin from Top' : 'Pin to Top'}
              </DropdownMenuItem>

              <DropdownMenuItem icon={<Heart size={14} />} onClick={() => onToggleFavorite(chat)}>
                {chat.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>

              <DropdownMenuItem
                icon={chat.isArchived ? <RefreshCw size={14} /> : <Archive size={14} />}
                onClick={() => onToggleArchive(chat)}
              >
                {chat.isArchived ? 'Restore Chat' : 'Archive Chat'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                destructive
                icon={<Trash2 size={14} />}
                onClick={() => onDelete(chat)}
              >
                Delete Chat...
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ paddingBottom: '0.5rem', paddingTop: 0 }}>
        {chat.tags && chat.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {chat.tags.map((tag) => (
              <Badge key={tag} variant="neutral" badgeStyle="subtle">
                #{tag.replace(/^#/, '')}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--wb-color-border-subtle)',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          fontSize: 'var(--wb-text-xs)',
          color: 'var(--wb-color-fg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {chat.isArchived ? (
            <Badge variant="warning" badgeStyle="subtle">
              Archived
            </Badge>
          ) : chat.isPinned ? (
            <Badge variant="warning" badgeStyle="outline">
              Pinned
            </Badge>
          ) : chat.isFavorite ? (
            <Badge variant="destructive" badgeStyle="outline">
              Favorite
            </Badge>
          ) : (
            <Badge variant="neutral" badgeStyle="subtle">
              Active
            </Badge>
          )}
          <span>Updated {formatRelativeTime(chat.lastActivityAt ?? chat.updatedAt)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(chat)}
          style={{ fontSize: 'var(--wb-text-xs)', padding: '0.25rem 0.5rem' }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};
