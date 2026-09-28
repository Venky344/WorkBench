import React, { useState } from 'react';
import { Dialog, DialogFooter, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { Project } from '@/domain/entities';
import { useProjectService } from '@/app/providers';
import { toast } from '@/stores/toast.store';

export interface DeleteProjectDialogProps {
  readonly project: Project | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onProjectDeleted: (project: Project) => void;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  project,
  isOpen,
  onClose,
  onProjectDeleted,
}) => {
  const projectService = useProjectService();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      toast.success(`Project "${project.name}" has been permanently deleted.`, 'Project Deleted');
      onClose();
      onProjectDeleted(project);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(msg, 'Deletion Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project?"
      description="This action cannot be undone."
      maxWidth="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: 'var(--wb-radius-md)',
            backgroundColor: 'var(--wb-color-destructive-subtle)',
            color: 'var(--wb-color-destructive)',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--wb-text-sm)', lineHeight: 'var(--wb-leading-normal)' }}>
            Are you sure you want to delete <strong>{project.name}</strong>? This will permanently
            remove this project from your workspace.
          </div>
        </div>

        <DialogFooter style={{ marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} isLoading={isDeleting}>
            Delete Project
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
