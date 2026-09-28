import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '@/domain/entities';
import { useProjectService } from '@/app/providers';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Separator,
  ErrorState,
  Skeleton,
} from '@/components/ui';
import {
  EditProjectDialog,
  DeleteProjectDialog,
  getProjectColorVar,
  renderProjectIcon,
} from '@/components/projects';
import {
  ArrowLeft,
  Edit3,
  Star,
  Archive,
  RefreshCw,
  Trash2,
  Calendar,
  Clock,
  Tag as TagIcon,
  MessageSquare,
  FileText,
  CheckSquare,
  GitCommit,
  BookMarked,
  Code,
} from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectService = useProjectService();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const found = await projectService.getProject(projectId);
      setProject(found);
    } catch {
      setError('Project not found. This project may have been deleted or is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const handleTogglePin = async () => {
    if (!project) return;
    try {
      const updated = await projectService.setPinned(project.id, !project.isPinned);
      setProject(updated);
      toast.info(
        updated.isPinned
          ? `Project "${project.name}" pinned.`
          : `Project "${project.name}" unpinned.`,
        'Project Updated',
      );
    } catch {
      toast.error('Failed to update pin status', 'Error');
    }
  };

  const handleArchiveToggle = async () => {
    if (!project) return;
    try {
      if (project.isArchived) {
        const restored = await projectService.restoreProject(project.id);
        setProject(restored);
        toast.success(`Project "${project.name}" restored to active.`, 'Project Restored');
      } else {
        const archived = await projectService.archiveProject(project.id);
        setProject(archived);
        toast.info(`Project "${project.name}" archived.`, 'Project Archived');
      }
    } catch {
      toast.error('Failed to update archive status', 'Error');
    }
  };

  const handleProjectUpdated = (updated: Project) => {
    setProject(updated);
  };

  const handleProjectDeleted = () => {
    navigate('/projects');
  };

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Skeleton circle width="3rem" height="3rem" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Skeleton width="40%" height="2rem" />
            <Skeleton width="60%" height="1.25rem" />
          </div>
        </div>
        <Skeleton height="200px" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <ErrorState
          title="Project Not Found"
          message={error ?? 'This project may have been deleted or is unavailable.'}
          retryLabel="Back to Projects"
          onRetry={() => navigate('/projects')}
        />
      </div>
    );
  }

  const colorVar = getProjectColorVar(project.color);

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Top Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </Button>
      </div>

      {/* Project Header Banner */}
      <Card
        variant="elevated"
        style={{
          borderLeft: `6px solid ${colorVar}`,
          padding: '1.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              flex: 1,
              minWidth: '280px',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--wb-radius-lg)',
                backgroundColor: 'var(--wb-color-surface-active)',
                color: colorVar,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {renderProjectIcon(project.icon, 28)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'var(--wb-text-2xl)',
                    fontWeight: 'var(--wb-weight-bold)',
                  }}
                >
                  {project.name}
                </h1>

                {project.isArchived ? (
                  <Badge variant="warning">Archived</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}

                {project.isPinned && (
                  <Badge variant="warning" badgeStyle="outline">
                    <Star size={12} /> Pinned
                  </Badge>
                )}

                <Badge variant="neutral" badgeStyle="subtle">
                  /{project.slug}
                </Badge>
              </div>

              {project.description && (
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: 'var(--wb-text-sm)',
                    color: 'var(--wb-color-fg-muted)',
                    lineHeight: 'var(--wb-leading-relaxed)',
                  }}
                >
                  {project.description}
                </p>
              )}

              {project.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.375rem',
                    flexWrap: 'wrap',
                    marginTop: '0.5rem',
                  }}
                >
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="neutral" badgeStyle="subtle">
                      <TagIcon size={12} /> {tag.replace(/^#/, '')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={() => setIsEditOpen(true)}
            >
              Edit Metadata
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Star size={14} fill={project.isPinned ? 'currentColor' : 'none'} />}
              onClick={handleTogglePin}
            >
              {project.isPinned ? 'Unpin' : 'Pin'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={project.isArchived ? <RefreshCw size={14} /> : <Archive size={14} />}
              onClick={handleArchiveToggle}
            >
              {project.isArchived ? 'Restore' : 'Archive'}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Project Metadata Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card variant="default">
          <CardHeader>
            <CardTitle style={{ fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
              Project Identity
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: 'var(--wb-text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Project ID: </span>
              <code style={{ fontSize: '11px', color: 'var(--wb-color-fg)' }}>{project.id}</code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Workspace ID: </span>
              <code style={{ fontSize: '11px', color: 'var(--wb-color-fg)' }}>
                {project.workspaceId}
              </code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>URL Slug: </span>
              <span style={{ fontWeight: 'var(--wb-weight-medium)' }}>{project.slug}</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle style={{ fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
              Timeline & Activity
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: 'var(--wb-text-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} color="var(--wb-color-fg-subtle)" />
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Created: </span>
              <span>{new Date(project.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} color="var(--wb-color-fg-subtle)" />
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Last Updated: </span>
              <span>{new Date(project.updatedAt).toLocaleString()}</span>
            </div>
            {project.archivedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Archive size={14} color="var(--wb-color-warning)" />
                <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Archived At: </span>
                <span>{new Date(project.archivedAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Project Workspace Content Sections (Placeholders clearly marked for future phases) */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2
            style={{
              fontSize: 'var(--wb-text-lg)',
              fontWeight: 'var(--wb-weight-semibold)',
              margin: 0,
            }}
          >
            Workspace Content
          </h2>
          <p
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              margin: '0.25rem 0 0 0',
            }}
          >
            Child entities and multi-tab workspace views will be introduced in Phases 6–10.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { title: 'Conversations & Chats', icon: <MessageSquare size={16} />, phase: 'Phase 7' },
            { title: 'Files & Documents', icon: <FileText size={16} />, phase: 'Phase 9' },
            { title: 'Notes & Code Snippets', icon: <Code size={16} />, phase: 'Phase 9 & 14' },
            { title: 'Tasks & Work Items', icon: <CheckSquare size={16} />, phase: 'Phase 10' },
            { title: 'Architectural Decisions', icon: <GitCommit size={16} />, phase: 'Phase 10' },
            { title: 'Resources & Bookmarks', icon: <BookMarked size={16} />, phase: 'Phase 9' },
          ].map((item) => (
            <Card
              key={item.title}
              variant="default"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1rem',
                borderStyle: 'dashed',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 'var(--wb-weight-medium)',
                    fontSize: 'var(--wb-text-sm)',
                  }}
                >
                  <span style={{ color: 'var(--wb-color-primary)' }}>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <Badge variant="neutral" badgeStyle="subtle">
                  {item.phase}
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
                Container initialized. Feature scheduled for {item.phase}.
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit & Delete Dialogs */}
      <EditProjectDialog
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProjectUpdated={handleProjectUpdated}
      />

      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  );
};
