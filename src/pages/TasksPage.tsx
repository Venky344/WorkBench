import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  EmptyState,
  LoadingState,
  ErrorState,
  Dialog,
  DialogFooter,
  Input,
  Textarea,
  Select,
} from '@/components/ui';
import { TagPicker } from '@/components/organization';
import {
  TaskCard,
  TaskFilterBar,
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskSortOption,
  isTaskOverdue,
} from '@/components/tasks';
import {
  useTaskService,
  useProjectService,
  useTagService,
  useWorkspaceContext,
} from '@/app/providers';
import { Task, Tag, Project, TaskPriority } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { Plus, CheckSquare } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { workspace } = useWorkspaceContext();
  const taskService = useTaskService();
  const projectService = useProjectService();
  const tagService = useTagService();

  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('order');

  // Create/Edit Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<EntityId>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!workspace) return;
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedTasks, fetchedProjects, fetchedTags] = await Promise.all([
        taskService.listTasksByWorkspace(workspace.id),
        projectService.listProjects(workspace.id),
        tagService.listTags(workspace.id),
      ]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setTags(fetchedTags);
      setTargetProjectId((prev) => prev || (fetchedProjects[0]?.id ?? ''));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load workspace tasks';
      setError(msg);
      toast.error(msg, 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  }, [workspace, taskService, projectService, tagService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await taskService.toggleComplete(task.id, task.projectId);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.info(
        `Task "${updated.title}" marked as ${updated.status === 'done' ? 'completed' : 'to do'}.`,
        'Task Updated',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(msg, 'Update Error');
    }
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setSelectedTagIds([]);
    if (projects.length > 0 && projects[0]) {
      setTargetProjectId(projects[0].id);
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setTargetProjectId(task.projectId);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    if (task.dueDate) {
      try {
        setDueDate(new Date(task.dueDate).toISOString().slice(0, 10));
      } catch {
        setDueDate('');
      }
    } else {
      setDueDate('');
    }
    setSelectedTagIds(task.tags || []);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }
    try {
      await taskService.deleteTask(task.id, task.projectId);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.success(`Task "${task.title}" deleted.`, 'Task Deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(msg, 'Delete Error');
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !title.trim() || !targetProjectId) return;

    setIsSaving(true);
    try {
      const isoDueDate = dueDate ? new Date(`${dueDate}T23:59:59.999Z`).toISOString() : undefined;

      if (editingTask) {
        const updated = await taskService.updateTask(
          editingTask.id,
          {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            dueDate: isoDueDate || null,
            tags: selectedTagIds,
          },
          editingTask.projectId,
        );
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success(`Task "${updated.title}" updated.`, 'Task Saved');
      } else {
        const created = await taskService.createTask({
          workspaceId: workspace.id,
          projectId: targetProjectId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: isoDueDate,
          tags: selectedTagIds,
        });
        setTasks((prev) => [...prev, created]);
        toast.success(`Task "${created.title}" created.`, 'Task Created');
      }
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  // Status counts
  const countsByStatus = useMemo(() => {
    let todo = 0;
    let in_progress = 0;
    let done = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === 'todo') todo++;
      else if (t.status === 'in_progress') in_progress++;
      else if (t.status === 'done') done++;

      if (isTaskOverdue(t)) overdue++;
    }

    return {
      all: tasks.length,
      todo,
      in_progress,
      done,
      overdue,
    };
  }, [tasks]);

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    for (const p of projects) {
      map.set(p.id, p.name);
    }
    return map;
  }, [projects]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter === 'overdue') {
      result = result.filter((t) => isTaskOverdue(t));
    } else if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (tagFilter !== 'all') {
      result = result.filter((t) => t.tags && t.tags.includes(tagFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    return result.sort((a, b) => {
      if (sortOption === 'due_date') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortOption === 'created_desc') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sortOption === 'priority_desc') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortOption === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, statusFilter, priorityFilter, tagFilter, searchQuery, sortOption]);

  if (isLoading) {
    return <LoadingState message="Loading tasks..." />;
  }

  if (error) {
    return <ErrorState title="Error Loading Tasks" message={error} onRetry={loadData} />;
  }

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
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
            Tasks
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Workspace-wide actionable deliverables, priorities, and deadlines.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={openCreateDialog}
          disabled={projects.length === 0}
        >
          New Task
        </Button>
      </div>

      {tasks.length > 0 && (
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          availableTags={tags}
          totalCount={tasks.length}
          countsByStatus={countsByStatus}
        />
      )}

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <div style={{ padding: '2rem 0' }}>
          <EmptyState
            icon={<CheckSquare size={36} />}
            title={tasks.length === 0 ? 'No tasks in workspace' : 'No tasks match your filters'}
            description={
              tasks.length === 0
                ? projects.length === 0
                  ? 'Create a project first before creating tasks.'
                  : 'Start tracking deliverables by creating your first task.'
                : 'Try adjusting your search terms or filter criteria.'
            }
            actionLabel={
              tasks.length === 0 && projects.length > 0 ? 'Create First Task' : undefined
            }
            onAction={tasks.length === 0 && projects.length > 0 ? openCreateDialog : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectName={projectMap.get(task.projectId)}
              tags={tags}
              onToggleComplete={handleToggleComplete}
              onEdit={openEditDialog}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      {workspace && (
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          description="Actionable deliverable with priority, project assignment, and deadline."
          maxWidth="580px"
        >
          <form
            onSubmit={handleSubmitTask}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {!editingTask && (
              <Select
                label="Assign to Project"
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                required
              />
            )}

            <Input
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Phase 10 validation report"
              required
            />

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details, scope, or requirements..."
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
              workspaceId={workspace.id}
              selectedTagIds={selectedTagIds}
              onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
              label="Tags (Optional)"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                disabled={!title.trim() || !targetProjectId || isSaving}
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  );
};
