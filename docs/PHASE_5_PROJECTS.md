# Phase 5 — Projects Implementation

## 1. Objective

Phase 5 delivers the first primary user-facing data feature of **WorkBench**: a fully persistent, local-first **Project Management Layer** built strictly on top of Phase 4's Core Data Architecture.

Users can create projects, configure metadata (name, slug, description, color, icon, tags), browse active/pinned/archived projects, search and sort, view dedicated project detail overviews, edit project metadata, toggle pinning and archiving, and safely delete projects with confirmation dialogs.

---

## 2. Project Architecture

The implementation adheres strictly to Clean Architecture and the WorkBench data pipeline:

```text
┌─────────────────────────────────────────────────────────────┐
│                       React UI Layer                        │
│   ProjectsPage (/projects)   │   ProjectDetailPage (/projects/:id)
│   CreateProjectDialog        │   EditProjectDialog          │
│   DeleteProjectDialog        │   ProjectCard                │
└──────────────────────────────┬──────────────────────────────┘
                               │ React Context Hook (useProjectService)
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain & Service Layer                   │
│   ProjectService (validation, uniqueness, slug collisions,  │
│                   filtering, sorting, lifecycle events)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Contract (IProjectRepository)
┌──────────────────────────────▼──────────────────────────────┐
│                      Repository Layer                       │
│   ProjectStorageRepository (findPinned, existsByName, etc.) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Engine Interface (IStorageEngine)
┌──────────────────────────────▼──────────────────────────────┐
│                     Persistence Layer                       │
│   IndexedDbStorageEngine (Browser) / MemoryStorageEngine (Tests)
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Entity & Field Mapping

The Project entity (`src/domain/entities/project.entity.ts`) established in Phase 4 is used directly without arbitrary additions:

| Field          | Type            | Description                                                                          |
| :------------- | :-------------- | :----------------------------------------------------------------------------------- |
| `id`           | `EntityId`      | Stable UUID v4 identifier. Canonical entity ID across routes and references.         |
| `workspaceId`  | `EntityId`      | Relational reference to the parent local workspace.                                  |
| `name`         | `string`        | User-defined project title (1–100 characters). Must be unique within the workspace.  |
| `slug`         | `string`        | URL-safe identifier generated deterministically with automatic collision resolution. |
| `description`  | `string?`       | Optional overview of project goals, architecture, or scope.                          |
| `icon`         | `string?`       | Stable identifier resolving to a curated `lucide-react` icon.                        |
| `color`        | `string?`       | Stable token resolving to the WorkBench design system color tokens.                  |
| `tags`         | `string[]`      | Project tags for workspace organization.                                             |
| `instructions` | `string?`       | Project context instructions container (reserved for future project context).        |
| `isArchived`   | `boolean`       | Soft-archival state flag.                                                            |
| `archivedAt`   | `IsoTimestamp?` | Timestamp when the project was archived.                                             |
| `isPinned`     | `boolean`       | Flag indicating whether the project is pinned to the top of the workspace.           |
| `createdAt`    | `IsoTimestamp`  | ISO 8601 creation timestamp.                                                         |
| `updatedAt`    | `IsoTimestamp`  | ISO 8601 update timestamp, automatically refreshed on modification.                  |
| `provenance`   | `Provenance`    | Local origin provenance metadata tracking entity creation source.                    |

---

## 4. Project Lifecycle

```text
       [ User Create Action ]
                 ↓
          ( Validation )
                 ↓
              [ Active ] ◄──────────────────┐
              ┌───┴───┐                     │
 [ Toggle Pin ]       [ Archive Action ]    │ [ Restore Action ]
      │                        │            │
      ▼                        ▼            │
 [ Pinned Active ]        [ Archived ] ─────┘
                               │
                      [ Delete Action ]
                               │
                     ( Confirmation Modal )
                               │
                               ▼
                           [ Deleted ]
```

1. **Creation**: Form input validation (non-empty trimmed name, max length 100). Validates workspace uniqueness and assigns unique collision-free slug (e.g. `cricauction`, `cricauction-2`).
2. **Active**: Default visible state in project directory.
3. **Pinned**: Pinned projects are highlighted with star badges and sorted to the top.
4. **Archived**: Archived projects are hidden from default views and accessible via the `Archived` tab. Archiving preserves all data.
5. **Restored**: Archived projects can be restored back to active with a single click.
6. **Explicit Deletion**: Deletion requires explicit user confirmation via modal dialog. Non-cascading at Phase 5.

---

## 5. Routing & Breadcrumbs

- `/projects`: Main Projects Directory with search, sort, filter tabs, and empty state.
- `/projects/:projectId`: Project Detail Overview showing identity tokens, timeline, management actions, and child module container placeholders.
- **Not Found Handling**: Invalid or deleted project IDs render an accessible `ErrorState` with a direct "Back to Projects" action.
- **Breadcrumbs**: Integrates with the application shell breadcrumb system dynamically resolving the active project name.

---

## 6. Zero Fake Production Data

On fresh first launch, WorkBench begins with **0 projects** and presents a clean empty state:

```text
Projects
No projects yet.
Organize conversations, files, notes, tasks, and decisions into focused workspaces.
[ Create Project ]
```

No mock data (e.g. CricAuction, Signature Studio, Demo Project) is pre-seeded in production storage. Test suites run against isolated `MemoryStorageEngine` instances.

---

## 7. Deferred Features (Strict Scope Preservation)

In compliance with the product contract, the following features remain strictly deferred to subsequent phases:

- ❌ Project Workspace multi-tabs (Phase 6)
- ❌ Chats & Chat Groups (Phase 7 & 8)
- ❌ Files, Notes, Links, Snippets, Bookmarks (Phase 9)
- ❌ Tasks & Architectural Decisions (Phase 10)
- ❌ Universal Search (Phase 11)
- ❌ Smart Tags & Organization Engine (Phase 8/12)
- ❌ Import / Inbox automation (Phase 13)
- ❌ AI / LLM / Vector DB (Zero LLM Principle)
- ❌ Desktop / Tauri / SQLite (Desktop Evolution Phase)

---

## 8. Verification & Quality Gates

All quality gates pass with zero errors:

- **Typecheck**: `tsc --noEmit` (0 errors)
- **Lint**: `eslint .` (0 errors, 0 warnings)
- **Format**: `prettier --check .` (All files formatted)
- **Build**: `vite build` (Production bundle generated cleanly in 1.42s)
- **Tests**: 129 tests passing across 28 test suites in Vitest.
