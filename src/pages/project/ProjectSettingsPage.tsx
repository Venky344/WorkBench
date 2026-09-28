import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Separator,
} from '@/components/ui';
import { ProjectColorPicker, ProjectIconPicker, DeleteProjectDialog } from '@/components/projects';
import { Settings, Star, Archive, RefreshCw, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useProjectService } from '@/app/providers';
import { toast } from '@/stores/toast.store';

export const ProjectSettingsPage: React.FC = () => {
  const { project, onProjectUpdated, onProjectDeleted } =
    useOutletContext<ProjectWorkspaceContextValue>();
  const projectService = useProjectService();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [color, setColor] = useState(project.color ?? 'blue');
  const [icon, setIcon] = useState(project.icon ?? 'folder');
  const [tagInput, setTagInput] = useState(project.tags.join(', '));
  const [instructions, setInstructions] = useState(project.instructions ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
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
    setIsSaving(true);

    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const updated = await projectService.updateProject(project.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        color,
        icon,
        tags,
        instructions: instructions.trim() || undefined,
      });

      onProjectUpdated(updated);
      toast.success('Project settings updated successfully.', 'Settings Saved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
      setError(msg);
      toast.error(msg, 'Update Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      const updated = await projectService.setPinned(project.id, !project.isPinned);
      onProjectUpdated(updated);
      toast.info(
        updated.isPinned
          ? `Project "${project.name}" pinned.`
          : `Project "${project.name}" unpinned.`,
        'Project Updated',
      );
    } catch {
      toast.error('Failed to update pin state', 'Error');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
      {/* General Settings Card */}
      <Card variant="default">
        <CardHeader style={{ borderBottom: '1px solid var(--wb-color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="var(--wb-color-primary)" />
            <CardTitle style={{ fontSize: 'var(--wb-text-base)', margin: 0 }}>
              General Configuration
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent style={{ paddingTop: '1.25rem' }}>
          <form
            noValidate
            onSubmit={handleSaveSettings}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Project Name */}
            <Input
              id="project-settings-name"
              label="Project Name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              errorMessage={error ?? undefined}
            />

            {/* Description */}
            <Textarea
              id="project-settings-description"
              label="Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of project goals and scope..."
            />

            {/* Color Palette */}
            <div>
              <label
                htmlFor="project-settings-color-picker"
                style={{
                  display: 'block',
                  fontSize: 'var(--wb-text-xs)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Project Theme Color
              </label>
              <ProjectColorPicker
                id="project-settings-color-picker"
                value={color}
                onChange={setColor}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label
                htmlFor="project-settings-icon-picker"
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
              <ProjectIconPicker
                id="project-settings-icon-picker"
                value={icon}
                onChange={setIcon}
              />
            </div>

            {/* Tags */}
            <Input
              id="project-settings-tags"
              label="Tags (Comma separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              helperText="Tags group related projects across your workspace."
            />

            {/* Instructions / Context */}
            <Textarea
              id="project-settings-instructions"
              label="Project Context & Guidelines"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Document architectural guidelines, technology stack, and conventions..."
              helperText="Guidelines are saved locally with this project."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Check size={14} />}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lifecycle Actions Card */}
      <Card variant="default">
        <CardHeader style={{ borderBottom: '1px solid var(--wb-color-border-subtle)' }}>
          <CardTitle style={{ fontSize: 'var(--wb-text-base)', margin: 0 }}>
            Project Lifecycle & Pin Status
          </CardTitle>
        </CardHeader>
        <CardContent
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                {project.isPinned ? 'Project is Pinned' : 'Pin Project'}
              </div>
              <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Pinned projects are prioritized at the top of your projects directory.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Star size={14} fill={project.isPinned ? 'currentColor' : 'none'} />}
              onClick={handleTogglePin}
            >
              {project.isPinned ? 'Unpin Project' : 'Pin to Top'}
            </Button>
          </div>

          <Separator />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                {project.isArchived ? 'Project is Archived' : 'Archive Project'}
              </div>
              <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Archived projects are hidden from active views but retain all data.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={project.isArchived ? <RefreshCw size={14} /> : <Archive size={14} />}
              onClick={handleArchiveToggle}
            >
              {project.isArchived ? 'Restore to Active' : 'Archive Project'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        variant="default"
        style={{
          border: '1px solid var(--wb-color-destructive-subtle)',
          backgroundColor: 'rgba(239, 68, 68, 0.02)',
        }}
      >
        <CardHeader style={{ borderBottom: '1px solid var(--wb-color-destructive-subtle)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wb-color-destructive)',
            }}
          >
            <AlertTriangle size={18} />
            <CardTitle
              style={{
                fontSize: 'var(--wb-text-base)',
                margin: 0,
                color: 'var(--wb-color-destructive)',
              }}
            >
              Danger Zone
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ paddingTop: '1.25rem' }}>
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
              <div
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                Delete this Project
              </div>
              <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Permanently delete this project from local persistence. This action cannot be
                undone.
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete Project...
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onProjectDeleted={onProjectDeleted}
      />
    </div>
  );
};
