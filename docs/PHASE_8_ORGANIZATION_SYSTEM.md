# Phase 8 — Organization System

## Objective

Phase 8 implements the **deterministic organization layer** of WorkBench. It empowers users to explicitly organize, classify, tag, filter, pin, favorite, and archive existing Projects and Chats across their workspaces.

This phase establishes the foundational metadata layer prior to implementing Universal Search (Phase 13), Workspace Brain (Phase 11), Content Intelligence (Phase 14), and Universal Import (Phase 15+).

---

## Organization Model Hierarchy

The WorkBench organization hierarchy is structured as:

```text
Workspace
   ↓
Projects
   ↓
Chat Groups
   ↓
Chats
   ↓
Tags / Favorites / Pins / Archive
```

### Supported Entities & Organizational Capabilities

| Entity         | Supported Organization Controls                                                                                                         |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Workspace**  | Primary boundary of data and tag isolation.                                                                                             |
| **Project**    | Multiple Tags, Pinning (`isPinned`), Archiving (`isArchived`).                                                                          |
| **Chat Group** | Categorical container within a Project; Pinning (`isPinned`).                                                                           |
| **Chat**       | Project-scoped; Optional ChatGroup assignment; Multiple Tags; Pinning (`isPinned`); Favorites (`isFavorite`); Archiving (`isArchived`). |
| **Tag**        | Canonical metadata entity within a Workspace; Color tokens; Reusable across Projects and Chats.                                         |

---

## Tag Entity & Normalization

The Tag entity is defined in [src/domain/entities/tag.entity.ts](file:///C:/WorkBench/src/domain/entities/tag.entity.ts) and represents a workspace-level canonical label:

```ts
export interface Tag extends BaseEntity {
  readonly id: EntityId;
  readonly workspaceId: EntityId;
  readonly name: string;
  readonly normalizedName: string;
  readonly color?: string;
  readonly description?: string;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
}
```

### Normalization Rules

Tag names are normalized deterministically via `TagService.normalizeTagName()`:

1. Trims leading and trailing whitespace.
2. Removes leading `#` characters.
3. Converts characters to lowercase.
4. Strips disallowed characters while preserving alphanumeric, hyphens, and underscores.

Example normalization:

- `" Frontend "` → `"frontend"`
- `"#React-Native"` → `"react-native"`
- `"###UI_Design "` → `"ui_design"`

### Uniqueness and Collisions

Within a single Workspace, duplicate tags with the same `normalizedName` are rejected with a `ConflictError`. Tags are independent across workspaces: Workspace A and Workspace B can each maintain their own `frontend` tag without collision.

---

## Tag Assignment Model

1. **Projects**: Store an array of canonical Tag IDs (`tags: readonly EntityId[]`).
2. **Chats**: Store an array of canonical Tag IDs (`tags: readonly EntityId[]`).

### ID-Preserving Renaming

When a Tag is renamed (e.g. from `frontend` to `frontend-core`), its immutable `id` is retained. Projects and Chats referencing that `id` automatically display the updated name and color without necessitating batch entity updates.

### Destructive Deletion Safety

Tags represent pure metadata. Deleting a Tag:

- Deletes the Tag entity record from `tags`.
- Removes the Tag's `id` from all assigned Projects and Chats across the workspace.
- **NEVER deletes Projects, Chats, Chat Groups, or other data records.**

---

## Deterministic Organization Filters & AND Semantics

WorkBench organization filters use strict **AND semantics**:

$$\text{Result} = \text{Status}(\text{active} \mid \text{pinned} \mid \text{favorites} \mid \text{archived} \mid \text{all}) \land \text{TagMatch}(\text{tagId}) \land \text{SearchQuery}(\text{query})$$

For example:

- `Status = Active` AND `Tag = frontend` AND `Favorite = true` yields only active, favorited chats tagged with `frontend`.
- Selecting "Clear Filters" immediately resets the directory view to the default active state.

---

## Organization UI Components

All components are built using the Phase 2 WorkBench Design System in [src/components/organization/](file:///C:/WorkBench/src/components/organization/):

1. **[TagBadge](file:///C:/WorkBench/src/components/organization/TagBadge.tsx)**:
   - Compact, accessible pill badge displaying tag name with `#` prefix and semantic color tokens (`blue`, `cyan`, `green`, `yellow`, `orange`, `red`, `purple`, `pink`, `neutral`).
   - Supports sizes (`sm`, `md`, `lg`), interactive hover/selection states, and optional `onRemove` button.

2. **[TagPicker](file:///C:/WorkBench/src/components/organization/TagPicker.tsx)**:
   - Searchable multi-select tag picker.
   - Allows toggling existing workspace tags or creating new tags inline with color selection.
   - Enforces tag normalization and uniqueness.

3. **[TagInput](file:///C:/WorkBench/src/components/organization/TagInput.tsx)**:
   - Form-field wrapper for `TagPicker` with accessible label and helper text.

4. **[TagManager](file:///C:/WorkBench/src/components/organization/TagManager.tsx)**:
   - Comprehensive workspace tag management console located in Settings (`/settings`).
   - Supports creating, searching, renaming, color-coding, and safely deleting tags with usage counts (total items, project count, chat count) and safety confirmation dialogs.

5. **[OrganizationFilters](file:///C:/WorkBench/src/components/organization/OrganizationFilters.tsx)**:
   - Reusable filter bar featuring status tabs, tag filter pills, search input, and clear filters action.

6. **[OrganizationPanel](file:///C:/WorkBench/src/components/organization/OrganizationPanel.tsx)**:
   - Dedicated side/metadata panel for Projects and Chats showing assigned tags, pin toggle, favorite toggle, archive status, and creation/update timestamps.

---

## Persistence & Storage

- Storage engine uses Phase 4 IndexedDB / In-Memory storage architecture with the `tags` object store.
- Schema version 1 maintains indexed access by `by_workspaceId` and `by_normalizedName`.
- Organization states (tags, pins, favorites, archive status) survive full browser refresh and navigation.

---

## Isolation Boundaries

1. **Workspace Isolation**:
   - `TagService` validates that entities and tags belong to the same `workspaceId` before performing assignments.
   - Tag listing and searching are strictly filtered by `workspaceId`.
2. **Project Isolation**:
   - Project chat organization filters are strictly constrained to the selected `projectId`.
   - Cross-project chat leakage is blocked at the repository and service layers.

---

## Explicit Scope Exclusions & Deferred Features

Phase 8 adheres strictly to deterministic organization controls without AI or premature infrastructure:

- **No AI Classification**: Zero automatic tagging, keyword inference, LLM calls, or semantic clustering.
- **No Universal Search**: Universal Search belongs to **Phase 13**.
- **No Workspace Brain**: Knowledge graph and relationship synthesis belong to **Phase 11**.
- **No Import Engine**: Universal Import belongs to **Phase 15+**.
- **No New Future Entity Implementations**: Files, Notes, Links, Tasks, and Decisions feature mechanics remain deferred to their dedicated roadmap milestones.
- **No Desktop / SQLite**: Storage remains local-first browser persistence.
