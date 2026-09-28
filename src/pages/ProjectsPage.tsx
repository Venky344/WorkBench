import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/domain/entities';
import { useProjectService, useWorkspaceContext } from '@/app/providers';
import { Button, Input, Select, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import {
  ProjectCard,
  CreateProjectDialog,
  EditProjectDialog,
  DeleteProjectDialog,
} from '@/components/projects';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { toast } from '@/stores/toast.store';
import { ProjectFilter, ProjectSortBy } from '@/services/project.service';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const projectService = useProjectService();
  const { workspace, isReady } = useWorkspaceContext();

  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>('active');
  const [sortBy, setSortBy] = useState<ProjectSortBy>('updatedAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    if (!workspace) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await projectService.listProjects(workspace.id, {
        filter,
        sortBy,
        searchQuery,
      });
      setProjects(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load projects';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [workspace, projectService, filter, sortBy, searchQuery]);

  useEffect(() => {
    if (isReady && workspace) {
      void loadProjects();
    }
  }, [isReady, workspace, loadProjects]);

  // Handlers
  const handleOpenProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleTogglePin = async (project: Project) => {
    try {
      const updated = await projectService.setPinned(project.id, !project.isPinned);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.info(
        updated.isPinned
          ? `Project "${project.name}" pinned to top.`
          : `Project "${project.name}" unpinned.`,
        'Project Updated',
      );
      // Reload to re-sort if necessary
      void loadProjects();
    } catch {
      toast.error('Failed to update pin state', 'Error');
    }
  };

  const handleArchiveToggle = async (project: Project) => {
    try {
      if (project.isArchived) {
        const restored = await projectService.restoreProject(project.id);
        setProjects((prev) => prev.map((p) => (p.id === restored.id ? restored : p)));
        toast.success(`Project "${project.name}" restored to active projects.`, 'Project Restored');
      } else {
        const archived = await projectService.archiveProject(project.id);
        setProjects((prev) => prev.map((p) => (p.id === archived.id ? archived : p)));
        toast.info(`Project "${project.name}" archived.`, 'Project Archived');
      }
      void loadProjects();
    } catch {
      toast.error('Failed to update project archive state', 'Error');
    }
  };

  const handleProjectCreated = (_newProject: Project) => {
    void loadProjects();
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    void loadProjects();
  };

  const handleProjectDeleted = (deletedProject: Project) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedProject.id));
    void loadProjects();
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header Section */}
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
            Projects
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Organize conversations, files, notes, tasks, and decisions into focused workspaces.
          </p>
        </div>

        <Button
          id="new-project-button"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        {/* Filter Buttons */}
        <div
          role="tablist"
          aria-label="Filter Projects"
          style={{
            display: 'flex',
            gap: '0.375rem',
            backgroundColor: 'var(--wb-color-surface-card)',
            padding: '0.25rem',
            borderRadius: 'var(--wb-radius-md)',
            border: '1px solid var(--wb-color-border-subtle)',
          }}
        >
          {(['active', 'pinned', 'archived', 'all'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: 'var(--wb-text-xs)',
                  fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
                  borderRadius: 'var(--wb-radius-sm)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--wb-color-surface-active)' : 'transparent',
                  color: isActive ? 'var(--wb-color-fg)' : 'var(--wb-color-fg-muted)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'var(--wb-transition-colors)',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
            minWidth: '280px',
          }}
        >
          <div style={{ maxWidth: '260px', width: '100%' }}>
            <Input
              id="search-projects-input"
              placeholder="Search projects..."
              leftIcon={<Search size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '160px' }}>
            <Select
              id="sort-projects-select"
              aria-label="Sort projects by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProjectSortBy)}
              options={[
                { value: 'updatedAt', label: 'Recently Updated' },
                { value: 'createdAt', label: 'Recently Created' },
                { value: 'name', label: 'Name (A-Z)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1.25rem',
                borderRadius: 'var(--wb-radius-lg)',
                backgroundColor: 'var(--wb-color-surface-card)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Skeleton circle width="2rem" height="2rem" />
                <Skeleton width="60%" height="1.25rem" />
              </div>
              <Skeleton width="90%" height="1rem" />
              <Skeleton width="40%" height="1rem" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Unable to load projects" message={error} onRetry={loadProjects} />
      ) : projects.length === 0 ? (
        searchQuery ? (
          <EmptyState
            title="No matching projects"
            description={`No projects found matching "${searchQuery}".`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : filter === 'archived' ? (
          <EmptyState
            title="No archived projects"
            description="Projects you archive will appear here."
          />
        ) : filter === 'pinned' ? (
          <EmptyState
            title="No pinned projects"
            description="Pin frequently accessed projects to find them quickly."
          />
        ) : (
          <EmptyState
            icon={<FolderKanban size={32} />}
            title="No projects yet"
            description="Organize your work into focused workspaces. Create your first project to get started."
            actionLabel="Create Project"
            onAction={() => setIsCreateOpen(true)}
          />
        )
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={handleOpenProject}
              onEdit={(p) => setEditingProject(p)}
              onTogglePin={handleTogglePin}
              onArchiveToggle={handleArchiveToggle}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <EditProjectDialog
        project={editingProject}
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        onProjectUpdated={handleProjectUpdated}
      />

      <DeleteProjectDialog
        project={deletingProject}
        isOpen={deletingProject !== null}
        onClose={() => setDeletingProject(null)}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  );
};
