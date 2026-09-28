import React, { useState } from 'react';
import { Project } from '@/domain/entities';
import { Card, Button, Badge } from '@/components/ui';
import {
  EditProjectDialog,
  DeleteProjectDialog,
  getProjectColorVar,
  renderProjectIcon,
} from '@/components/projects';
import { Edit3, Star, Archive, RefreshCw, Trash2, Tag as TagIcon } from 'lucide-react';
import { useProjectService } from '@/app/providers';
import { toast } from '@/stores/toast.store';

export interface ProjectHeaderProps {
  readonly project: Project;
  readonly onProjectUpdated: (updated: Project) => void;
  readonly onProjectDeleted: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const projectService = useProjectService();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const colorVar = getProjectColorVar(project.color);

  const handleTogglePin = async () => {
    try {
      const updated = await projectService.setPinned(project.id, !project.isPinned);
      onProjectUpdated(updated);
      toast.info(
        updated.isPinned
          ? `Project "${project.name}" pinned to top.`
          : `Project "${project.name}" unpinned.`,
        'Project Updated',
      );
    } catch {
      toast.error('Failed to update pin status', 'Error');
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (project.isArchived) {
        const restored = await projectService.restoreProject(project.id);
        onProjectUpdated(restored);
        toast.success(`Project "${project.name}" restored to active.`, 'Project Restored');
      } else {
        const archived = await projectService.archiveProject(project.id);
        onProjectUpdated(archived);
        toast.info(`Project "${project.name}" archived.`, 'Project Archived');
      }
    } catch {
      toast.error('Failed to update archive status', 'Error');
    }
  };

  return (
    <>
      <Card
        variant="elevated"
        style={{
          borderLeft: `6px solid ${colorVar}`,
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Project Identity */}
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
                width: '3.25rem',
                height: '3.25rem',
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
                    color: 'var(--wb-color-fg)',
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
                  {`/${project.slug}`}
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

              {project.tags && project.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.375rem',
                    flexWrap: 'wrap',
                    marginTop: '0.375rem',
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

          {/* Action Bar */}
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

      {/* Edit & Delete Dialogs */}
      <EditProjectDialog
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProjectUpdated={onProjectUpdated}
      />

      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onProjectDeleted={onProjectDeleted}
      />
    </>
  );
};
