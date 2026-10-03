import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useTaskService } from '@/app/providers';
import { Task, Tag, TaskPriority } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

export interface TaskDialogProps {
  readonly task?: Task | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onTaskSaved: (task: Task) => void;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  task,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onTaskSaved,
}) => {
  const taskService = useTaskService();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      // Format ISO string to YYYY-MM-DD for date input
      if (task.dueDate) {
        try {
          const d = new Date(task.dueDate);
          setDueDate(d.toISOString().slice(0, 10));
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
      setSelectedTagIds(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setSelectedTagIds([]);
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const isoDueDate = dueDate ? new Date(`${dueDate}T23:59:59.999Z`).toISOString() : undefined;

      if (task) {
        const updated = await taskService.updateTask(
          task.id,
          {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            dueDate: isoDueDate || null,
            tags: selectedTagIds,
          },
          projectId,
        );
        toast.success(`Task "${updated.title}" updated.`, 'Task Saved');
        onTaskSaved(updated);
      } else {
        const created = await taskService.createTask({
          workspaceId,
          projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: isoDueDate,
          tags: selectedTagIds,
        });
        toast.success(`Task "${created.title}" created.`, 'Task Created');
        onTaskSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      description="Actionable deliverable with priority, due date, and tags."
      maxWidth="580px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement WebSocket auth handshake with HMAC signatures"
          required
        />

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide additional details, criteria, or context for this work item..."
          rows={4}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'low', label: 'Low Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'high', label: 'High Priority' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />

          <Input
            type="date"
            label="Due Date (Optional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <TagPicker
          workspaceId={workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
          label="Tags (Optional)"
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!title.trim() || isSaving}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
