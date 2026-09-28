# WorkBench — Phase 7: Chats & Chat Groups Implementation Specification

## 1. Objective

Phase 7 establishes the persistent **Chat and Chat Group organization layer** inside WorkBench Projects. It introduces real `Chat` and `ChatGroup` domain entities, typed repository contracts, business service abstractions, project-level conversation directory and detail views, group management, deterministic filtering/sorting, and lifecycle actions.

This layer serves as the primary organizational container for conversation records, keeping actual conversation content (messages, streaming, LLM APIs, universal imports) cleanly decoupled for future phases.

---

## 2. Domain Data Models

### 2.1 Chat Entity (`src/domain/entities/chat.entity.ts`)

```typescript
export interface Chat extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly chatGroupId?: EntityId;
  readonly title: string;
  readonly description?: string;
  readonly summary?: string;
  readonly source?: string;
  readonly sourceType?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly isPinned: boolean;
  readonly isFavorite: boolean;
  readonly isArchived: boolean;
  readonly archivedAt?: ISOTimestamp;
  readonly messageCount: number;
  readonly order: number;
  readonly tags: readonly string[];
  readonly lastActivityAt?: ISOTimestamp;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}
```

### 2.2 ChatGroup Entity (`src/domain/entities/chat-group.entity.ts`)

```typescript
export interface ChatGroup extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly icon?: string;
  readonly order: number;
  readonly isPinned?: boolean;
  readonly isCollapsed: boolean;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}
```

### 2.3 Entity Relationships

```text
Workspace
   │
   └── Project (1..N)
          │
          ├── Chat (0..N, ungrouped or grouped)
          │
          └── ChatGroup (0..N)
                 └── Chat (0..N)
```

- **Chat $\leftrightarrow$ Project**: Every project chat strictly belongs to one `Project` (`projectId`).
- **Chat $\leftrightarrow$ ChatGroup**: A chat optionally belongs to $0$ or $1$ `ChatGroup` (`chatGroupId?: EntityId`).
- **ChatGroup $\leftrightarrow$ Project**: A group strictly belongs to one `Project` (`projectId`).

---

## 3. Project Scoping & Isolation

Cross-project data leakage is strictly prevented at both the service and UI levels:

1. **Repository Queries**: Repositories query by `projectId` or index predicates.
2. **Service Validation**:
   - `createChat`: If `chatGroupId` is specified, `ChatService` validates that the target group belongs to the chat's `projectId`.
   - `moveChatToGroup`: Validates that the target `ChatGroup` belongs to the same `projectId` as the `Chat`.
   - Cross-project chat moves are rejected with `ValidationError`.
3. **Detail Route Validation**: When loading `/projects/:projectId/chats/:chatId`, `ChatDetailPage` validates `chat.projectId === projectId`. If mismatched, an `ErrorState` is shown and cross-project access is blocked.

---

## 4. Repository & Persistence Architecture

Data access adheres strictly to the unidirectional abstraction layer:

```text
UI Component / Page
       ↓
Domain Services (ChatService, ChatGroupService)
       ↓
Typed Repository Contracts (IChatRepository, IChatGroupRepository)
       ↓
StorageRepository Base Implementation
       ↓
IStorageEngine (IndexedDbStorageEngine / MemoryStorageEngine)
       ↓
IndexedDB Stores (STORES.CHATS, STORES.CHAT_GROUPS)
```

No UI component directly queries or mutates IndexedDB.

---

## 5. Lifecycle Operations

### 5.1 Chat Lifecycle

- **Create**: Generates UUID, associates with `workspaceId` and `projectId`, sets timestamps (`createdAt`, `updatedAt`, `lastActivityAt`), initializes `isPinned: false`, `isFavorite: false`, `isArchived: false`, `messageCount: 0`.
- **Read / List**: Queries chats by project, applying deterministic status filters, group filtering, keyword search, and sorting.
- **Update**: Modifies title, description, group association, or tags; updates `updatedAt` and `lastActivityAt`.
- **Pin / Unpin**: Toggles `isPinned` status.
- **Favorite / Unfavorite**: Toggles `isFavorite` status independently of pinning.
- **Archive / Restore**: Archiving sets `isArchived: true` and `archivedAt`, and unpins. Restoring resets `isArchived: false` and `archivedAt: undefined`.
- **Move to Group / Remove from Group**: Updates `chatGroupId` (or unsets to `undefined`).
- **Duplicate**: Clones the chat metadata with title suffix `" (Copy)"`, resets timestamps, retains `description`, `tags`, `source`, `projectId`, and `chatGroupId`, but resets `isPinned: false`, `isFavorite: false`, `isArchived: false`, and `messageCount: 0`. Does not duplicate message records.
- **Delete**: Permanently removes the chat record from the database with user confirmation.

### 5.2 ChatGroup Lifecycle

- **Create**: Validates non-empty name and ensures name uniqueness within the project (`existsByName`).
- **Update**: Updates name, description, color, or icon.
- **Pin / Unpin**: Toggles `isPinned` on the group.
- **Toggle Collapse**: Expands or collapses the group in the directory view.
- **Delete (Crucial Safety Rule)**: Deleting a `ChatGroup` finds all associated chats in that group (`findByChatGroupId`), clears their `chatGroupId = undefined`, and persists them before deleting the group record. **Chats inside the group are never deleted when the group is deleted.**

---

## 6. Routing Architecture

| Route                                | View Component     | Description                                                                                                      |
| :----------------------------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------- |
| `/projects/:projectId/chats`         | `ProjectChatsPage` | Real persistent project conversation directory with groups, ungrouped section, search, filters, and CRUD dialogs |
| `/projects/:projectId/chats/:chatId` | `ChatDetailPage`   | Conversation metadata viewer with honest scope boundary container and actions                                    |
| `/chats`                             | `ChatsPage`        | Workspace-wide index of all project conversations                                                                |

---

## 7. Filtering & Sorting

- **Status Filters**:
  - `Active`: Excludes archived conversations (`!isArchived`).
  - `Pinned`: Only active pinned conversations (`isPinned && !isArchived`).
  - `Favorites`: Only active favorited conversations (`isFavorite && !isArchived`).
  - `All`: All conversations including archived.
  - `Archived`: Only archived conversations (`isArchived`).
- **Metadata Search**: Case-insensitive substring matching against `title`, `description`, `source`, and `tags`.
- **Sorting**:
  - `Recently Updated` (default): Ordered by `lastActivityAt ?? updatedAt` descending.
  - `Recently Created`: Ordered by `createdAt` descending.
  - `Title (A–Z)`: Alphabetical collation.

---

## 8. Deferred Scope Boundaries

The following capabilities are intentionally deferred to future phases:

- **Message Content & Editor**: Message creation, viewing, and rich text threads belong to Phase 8+.
- **AI & LLM Services**: No model selectors, prompt generation, streaming, or external AI APIs.
- **Universal Import Engine**: ChatGPT, Claude, Gemini, and Perplexity bulk imports belong to Phases 15 & 16.
- **Universal Search Engine**: Full-text inverted index, embeddings, and semantic vector search belong to Phase 13.
- **Automations & Decision Extraction**: Background triggers and summarization belong to Phase 18+.
- **Desktop/Native Storage**: Tauri, SQLite, and filesystem backends belong to Phase 20.
