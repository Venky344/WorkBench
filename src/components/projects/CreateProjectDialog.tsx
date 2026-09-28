import React, { useState } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { ProjectColorPicker } from './ProjectColorPicker';
import { ProjectIconPicker } from './ProjectIconPicker';
import { useProjectService, useWorkspaceContext } from '@/app/providers';
import { Project } from '@/domain/entities';
import { toast } from '@/stores/toast.store';

export interface CreateProjectDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onProjectCreated: (project: Project) => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const projectService = useProjectService();
  const { workspace } = useWorkspaceContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('folder');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('blue');
    setIcon('folder');
    setTagInput('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) {
      setError('Workspace is not ready yet');
      return;
    }

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
      const tags = tagInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const created = await projectService.createProject({
        workspaceId: workspace.id,
        name: trimmedName,
        description: description.trim() || undefined,
        color,
        icon,
        tags,
      });

      toast.success(`Project "${created.name}" created successfully.`, 'Project Created');
      handleClose();
      onProjectCreated(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      setError(msg);
      toast.error(msg, 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      description="Create a dedicated workspace container for conversations, documents, tasks, and decisions."
      maxWidth="540px"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Project Name */}
        <Input
          id="create-project-name"
          label="Project Name"
          required
          placeholder="e.g. CricAuction, Signature Studio, Compiler Core..."
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
          id="create-project-description"
          label="Description (Optional)"
          placeholder="Brief description of the project goals, scope, or architecture..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color Palette */}
        <div>
          <label
            htmlFor="create-project-color-picker"
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
          <ProjectColorPicker id="create-project-color-picker" value={color} onChange={setColor} />
        </div>

        {/* Icon Selection */}
        <div>
          <label
            htmlFor="create-project-icon-picker"
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
          <ProjectIconPicker id="create-project-icon-picker" value={icon} onChange={setIcon} />
        </div>

        {/* Tags */}
        <Input
          id="create-project-tags"
          label="Tags (Comma separated, optional)"
          placeholder="frontend, backend, architecture, sprint"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          helperText="Tags help group projects across your workspace."
        />

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Project
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
