import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatService, useChatGroupService, useProjectService } from '@/app/providers';
import { Chat, ChatGroup, Project } from '@/domain/entities';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Separator,
  LoadingState,
  ErrorState,
  Tooltip,
} from '@/components/ui';
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Heart,
  Edit3,
  FolderInput,
  Copy,
  Archive,
  RefreshCw,
  Trash2,
  FolderKanban,
  Info,
} from 'lucide-react';
import { EditChatDialog, MoveChatDialog, DeleteChatDialog } from '@/components/chats';
import { getChatGroupColorVar } from '@/components/chats/chat-theme';
import { OrganizationPanel } from '@/components/organization';
import { toast } from '@/stores/toast.store';

export const ChatDetailPage: React.FC = () => {
  const { projectId, chatId } = useParams<{ projectId: string; chatId: string }>();
  const navigate = useNavigate();

  const chatService = useChatService();
  const chatGroupService = useChatGroupService();
  const projectService = useProjectService();

  const [project, setProject] = useState<Project | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [group, setGroup] = useState<ChatGroup | null>(null);
  const [groups, setGroups] = useState<readonly ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadChatData = useCallback(async () => {
    if (!projectId || !chatId) {
      setError('Invalid URL parameters');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loadedProject, loadedChat, loadedGroups] = await Promise.all([
        projectService.getProject(projectId),
        chatService.getChat(chatId),
        chatGroupService.listGroups(projectId),
      ]);

      if (!loadedProject) {
        setError(`Project "${projectId}" not found`);
        setIsLoading(false);
        return;
      }

      if (!loadedChat) {
        setError(`Conversation "${chatId}" not found`);
        setIsLoading(false);
        return;
      }

      // Strict Project Isolation Check
      if (loadedChat.projectId !== projectId) {
        setError(`Conversation does not belong to project "${loadedProject.name}"`);
        setIsLoading(false);
        return;
      }

      setProject(loadedProject);
      setChat(loadedChat);
      setGroups(loadedGroups);

      if (loadedChat.chatGroupId) {
        const foundGroup = loadedGroups.find((g) => g.id === loadedChat.chatGroupId);
        setGroup(foundGroup ?? null);
      } else {
        setGroup(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation details');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, chatId, projectService, chatService, chatGroupService]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  if (isLoading) {
    return <LoadingState message="Loading conversation details..." />;
  }

  if (error || !chat || !project) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', width: '100%' }}>
        <ErrorState
          title="Conversation Not Found"
          message={error ?? 'The requested conversation could not be located.'}
          onRetry={() => navigate(`/projects/${projectId ?? ''}/chats`)}
        />
      </div>
    );
  }

  const handleTogglePin = async () => {
    try {
      const updated = await chatService.setPinned(chat.id, !chat.isPinned);
      setChat(updated);
      toast.success(updated.isPinned ? 'Pinned conversation' : 'Unpinned conversation');
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updated = await chatService.setFavorite(chat.id, !chat.isFavorite);
      setChat(updated);
      toast.success(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleArchive = async () => {
    try {
      const updated = chat.isArchived
        ? await chatService.restoreChat(chat.id)
        : await chatService.archiveChat(chat.id);
      setChat(updated);
      toast.success(updated.isArchived ? 'Archived conversation' : 'Restored conversation');
    } catch {
      toast.error('Failed to update archive status');
    }
  };

  const handleDuplicate = async () => {
    try {
      const duplicated = await chatService.duplicateChat(chat.id);
      toast.success(`Duplicated as "${duplicated.title}".`, 'Conversation Duplicated');
      navigate(`/projects/${project.id}/chats/${duplicated.id}`);
    } catch {
      toast.error('Failed to duplicate conversation');
    }
  };

  const groupColor = group ? getChatGroupColorVar(group.color) : 'var(--wb-color-primary)';

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/projects/${project.id}/chats`)}
        >
          Back to {project.name} Conversations
        </Button>
      </div>

      {/* Header Container */}
      <Card variant="default">
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Title & Metadata Badges */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1 }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
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
                <MessageSquare size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <CardTitle
                    style={{
                      fontSize: 'var(--wb-text-xl)',
                      fontWeight: 'var(--wb-weight-bold)',
                      margin: 0,
                    }}
                  >
                    {chat.title}
                  </CardTitle>

                  {group && (
                    <Badge variant="neutral" badgeStyle="outline">
                      {group.name}
                    </Badge>
                  )}

                  {chat.source && (
                    <Badge variant="info" badgeStyle="subtle">
                      {chat.source}
                    </Badge>
                  )}

                  {chat.isPinned && (
                    <Badge variant="warning" badgeStyle="outline">
                      Pinned
                    </Badge>
                  )}

                  {chat.isFavorite && (
                    <Badge variant="destructive" badgeStyle="outline">
                      Favorite
                    </Badge>
                  )}

                  {chat.isArchived && (
                    <Badge variant="warning" badgeStyle="subtle">
                      Archived
                    </Badge>
                  )}
                </div>

                {chat.description && (
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: 'var(--wb-text-sm)',
                      color: 'var(--wb-color-fg-muted)',
                      lineHeight: 'var(--wb-leading-relaxed)',
                    }}
                  >
                    {chat.description}
                  </p>
                )}
              </div>
            </div>

            {/* Top Right Quick Actions */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}
            >
              <Tooltip content={chat.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={chat.isFavorite ? 'Unfavorite' : 'Favorite'}
                  onClick={handleToggleFavorite}
                  style={{
                    color: chat.isFavorite ? 'var(--wb-color-danger)' : 'var(--wb-color-fg-subtle)',
                  }}
                >
                  <Heart
                    size={16}
                    fill={chat.isFavorite ? 'var(--wb-color-danger)' : 'none'}
                    strokeWidth={2}
                  />
                </Button>
              </Tooltip>

              <Tooltip content={chat.isPinned ? 'Unpin' : 'Pin to top'}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={chat.isPinned ? 'Unpin' : 'Pin'}
                  onClick={handleTogglePin}
                  style={{
                    color: chat.isPinned ? 'var(--wb-color-warning)' : 'var(--wb-color-fg-subtle)',
                  }}
                >
                  <Pin
                    size={16}
                    fill={chat.isPinned ? 'var(--wb-color-warning)' : 'none'}
                    strokeWidth={2}
                  />
                </Button>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit3 size={15} />}
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<FolderInput size={15} />}
                onClick={() => setIsMoveOpen(true)}
              >
                Move
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy size={15} />}
                onClick={handleDuplicate}
              >
                Duplicate
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={chat.isArchived ? <RefreshCw size={15} /> : <Archive size={15} />}
                onClick={handleToggleArchive}
              >
                {chat.isArchived ? 'Restore' : 'Archive'}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Trash2 size={15} />}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        {chat.tags && chat.tags.length > 0 && (
          <CardContent style={{ paddingTop: 0, paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {chat.tags.map((tag) => (
                <Badge key={tag} variant="neutral" badgeStyle="subtle">
                  #{tag.replace(/^#/, '')}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Metadata Overview & Organization Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Full Organization Panel */}
        <OrganizationPanel
          workspaceId={project.workspaceId}
          entityType="chat"
          selectedTagIds={chat.tags ?? []}
          onTagsChange={async (tagIds) => {
            try {
              const updated = await chatService.updateChat(chat.id, { tags: tagIds });
              setChat(updated);
              toast.success('Tags updated successfully', 'Tags Saved');
            } catch {
              toast.error('Failed to update tags');
            }
          }}
          isPinned={chat.isPinned}
          onTogglePin={handleTogglePin}
          isFavorite={chat.isFavorite}
          onToggleFavorite={handleToggleFavorite}
          isArchived={chat.isArchived}
          onToggleArchive={handleToggleArchive}
          createdAt={chat.createdAt}
          updatedAt={chat.updatedAt}
          lastActivityAt={chat.lastActivityAt}
        />

        {/* Organization Scope & Context */}
        <Card variant="default">
          <CardHeader>
            <CardTitle
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FolderKanban size={16} color="var(--wb-color-primary)" />
              <span>Project Context & Origin</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: 'var(--wb-text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Project: </span>
              <strong>{project.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Group: </span>
              {group ? (
                <strong>{group.name}</strong>
              ) : (
                <span style={{ color: 'var(--wb-color-fg-muted)' }}>None (Ungrouped)</span>
              )}
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Origin Source: </span>
              <code>{chat.source ?? 'manual'}</code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Chat ID: </span>
              <code style={{ fontSize: '11px' }}>{chat.id}</code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Workspace ID: </span>
              <code style={{ fontSize: '11px' }}>{project.workspaceId}</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Conversation Content Boundary (Phase 7 Scope Boundary Notice) */}
      <Card
        variant="default"
        style={{
          border: '1px dashed var(--wb-color-border-bold)',
          backgroundColor: 'var(--wb-color-surface-hover)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--wb-radius-full)',
              backgroundColor: 'var(--wb-color-primary-subtle)',
              color: 'var(--wb-color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info size={24} />
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-base)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
            }}
          >
            Conversation Content Placeholder
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              lineHeight: 'var(--wb-leading-relaxed)',
            }}
          >
            Conversation content will be available when chat message functionality is implemented in
            a future phase. WorkBench currently maintains this chat as a persistent container and
            organizational record inside <strong>{project.name}</strong>.
          </p>
        </div>
      </Card>

      {/* Dialogs */}
      <EditChatDialog
        isOpen={isEditOpen}
        chat={chat}
        groups={groups}
        onClose={() => setIsEditOpen(false)}
        onChatUpdated={(updated) => {
          setChat(updated);
          if (updated.chatGroupId) {
            const foundGroup = groups.find((g) => g.id === updated.chatGroupId);
            setGroup(foundGroup ?? null);
          } else {
            setGroup(null);
          }
        }}
      />

      <MoveChatDialog
        isOpen={isMoveOpen}
        chat={chat}
        groups={groups}
        onClose={() => setIsMoveOpen(false)}
        onChatMoved={(updated) => {
          setChat(updated);
          if (updated.chatGroupId) {
            const foundGroup = groups.find((g) => g.id === updated.chatGroupId);
            setGroup(foundGroup ?? null);
          } else {
            setGroup(null);
          }
        }}
      />

      <DeleteChatDialog
        isOpen={isDeleteOpen}
        chat={chat}
        onClose={() => setIsDeleteOpen(false)}
        onChatDeleted={() => {
          navigate(`/projects/${project.id}/chats`);
        }}
      />
    </div>
  );
};
