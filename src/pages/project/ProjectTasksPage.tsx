import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { Button, EmptyState, LoadingState, ErrorState } from '@/components/ui';
import {
  TaskCard,
  TaskDialog,
  TaskFilterBar,
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskSortOption,
  isTaskOverdue,
} from '@/components/tasks';
import { useTaskService, useTagService, useWorkspaceContext } from '@/app/providers';
import { Task, Tag } from '@/domain/entities';
import { toast } from '@/stores/toast.store';
import { Plus, CheckSquare } from 'lucide-react';

export const ProjectTasksPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const { workspace } = useWorkspaceContext();
  const taskService = useTaskService();
  const tagService = useTagService();

  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('order');

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedTasks, fetchedTags] = await Promise.all([
        taskService.listTasksByProject(project.id),
        workspace ? tagService.listTags(workspace.id) : Promise.resolve([]),
      ]);
      setTasks(fetchedTasks);
      setTags(fetchedTags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load project tasks';
      setError(msg);
      toast.error(msg, 'Loading Error');
    } finally {
      setIsLoading(false);
    }
  }, [taskService, tagService, project.id, workspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await taskService.toggleComplete(task.id, project.id);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.info(
        `Task "${updated.title}" marked as ${updated.status === 'done' ? 'completed' : 'to do'}.`,
        'Task Updated',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle task completion';
      toast.error(msg, 'Update Error');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }
    try {
      await taskService.deleteTask(task.id, project.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.success(`Task "${task.title}" deleted.`, 'Task Deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(msg, 'Delete Error');
    }
  };

  const handleTaskSaved = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
      }
      return [...prev, savedTask];
    });
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

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (statusFilter === 'overdue') {
      result = result.filter((t) => isTaskOverdue(t));
    } else if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter((t) => t.tags && t.tags.includes(tagFilter));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    // Sorting
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
      // default: order
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
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            Tasks & Work Items
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Manage deliverables, backlogs, priorities, and deadlines for &quot;{project.name}&quot;.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}
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
            title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            description={
              tasks.length === 0
                ? `Keep your work organized by creating your first actionable task for "${project.name}".`
                : 'Try adjusting your search terms or filter criteria to find what you are looking for.'
            }
            actionLabel={tasks.length === 0 ? 'Create First Task' : undefined}
            onAction={
              tasks.length === 0
                ? () => {
                    setEditingTask(null);
                    setIsDialogOpen(true);
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tags={tags}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Dialog */}
      {workspace && (
        <TaskDialog
          task={editingTask}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingTask(null);
          }}
          workspaceId={workspace.id}
          projectId={project.id}
          onTaskSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};
