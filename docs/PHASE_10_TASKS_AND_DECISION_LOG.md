# Phase 10: Tasks & Decision Log

## 1. Overview & Objective

WorkBench Phase 10 introduces two production-quality, persistent modules:

1. **Task Management System**: Actionable work items belonging to projects, supporting priorities, optional due dates, status lifecycle (`todo`, `in_progress`, `done`, `cancelled`), derived overdue calculation, tag integration, manual order, deterministic filtering, and workspace-level directories.
2. **Decision Log (ADR System)**: Structured Architecture Decision Records capturing the title, decision choice, context & rationale, implications/consequences, status (`proposed`, `accepted`, `superseded`, `rejected`), tag integration, search capabilities, full-record inspections, and workspace-wide directories.

Both modules operate with complete local-first persistence through WorkBench's repository architecture and enforce strict workspace and project isolation.

---

## 2. Domain Models & Contracts

### Task Model

Defined in `src/domain/entities/task.entity.ts`:

```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate?: ISOTimestamp;
  readonly completedAt?: ISOTimestamp;
  readonly sourceChatId?: EntityId;
  readonly sourceMessageId?: EntityId;
  readonly decisionId?: EntityId;
  readonly order: number;
  readonly tags: readonly EntityId[];
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}
```

### Decision Model

Defined in `src/domain/entities/decision.entity.ts`:

```typescript
export type DecisionStatus = 'proposed' | 'accepted' | 'superseded' | 'rejected';

export interface Decision extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly status: DecisionStatus;
  readonly decision: string;
  readonly rationale: string;
  readonly implications?: string;
  readonly sourceChatId?: EntityId;
  readonly sourceMessageId?: EntityId;
  readonly tags: readonly EntityId[];
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}
```

---

## 3. Architecture & Service Layer

### Layering Pattern

`UI Components -> React Service Hooks -> Services -> Repositories -> Storage Engine (IndexedDB / Memory Engine)`

### TaskService (`src/services/task.service.ts`)

- `createTask(params)`: Validates title, assigns default status (`todo`), default priority (`medium`), order, created timestamp, and persists.
- `getTask(taskId)` / `getTaskOrThrow(taskId, expectedProjectId?)`: Retrieves task with cross-project isolation checks.
- `updateTask(taskId, updates, expectedProjectId?)`: Updates title, description, priority, dueDate, order, and tags.
- `updateTaskStatus(taskId, status, expectedProjectId?)`: Transitions status, sets `completedAt` timestamp on `done`, clears on reopen.
- `toggleComplete(taskId, expectedProjectId?)`: Toggles status between `todo` and `done`.
- `reopenTask(taskId, expectedProjectId?)`: Resets status to `todo` and clears `completedAt`.
- `deleteTask(taskId, expectedProjectId?)`: Enforces isolation and deletes task record.
- `listTasksByProject(projectId, options?)`: Queries project tasks with deterministic filtering by status, priority, tag, and sorting.
- `listTasksByWorkspace(workspaceId, options?)`: Queries workspace-wide tasks with deterministic filtering and sorting.

### DecisionService (`src/services/decision.service.ts`)

- `createDecision(params)`: Validates title, decision text, and rationale; persists ADR record with status and tags.
- `getDecision(decisionId)` / `getDecisionOrThrow(decisionId, expectedProjectId?)`: Retrieves decision with isolation checks.
- `updateDecision(decisionId, updates, expectedProjectId?)`: Updates title, status, decision, rationale, implications, and tags.
- `deleteDecision(decisionId, expectedProjectId?)`: Enforces isolation and deletes decision record.
- `listDecisionsByProject(projectId, options?)`: Queries project decisions with deterministic status/tag filtering and sorting.
- `listDecisionsByWorkspace(workspaceId, options?)`: Queries workspace-wide decisions with filtering and sorting.

### Tag System Integration (`src/services/tag.service.ts`)

- **Cascading Cleanup**: Deleting a tag cleans up tag ID references from all tasks and decisions in the workspace without deleting the underlying tasks or decisions.
- **Usage Counts**: `getTagUsageCount` includes `taskCount` and `decisionCount` in the breakdown and `totalCount`.

---

## 4. UI Components & Pages

### Components

1. **Tasks Components (`src/components/tasks/`)**:
   - `TaskCard.tsx`: Displays checkbox, priority badge, title (with strike-through when completed), description, due date, derived overdue indicator, project badge, tag badges, and edit/delete actions.
   - `TaskDialog.tsx`: Modal for creating and editing tasks with priority select, date picker, description, and `TagPicker`.
   - `TaskFilterBar.tsx`: Status tabs (`All`, `To Do`, `In Progress`, `Completed`, `Overdue`), priority select, tag filter select, local search, and sorting.
   - `task-utils.ts`: Overdue derivation and priority badge variant mapping.
2. **Decisions Components (`src/components/decisions/`)**:
   - `DecisionCard.tsx`: Displays status badge (`accepted`, `proposed`, `superseded`, `rejected`), decision text, rationale, consequences/outcomes, date, project badge, tags, and full record trigger.
   - `DecisionDialog.tsx`: Modal for creating and editing ADRs with status selector, decision text, rationale, implications, and `TagPicker`.
   - `DecisionDetailDialog.tsx`: Modal for full record inspection and quick editing.
   - `DecisionFilterBar.tsx`: Status tabs, tag filter select, search input (matching title, decision, rationale, implications), and sorting.
   - `decision-utils.ts`: Decision status badge variant mapping.

### Routes & Pages

- **Project Tasks Directory**: `/projects/:projectId/tasks` rendered via `ProjectTasksPage.tsx`.
- **Project Decision Log**: `/projects/:projectId/decisions` rendered via `ProjectDecisionsPage.tsx`.
- **Global Tasks Directory**: `/tasks` rendered via `TasksPage.tsx`.
- **Global Decision Log**: `/decisions` rendered via `DecisionsPage.tsx`.

---

## 5. Persistence & Storage Architecture

- Tasks and decisions are persisted in IndexedDB object stores `tasks` and `decisions` with fallback to `MemoryStorageEngine`.
- Schema indexes in `src/persistence/schema.ts`:
  - `tasks`: `by_workspaceId`, `by_projectId`, `by_status`, `by_priority`, `by_dueDate`.
  - `decisions`: `by_workspaceId`, `by_projectId`, `by_status`.

---

## 6. Verification & Test Suite Summary

- **Vitest Suites**: 51 test files, 226 tests passed (100% passing).
- **TypeScript**: 0 errors (`tsc --noEmit` and `tsc -b`).
- **ESLint**: 0 errors, 0 warnings (`eslint .`).
- **Prettier**: All matched files use Prettier code style (`prettier --check .`).
- **Production Build**: Clean bundle in 3.32s via Vite.

---

## 7. Scope Boundaries & Roadmap Compliance

- **No AI / LLM Wrappers**: All prioritization, filtering, and decision tracking are deterministic and local-first.
- **No Reminders / Calendar Sync**: Reserved for future calendar and scheduling phases.
- **No Automation Rules**: Reserved for Phase 20.
- **No Universal Search / Semantic Indexing**: Reserved for Phase 13.
- **No Cloud Synchronization**: Reserved for Phase 27.
