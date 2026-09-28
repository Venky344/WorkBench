import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  EmptyState,
  LoadingState,
} from '@/components/ui';
import { MessageSquare, Search, Upload, Folder, ArrowRight, Heart, Pin, Clock } from 'lucide-react';
import { useChatService, useProjectService, useWorkspaceContext } from '@/app/providers';
import { Chat, Project } from '@/domain/entities';
import { toast } from '@/stores/toast.store';

export const ChatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspaceContext();
  const chatService = useChatService();
  const projectService = useProjectService();

  const [chats, setChats] = useState<readonly Chat[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, Project>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('active');

  const loadWorkspaceChats = useCallback(async () => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      const [allChats, allProjects] = await Promise.all([
        chatService.listWorkspaceChats(workspace.id),
        projectService.listProjects(workspace.id),
      ]);

      setChats(allChats);

      const pMap: Record<string, Project> = {};
      allProjects.forEach((p) => {
        pMap[p.id] = p;
      });
      setProjectsMap(pMap);
    } catch {
      toast.error('Failed to load workspace conversations', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [workspace, chatService, projectService]);

  useEffect(() => {
    loadWorkspaceChats();
  }, [loadWorkspaceChats]);

  const filteredChats = React.useMemo(() => {
    let result = [...chats];

    if (filterTab === 'active') {
      result = result.filter((c) => !c.isArchived);
    } else if (filterTab === 'pinned') {
      result = result.filter((c) => c.isPinned && !c.isArchived);
    } else if (filterTab === 'favorites') {
      result = result.filter((c) => c.isFavorite && !c.isArchived);
    } else if (filterTab === 'archived') {
      result = result.filter((c) => c.isArchived);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c) => {
        const projectName = c.projectId ? projectsMap[c.projectId]?.name.toLowerCase() : '';
        return (
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.source && c.source.toLowerCase().includes(q)) ||
          (projectName && projectName.includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [chats, filterTab, searchQuery, projectsMap]);

  if (isLoading) {
    return <LoadingState message="Loading conversations across workspace..." />;
  }

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
      {/* Header */}
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
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            All Conversations
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Workspace-level directory of conversations organized across all your projects.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Upload size={16} />}
          onClick={() =>
            toast.info(
              'Universal Import Engine will be implemented in Phase 15 & 16.',
              'Import Hub',
            )
          }
        >
          Import Conversation
        </Button>
      </div>

      {/* Filter and Control Bar */}
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
                    fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <Input
              id="global-search-chats"
              placeholder="Search conversations across all projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              style={{ fontSize: 'var(--wb-text-xs)' }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Conversation List Cards */}
      {filteredChats.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={36} />}
          title="No conversations found"
          description={
            searchQuery || filterTab !== 'active'
              ? 'No conversation records match your current filters.'
              : 'Create a conversation inside any project to see it indexed here.'
          }
          actionLabel={searchQuery || filterTab !== 'active' ? 'Reset Filters' : 'Go to Projects'}
          onAction={() => {
            if (searchQuery || filterTab !== 'active') {
              setSearchQuery('');
              setFilterTab('active');
            } else {
              navigate('/projects');
            }
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredChats.map((chat) => {
            const project = chat.projectId ? projectsMap[chat.projectId] : null;
            return (
              <Card key={chat.id} variant="default">
                <CardHeader style={{ paddingBottom: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={18} color="var(--wb-color-primary)" />
                      <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                        {chat.title}
                      </CardTitle>
                      {chat.source && chat.source !== 'manual' && (
                        <Badge variant="info">{chat.source}</Badge>
                      )}
                      {chat.isPinned && <Pin size={14} color="var(--wb-color-warning)" />}
                      {chat.isFavorite && (
                        <Heart
                          size={14}
                          color="var(--wb-color-danger)"
                          fill="var(--wb-color-danger)"
                        />
                      )}
                    </div>

                    {project && (
                      <Badge
                        variant="neutral"
                        badgeStyle="outline"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/projects/${project.id}/chats`)}
                      >
                        <Folder size={12} style={{ marginRight: '0.25rem' }} />
                        {project.name}
                      </Badge>
                    )}
                  </div>

                  {chat.description && (
                    <CardDescription style={{ marginTop: '0.25rem' }}>
                      {chat.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent style={{ paddingTop: 0, paddingBottom: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: 'var(--wb-text-xs)',
                      color: 'var(--wb-color-fg-subtle)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      Updated {new Date(chat.lastActivityAt ?? chat.updatedAt).toLocaleDateString()}
                    </span>
                    {chat.tags && chat.tags.length > 0 && (
                      <span>{chat.tags.map((t) => `#${t.replace(/^#/, '')}`).join(' ')}</span>
                    )}
                  </div>
                </CardContent>

                <CardFooter style={{ paddingTop: '0.25rem' }}>
                  {project ? (
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={() => navigate(`/projects/${project.id}/chats/${chat.id}`)}
                    >
                      Open in {project.name}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      Open Conversation
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
