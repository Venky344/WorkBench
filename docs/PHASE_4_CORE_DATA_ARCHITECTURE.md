# WorkBench — Phase 4: Core Data Architecture

**Status:** Completed & Locked  
**Phase:** 4 of 32  
**Scope:** Canonical domain entity models, relationship graphing, ID/timestamp primitives, non-AI provenance engine, serialization boundaries, persistence abstraction, schema migrations, and repository architecture.

---

## 1. Executive Summary

Phase 4 establishes the foundational data architecture for WorkBench. It defines the canonical domain models, typed relationships, persistence adapters, and repository layer without introducing any AI dependencies, cloud databases, heavy ORMs, or premature feature implementations.

All domain models remain 100% storage-independent and environment-agnostic, enabling seamless evolution from the current web-based IndexedDB storage engine to native desktop SQLite (Phase 27) without rewriting any domain logic.

---

## 2. Canonical Entity Model

WorkBench defines 21 canonical domain entities adhering strictly to the Product Contract:

| Entity              | Purpose                                  | Key Properties                                                                                                                                                                                                                                                                          |
| :------------------ | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workspace**       | Root local work environment              | `id`, `name`, `description`, `activeProjectId`, `settings`, `createdAt`, `updatedAt`                                                                                                                                                                                                    |
| **User**            | Local workspace user profile             | `id`, `workspaceId`, `displayName`, `email`, `avatarUrl`, `isLocal`, `createdAt`, `updatedAt`                                                                                                                                                                                           |
| **Project**         | Primary organizational container         | `id`, `workspaceId`, `name`, `slug`, `description`, `color`, `icon`, `isArchived`, `order`, `tags`                                                                                                                                                                                      |
| **Chat**            | Normalized imported/local conversation   | `id`, `workspaceId`, `projectId`, `chatGroupId`, `title`, `summary`, `sourceId`, `provenance`, `isPinned`, `isArchived`, `messageCount`, `order`, `tags`                                                                                                                                |
| **Message**         | Ordered message record in a chat         | `id`, `chatId`, `role` (`user`/`assistant`/`system`/`tool`/`unknown`), `content`, `sequenceNumber`, `sourceMessageId`, `authorName`, `modelName`, `isPinned`                                                                                                                            |
| **ChatGroup**       | Folder grouping chats within a project   | `id`, `workspaceId`, `projectId`, `name`, `description`, `color`, `order`, `isCollapsed`                                                                                                                                                                                                |
| **FileEntity**      | Metadata for referenced/attached files   | `id`, `workspaceId`, `projectId`, `name`, `originalFilename`, `mimeType`, `sizeBytes`, `pathOrReference`, `sourceId`, `provenance`, `tags`, `isArchived`                                                                                                                                |
| **Note**            | Text/Markdown note                       | `id`, `workspaceId`, `projectId`, `title`, `content`, `isPinned`, `isArchived`, `sourceId`, `provenance`, `tags`                                                                                                                                                                        |
| **Link**            | Web resource / external URL              | `id`, `workspaceId`, `projectId`, `url`, `title`, `description`, `domain`, `faviconUrl`, `sourceId`, `provenance`, `tags`                                                                                                                                                               |
| **Bookmark**        | Fast navigation pointer / favorite       | `id`, `workspaceId`, `projectId`, `title`, `targetEntityType`, `targetEntityId`, `targetUrl`, `note`, `order`, `tags`                                                                                                                                                                   |
| **Reference**       | Citation to primary source/specification | `id`, `workspaceId`, `projectId`, `sourceEntityType`, `sourceEntityId`, `referenceKind` (`url`/`file`/`citation`/`internal`), `title`, `targetUri`, `annotation`                                                                                                                        |
| **CodeSnippet**     | Isolated code fragment                   | `id`, `workspaceId`, `projectId`, `chatId`, `messageId`, `title`, `language`, `code`, `filename`, `sourceId`, `provenance`, `tags`                                                                                                                                                      |
| **Task**            | Actionable linked work item              | `id`, `workspaceId`, `projectId`, `title`, `description`, `status` (`todo`/`in_progress`/`done`/`cancelled`), `priority`, `dueDate`, `completedAt`, `sourceChatId`, `decisionId`, `order`, `tags`                                                                                       |
| **Decision**        | Architectural/design record with reasons | `id`, `workspaceId`, `projectId`, `title`, `status` (`proposed`/`accepted`/`superseded`/`rejected`), `decision`, `rationale`, `implications`, `sourceChatId`, `tags`                                                                                                                    |
| **Tag**             | Cross-cutting organizational tag         | `id`, `workspaceId`, `name`, `normalizedName`, `color`, `description`                                                                                                                                                                                                                   |
| **Source**          | External origin platform/export          | `id`, `workspaceId`, `provider` (`chatgpt`/`claude`/`gemini`/`perplexity`/`web`/`file`/`clipboard`/`manual`/`browser_extension`), `displayName`, `externalId`, `sourceUrl`, `author`, `importedAt`, `metadata`                                                                          |
| **Relationship**    | Universal graph edge between entities    | `id`, `workspaceId`, `sourceEntityType`, `sourceEntityId`, `relationshipType` (`contains`/`references`/`derived_from`/`relates_to`/`implements`/`documents`/`supersedes`), `targetEntityType`, `targetEntityId`, `metadata`                                                             |
| **ActivityEvent**   | Audit trail of workspace actions         | `id`, `workspaceId`, `projectId`, `entityType`, `entityId`, `action` (`created`/`updated`/`imported`/`moved`/`pinned`/`archived`/`deleted`/`linked`), `summary`, `timestamp`, `details`                                                                                                 |
| **InboxItem**       | Staging container for captures/imports   | `id`, `workspaceId`, `title`, `captureType` (`raw_text`/`snippet`/`url`/`imported_chat`/`imported_file`/`clipboard`), `rawContent`, `targetEntityType`, `targetEntityId`, `sourceUrl`, `sourceId`, `suggestedProjectId`, `suggestedTags`, `status` (`unprocessed`/`triaged`/`archived`) |
| **Automation**      | Rule-based workflow rule                 | `id`, `workspaceId`, `projectId`, `name`, `description`, `isEnabled`, `trigger`, `conditions`, `actions`, `lastRunAt`, `runCount`                                                                                                                                                       |
| **ProjectTemplate** | Reusable project blueprint               | `id`, `name`, `description`, `category`, `defaultGroups`, `defaultTasks`, `defaultTags`, `isBuiltin`                                                                                                                                                                                    |

---

## 3. Entity Identity & Timestamp Primitives

### Identity Strategy

- Every persistent entity has a globally unique, stable `EntityId` formatted as standard UUID v4.
- Generated locally using `crypto.randomUUID()` with a deterministic fallback.
- Strictly validated with `isValidEntityId(id)` regex pattern.
- Independent from array indexes and storage internal IDs.
- Never reused after deletion.

### Timestamp Strategy

- Consistent `ISOTimestamp` representation (ISO-8601 UTC string: `YYYY-MM-DDTHH:mm:ss.sssZ`).
- Managed via `createCurrentTimestamp()` and validated via `isValidTimestamp(value)`.
- Persisted domain models strictly use ISO strings, never mixing `Date` objects, Unix epoch numbers, or arbitrary locale strings.

---

## 4. Non-AI WorkBench Brain & Provenance Foundation

### Relationship Architecture

The WorkBench Brain connects entities via explicit, bidirectional `Relationship` records:

- **`contains`**: Project contains Chat / File / Note / Task / Decision.
- **`references`**: Chat or Message references File / Note / Link.
- **`derived_from`**: Task or Decision derived from Chat / Message.
- **`implements`**: Task implements Decision / Architecture spec.
- **`documents`**: Note documents Decision / Architecture.
- **`supersedes`**: Decision supersedes previous Decision.

### Provenance Tracking

Every imported item attaches a structured `ProvenanceRecord` and references a parent `Source` entity:

- Provider attribution (`chatgpt`, `claude`, `gemini`, `perplexity`, etc.).
- Origin URL and conversation/message IDs.
- Import timestamps and content categorization.

---

## 5. Persistence Architecture & Layering

WorkBench enforces a strict separation of concerns:

```text
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│   React Shell, Pages, Modals, State Stores             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                     SERVICE LAYER                      │
│   WorkspaceService, ProjectService, ChatService, etc.  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   REPOSITORY LAYER                     │
│   IProjectRepository, IChatRepository, etc.            │
│   (StorageRepository / InMemoryRepository)             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 STORAGE ADAPTER LAYER                  │
│   IStorageEngine (IndexedDbStorageEngine / Memory)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    PHYSICAL STORAGE                    │
│   IndexedDB (Web) ──► Future: SQLite (Desktop Phase 27)│
└────────────────────────────────────────────────────────┘
```

### Storage Engines

1. **`IndexedDbStorageEngine`**: Production browser storage engine utilizing native IndexedDB with typed object stores, secondary indexes, and atomic transactions.
2. **`MemoryStorageEngine`**: In-memory storage engine utilized for unit and integration testing.

---

## 6. Serialization Boundaries & Data Safety

- **`EntitySerializer`**: Pure mapping utility ensuring domain entities crossing the persistence boundary are sanitized, validated against `validateBaseEntity`, cloned, and returned as frozen immutable objects.
- **Static Domain Isolation**: Enforced via architectural unit test (`tests/architecture/domain-isolation.test.ts`), guaranteeing zero direct imports of `indexedDB`, `localStorage`, `window`, `document`, or persistence adapters within domain files.
- **Referential Safety**: Deletion cascades (e.g. deleting messages when a chat is removed) are controlled by repository methods rather than database triggers.

---

## 7. Schema Versioning & Migrations

- Current schema version: `1` (`WORKBENCH_DB_VERSION = 1`).
- Database name: `workbench_local_db`.
- **`MigrationRunner`**: Automatically executes ordered migration scripts on `onupgradeneeded` events.
- **`v1Migration`**: Creates 21 object stores and their associated secondary indexes (`by_workspaceId`, `by_slug`, `by_status`, `by_projectId`, `by_sourceId`, etc.).

---

## 8. Deferred Work (Strictly Excluded from Phase 4)

In accordance with the roadmap, the following are intentionally deferred:

- Project UI management and editing (Phase 5)
- Multi-tab project workspace views (Phase 6)
- Chat viewer, message rendering, syntax highlighting (Phase 7)
- Tagging UI and filtering widgets (Phase 8)
- Markdown editor and PDF reader (Phase 9)
- Task management UI and Decision log viewer (Phase 10)
- Universal search indexing engine (Phase 13)
- Live AI provider adapters and parsers (Phase 15–16)
- Automation rule evaluation engine (Phase 20)
- Tauri / Native Desktop SQLite engine (Phase 25–27)
- LLMs, embeddings, vector databases (Prohibited by Product Contract)
