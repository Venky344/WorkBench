import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { useChatService, useChatGroupService } from '@/app/providers';
import { Chat, ChatGroup } from '@/domain/entities';
import { Button, Input, Select, EmptyState, LoadingState, Badge } from '@/components/ui';
import {
  ChatCard,
  ChatGroupSection,
  CreateChatDialog,
  EditChatDialog,
  CreateChatGroupDialog,
  EditChatGroupDialog,
  MoveChatDialog,
  DeleteChatDialog,
  DeleteChatGroupDialog,
} from '@/components/chats';
import { Plus, Search, MessageSquare, FolderPlus, Layers } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const ProjectChatsPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const navigate = useNavigate();
  const chatService = useChatService();
  const chatGroupService = useChatGroupService();

  const [chats, setChats] = useState<readonly Chat[]>([]);
  const [groups, setGroups] = useState<readonly ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Sorting
  const [filterTab, setFilterTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');

  // Collapsed state for groups (by groupId)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Dialog states
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [targetGroupIdForNewChat, setTargetGroupIdForNewChat] = useState<string | undefined>(
    undefined,
  );
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [movingChat, setMovingChat] = useState<Chat | null>(null);
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ChatGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ChatGroup | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedChats, loadedGroups] = await Promise.all([
        chatService.listChats(project.id, {
          status: 'all', // We filter locally or via service
          sortBy: 'updatedAt',
        }),
        chatGroupService.listGroups(project.id),
      ]);
      setChats(loadedChats);
      setGroups(loadedGroups);
    } catch {
      toast.error('Failed to load project conversations', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [chatService, chatGroupService, project.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered & Sorted Chats
  const filteredChats = React.useMemo(() => {
    let result = [...chats];

    // Status filter
    if (filterTab === 'active') {
      result = result.filter((c) => !c.isArchived);
    } else if (filterTab === 'pinned') {
      result = result.filter((c) => c.isPinned && !c.isArchived);
    } else if (filterTab === 'favorites') {
      result = result.filter((c) => c.isFavorite && !c.isArchived);
    } else if (filterTab === 'archived') {
      result = result.filter((c) => c.isArchived);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.source && c.source.toLowerCase().includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'createdAt') {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
      const timeA = a.lastActivityAt ?? a.updatedAt;
      const timeB = b.lastActivityAt ?? b.updatedAt;
      return Date.parse(timeB) - Date.parse(timeA);
    });

    return result;
  }, [chats, filterTab, searchQuery, sortBy]);

  // Group chats by group ID
  const groupedChats = React.useMemo(() => {
    const map = new Map<string, Chat[]>();
    const ungrouped: Chat[] = [];

    for (const chat of filteredChats) {
      if (chat.chatGroupId) {
        const list = map.get(chat.chatGroupId) ?? [];
        list.push(chat);
        map.set(chat.chatGroupId, list);
      } else {
        ungrouped.push(chat);
      }
    }

    return { map, ungrouped };
  }, [filteredChats]);

  // Handlers for Chat actions
  const handleOpenChat = (chat: Chat) => {
    navigate(`/projects/${project.id}/chats/${chat.id}`);
  };

  const handleTogglePinChat = async (chat: Chat) => {
    try {
      const updated = await chatService.setPinned(chat.id, !chat.isPinned);
      setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(updated.isPinned ? `Pinned "${chat.title}"` : `Unpinned "${chat.title}"`);
    } catch {
      toast.error('Failed to toggle pin');
    }
  };

  const handleToggleFavoriteChat = async (chat: Chat) => {
    try {
      const updated = await chatService.setFavorite(chat.id, !chat.isFavorite);
      setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(
        updated.isFavorite
          ? `Added "${chat.title}" to favorites`
          : `Removed "${chat.title}" from favorites`,
      );
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleArchiveChat = async (chat: Chat) => {
    try {
      const updated = chat.isArchived
        ? await chatService.restoreChat(chat.id)
        : await chatService.archiveChat(chat.id);
      setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(updated.isArchived ? `Archived "${chat.title}"` : `Restored "${chat.title}"`);
    } catch {
      toast.error('Failed to update archive status');
    }
  };

  const handleDuplicateChat = async (chat: Chat) => {
    try {
      const duplicated = await chatService.duplicateChat(chat.id);
      setChats((prev) => [duplicated, ...prev]);
      toast.success(`Duplicated conversation as "${duplicated.title}".`, 'Chat Duplicated');
    } catch {
      toast.error('Failed to duplicate conversation');
    }
  };

  const handleRemoveFromGroup = async (chat: Chat) => {
    try {
      const updated = await chatService.removeChatFromGroup(chat.id);
      setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(`Removed "${chat.title}" from its group.`);
    } catch {
      toast.error('Failed to remove from group');
    }
  };

  // Handlers for Group actions
  const handleTogglePinGroup = async (group: ChatGroup) => {
    try {
      const updated = group.isPinned
        ? await chatGroupService.unpinGroup(group.id)
        : await chatGroupService.pinGroup(group.id);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      toast.success(
        updated.isPinned ? `Pinned group "${group.name}"` : `Unpinned group "${group.name}"`,
      );
    } catch {
      toast.error('Failed to toggle group pin');
    }
  };

  const handleToggleCollapseGroup = (group: ChatGroup) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group.id]: !prev[group.id],
    }));
  };

  const handleOpenCreateChatInGroup = (group: ChatGroup) => {
    setTargetGroupIdForNewChat(group.id);
    setIsCreateChatOpen(true);
  };

  const handleOpenCreateChatDefault = () => {
    setTargetGroupIdForNewChat(undefined);
    setIsCreateChatOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Loading conversations..." />;
  }

  const hasAnyChatsOrGroups = chats.length > 0 || groups.length > 0;
  const isFilteringActive = searchQuery.trim().length > 0 || filterTab !== 'active';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Main Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-lg)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MessageSquare size={20} color="var(--wb-color-primary)" />
            <span>Project Conversations</span>
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Organize conversations, research records, and architectural discussions for &quot;
            {project.name}&quot;.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FolderPlus size={16} />}
            onClick={() => setIsCreateGroupOpen(true)}
          >
            New Group
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleOpenCreateChatDefault}
          >
            New Conversation
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      {hasAnyChatsOrGroups && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            backgroundColor: 'var(--wb-color-surface)',
            padding: '1rem',
            borderRadius: 'var(--wb-radius-lg)',
            border: '1px solid var(--wb-color-border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter conversations"
              style={{
                display: 'flex',
                gap: '0.375rem',
                backgroundColor: 'var(--wb-color-surface-card)',
                padding: '0.25rem',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border-subtle)',
                flexWrap: 'wrap',
              }}
            >
              {[
                { id: 'active', label: `Active (${chats.filter((c) => !c.isArchived).length})` },
                {
                  id: 'pinned',
                  label: `Pinned (${chats.filter((c) => c.isPinned && !c.isArchived).length})`,
                },
                {
                  id: 'favorites',
                  label: `Favorites (${chats.filter((c) => c.isFavorite && !c.isArchived).length})`,
                },
                { id: 'all', label: `All (${chats.length})` },
                { id: 'archived', label: `Archived (${chats.filter((c) => c.isArchived).length})` },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilterTab(tab.id)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      fontSize: 'var(--wb-text-xs)',
                      fontWeight: isActive
                        ? 'var(--wb-weight-semibold)'
                        : 'var(--wb-weight-medium)',
                      borderRadius: 'var(--wb-radius-sm)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--wb-color-surface-active)' : 'transparent',
                      color: isActive ? 'var(--wb-color-fg)' : 'var(--wb-color-fg-muted)',
                      cursor: 'pointer',
                      transition: 'var(--wb-transition-colors)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div style={{ minWidth: '180px' }}>
              <Select
                id="sort-chats-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')}
                options={[
                  { value: 'updatedAt', label: 'Recently Updated' },
                  { value: 'createdAt', label: 'Recently Created' },
                  { value: 'title', label: 'Title (A–Z)' },
                ]}
              />
            </div>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <Input
                id="search-chats-input"
                placeholder="Search conversations by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={15} />}
              />
            </div>
            {isFilteringActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterTab('active');
                }}
                style={{ fontSize: 'var(--wb-text-xs)' }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!hasAnyChatsOrGroups ? (
        <EmptyState
          icon={<MessageSquare size={36} />}
          title="No conversations yet"
          description={`Start organizing discussions, planning sessions, and ideas for "${project.name}".`}
          actionLabel="Create First Conversation"
          onAction={handleOpenCreateChatDefault}
        />
      ) : filteredChats.length === 0 && groups.length === 0 ? (
        <EmptyState
          icon={<Search size={36} />}
          title="No matching conversations"
          description="No conversation records match your current search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterTab('active');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Group Sections */}
          {groups.map((group) => {
            const groupChats = groupedChats.map.get(group.id) ?? [];
            const isCollapsed = !!collapsedGroups[group.id];

            return (
              <ChatGroupSection
                key={group.id}
                group={group}
                chats={groupChats}
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapseGroup}
                onEditGroup={(g) => setEditingGroup(g)}
                onTogglePinGroup={handleTogglePinGroup}
                onDeleteGroup={(g) => setDeletingGroup(g)}
                onAddChatInGroup={handleOpenCreateChatInGroup}
                onOpenChat={handleOpenChat}
                onEditChat={(c) => setEditingChat(c)}
                onTogglePinChat={handleTogglePinChat}
                onToggleFavoriteChat={handleToggleFavoriteChat}
                onMoveChat={(c) => setMovingChat(c)}
                onRemoveFromGroup={handleRemoveFromGroup}
                onDuplicateChat={handleDuplicateChat}
                onToggleArchiveChat={handleToggleArchiveChat}
                onDeleteChat={(c) => setDeletingChat(c)}
              />
            );
          })}

          {/* Ungrouped Section */}
          {groupedChats.ungrouped.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                borderRadius: 'var(--wb-radius-lg)',
                border: '1px solid var(--wb-color-border-subtle)',
                backgroundColor: 'var(--wb-color-surface)',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--wb-color-fg-muted)" />
                  <span
                    style={{
                      fontSize: 'var(--wb-text-base)',
                      fontWeight: 'var(--wb-weight-semibold)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    Ungrouped Conversations
                  </span>
                  <Badge variant="neutral" badgeStyle="subtle">
                    {groupedChats.ungrouped.length}
                  </Badge>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1rem',
                }}
              >
                {groupedChats.ungrouped.map((chat) => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    onOpen={handleOpenChat}
                    onEdit={(c) => setEditingChat(c)}
                    onTogglePin={handleTogglePinChat}
                    onToggleFavorite={handleToggleFavoriteChat}
                    onMoveToGroup={(c) => setMovingChat(c)}
                    onDuplicate={handleDuplicateChat}
                    onToggleArchive={handleToggleArchiveChat}
                    onDelete={(c) => setDeletingChat(c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateChatDialog
        isOpen={isCreateChatOpen}
        projectId={project.id}
        defaultGroupId={targetGroupIdForNewChat}
        groups={groups}
        onClose={() => {
          setIsCreateChatOpen(false);
          setTargetGroupIdForNewChat(undefined);
        }}
        onChatCreated={(newChat) => {
          setChats((prev) => [newChat, ...prev]);
        }}
      />

      <EditChatDialog
        isOpen={!!editingChat}
        chat={editingChat}
        groups={groups}
        onClose={() => setEditingChat(null)}
        onChatUpdated={(updated) => {
          setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setEditingChat(null);
        }}
      />

      <MoveChatDialog
        isOpen={!!movingChat}
        chat={movingChat}
        groups={groups}
        onClose={() => setMovingChat(null)}
        onChatMoved={(updated) => {
          setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setMovingChat(null);
        }}
      />

      <DeleteChatDialog
        isOpen={!!deletingChat}
        chat={deletingChat}
        onClose={() => setDeletingChat(null)}
        onChatDeleted={(chatId) => {
          setChats((prev) => prev.filter((c) => c.id !== chatId));
          setDeletingChat(null);
        }}
      />

      <CreateChatGroupDialog
        isOpen={isCreateGroupOpen}
        projectId={project.id}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(newGroup) => {
          setGroups((prev) => [...prev, newGroup]);
        }}
      />

      <EditChatGroupDialog
        isOpen={!!editingGroup}
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
        onGroupUpdated={(updated) => {
          setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
          setEditingGroup(null);
        }}
      />

      <DeleteChatGroupDialog
        isOpen={!!deletingGroup}
        group={deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onGroupDeleted={(groupId) => {
          setGroups((prev) => prev.filter((g) => g.id !== groupId));
          // Reset groupId on local chats
          setChats((prev) =>
            prev.map((c) => (c.chatGroupId === groupId ? { ...c, chatGroupId: undefined } : c)),
          );
          setDeletingGroup(null);
        }}
      />
    </div>
  );
};
