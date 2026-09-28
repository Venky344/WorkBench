import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { ProjectColorPicker } from './ProjectColorPicker';
import { ProjectIconPicker } from './ProjectIconPicker';
import { TagPicker } from '@/components/organization';
import { useProjectService, useWorkspaceContext } from '@/app/providers';
import { Project } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface EditProjectDialogProps {
  readonly project: Project | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onProjectUpdated: (project: Project) => void;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
}) => {
  const projectService = useProjectService();
  const { workspace } = useWorkspaceContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('folder');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setColor(project.color ?? 'blue');
      setIcon(project.icon ?? 'folder');
      setSelectedTagIds(project.tags ? [...project.tags] : []);
      setError(null);
    }
  }, [project, isOpen]);

  if (!project) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Project name must not exceed 100 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await projectService.updateProject(project.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        color,
        icon,
        tags: selectedTagIds,
      });

      toast.success(`Project "${updated.name}" updated successfully.`, 'Project Updated');
      onClose();
      onProjectUpdated(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update project';
      setError(msg);
      toast.error(msg, 'Update Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project Metadata"
      description={`Update settings and configuration for ${project.name}.`}
      maxWidth="540px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Project Name */}
        <Input
          id="edit-project-name"
          label="Project Name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          errorMessage={error ?? undefined}
          autoFocus
        />

        {/* Description */}
        <Textarea
          id="edit-project-description"
          label="Description"
          placeholder="Brief description of the project..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color Palette */}
        <div>
          <label
            htmlFor="edit-project-color-picker"
            style={{
              display: 'block',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
              color: 'var(--wb-color-fg-muted)',
              marginBottom: '0.5rem',
            }}
          >
            Project Color
          </label>
          <ProjectColorPicker id="edit-project-color-picker" value={color} onChange={setColor} />
        </div>

        {/* Icon Selection */}
        <div>
          <label
            htmlFor="edit-project-icon-picker"
            style={{
              display: 'block',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
              color: 'var(--wb-color-fg-muted)',
              marginBottom: '0.5rem',
            }}
          >
            Project Icon
          </label>
          <ProjectIconPicker id="edit-project-icon-picker" value={icon} onChange={setIcon} />
        </div>

        {/* Tags */}
        {workspace && (
          <TagPicker
            workspaceId={workspace.id}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            label="Tags"
            placeholder="Assign or create tags..."
          />
        )}

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
