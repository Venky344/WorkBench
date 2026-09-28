# Phase 6 — Project Workspace Implementation

## 1. Objective

Phase 6 transforms an individual **WorkBench Project** into a complete, structured, and responsive **Project Workspace Experience**.

When a user navigates to `/projects/:projectId`, they enter a dedicated workspace providing project identity, project context and instructions, overview metrics, quick access modules, and project configuration settings, alongside structured, honest placeholders for upcoming child modules.

---

## 2. Workspace Architecture

The Project Workspace uses nested React Router architecture with a shared workspace layout and `<Outlet />`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AppShell (Global Shell)                         │
│   AppHeader │ Breadcrumbs ("Projects / CricAuction / Chats") │ Sidebar │
├────────────────────────────────────────────────────────────────────────┤
│                     ProjectWorkspacePage Container                     │
│                (loads Project entity via ProjectService)               │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ ProjectHeader (Icon, Name, Badges, Color Theme, Actions Bar)   │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ ProjectNavigation (Overview, Chats, Files, Notes, Tasks, ...)  │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ <Outlet context={{ project, onProjectUpdated }} />             │   │
│   │                                                                │   │
│   │  ├── ProjectOverviewPage    (Identity, Context Panel, Modules) │   │
│   │  ├── ProjectChatsPage       (Placeholder - Phase 7)            │   │
│   │  ├── ProjectFilesPage       (Placeholder - Phase 9)            │   │
│   │  ├── ProjectNotesPage       (Placeholder - Phase 9 & 14)       │   │
│   │  ├── ProjectTasksPage       (Placeholder - Phase 10)           │   │
│   │  ├── ProjectDecisionsPage   (Placeholder - Phase 10)           │   │
│   │  ├── ProjectResourcesPage   (Placeholder - Phase 9)            │   │
│   │  ├── ProjectActivityPage    (Placeholder - Phase 21)           │   │
│   │  └── ProjectSettingsPage    (Config, Lifecycle, Danger Zone)   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Workspace Routes

All project workspace routes are nested under `/projects/:projectId`:

| Route                            | View Component         | Status        | Description                                                         |
| :------------------------------- | :--------------------- | :------------ | :------------------------------------------------------------------ |
| `/projects/:projectId`           | `ProjectOverviewPage`  | **Active**    | Project overview, timeline, context/guidelines panel, module links. |
| `/projects/:projectId/chats`     | `ProjectChatsPage`     | _Placeholder_ | Conversations & chats (scheduled for Phase 7).                      |
| `/projects/:projectId/files`     | `ProjectFilesPage`     | _Placeholder_ | Project files & attachments (scheduled for Phase 9).                |
| `/projects/:projectId/notes`     | `ProjectNotesPage`     | _Placeholder_ | Scratchpads & code snippets (scheduled for Phase 9 & 14).           |
| `/projects/:projectId/tasks`     | `ProjectTasksPage`     | _Placeholder_ | Backlog & task items (scheduled for Phase 10).                      |
| `/projects/:projectId/decisions` | `ProjectDecisionsPage` | _Placeholder_ | Architectural decisions / ADRs (scheduled for Phase 10).            |
| `/projects/:projectId/resources` | `ProjectResourcesPage` | _Placeholder_ | Links & documentation bookmarks (scheduled for Phase 9).            |
| `/projects/:projectId/activity`  | `ProjectActivityPage`  | _Placeholder_ | Historical timeline & audit events (scheduled for Phase 21).        |
| `/projects/:projectId/settings`  | `ProjectSettingsPage`  | **Active**    | Project metadata configuration, instructions, pin/archive, delete.  |

---

## 4. Navigation & Breadcrumb Integration

- **Project Navigation Tabs**: Compact horizontal tab bar with icons and active route highlighting, matching the Phase 2 design system tokens. Fully keyboard-accessible with `role="tablist"` / `role="tab"`.
- **Dynamic Breadcrumbs**: Integrated with `Breadcrumbs` component to dynamically resolve `:projectId` to the project's actual name (e.g. `Home / Projects / CricAuction Pro / Chats`), gracefully falling back to standard labels when loading.

---

## 5. Project Context & Instructions Foundation

The Project entity (`src/domain/entities/project.entity.ts`) supports user-provided project context and instructions via the optional `instructions?: string` field.

- **`ProjectContextPanel`**: Clean, interactive card on the Overview page allowing viewing and editing guidelines (e.g., architectural conventions, technical stack, rules).
- **No AI / LLM Generation**: Instructions are user-authored structured project memory stored directly in IndexedDB. No artificial intelligence or vector databases are utilized.
- **Persistence**: Edits save immediately through `ProjectService.updateProject(id, { instructions })`.

---

## 6. Project Settings & Lifecycle Actions

The Project Settings destination (`/projects/:projectId/settings`) enables:

1. **Metadata Configuration**: Edit project name, slug, description, color palette token, icon, and tags.
2. **Context & Instructions**: Update project reference guidelines.
3. **Pin & Archive Management**: Toggle pin-to-top status or soft-archive project.
4. **Danger Zone**: Explicit, permanent project deletion protected by confirmation modal (`DeleteProjectDialog`).

---

## 7. Zero Fake Child Data

When navigating to child tabs (`/chats`, `/files`, `/notes`, `/tasks`, `/decisions`, `/resources`, `/activity`), honest and clear placeholders are displayed explaining exactly which phase will implement that capability. No artificial or fake child records are seeded.

---

## 8. Deferred Features

The following features remain strictly deferred to subsequent phases per the product roadmap:

- ❌ Chat creation, streaming, and message persistence (Phase 7)
- ❌ Chat Groups & Topic threads (Phase 7/8)
- ❌ File storage, uploads, and attachment viewer (Phase 9)
- ❌ Notes markdown editor (Phase 9)
- ❌ Code Snippets manager & syntax highlighter (Phase 9/14)
- ❌ Task backlog & checklist boards (Phase 10)
- ❌ Architectural Decision Records engine (Phase 10)
- ❌ Link & Resource Library (Phase 9)
- ❌ Universal Search (Phase 13)
- ❌ Activity Event stream logging (Phase 21)
- ❌ AI / LLM integration (Zero LLM Principle)
- ❌ Desktop / Tauri / SQLite (Desktop Evolution Phase)

---

## 9. Quality Gate Verification

All quality gates pass cleanly:

```text
> tsc --noEmit (TypeScript Typecheck)
✓ 0 errors

> eslint . (ESLint)
✓ 0 errors, 0 warnings

> prettier --check . (Prettier Formatting)
✓ All matched files use Prettier code style

> vite build (Production Build)
✓ Built in 1.51s (dist/assets/index-*.js: 426.77 kB)

> vitest run (Test Suite)
✓ 29 test files passed
✓ 135 tests passed (0 failed)
```
