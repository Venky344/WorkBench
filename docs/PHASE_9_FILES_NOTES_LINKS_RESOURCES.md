# WorkBench — Phase 9 Documentation

## Files, Notes, Links & Resources

### Status: Complete & Verified

**Date:** September 2026  
**Architectural Phase:** Phase 9 — Persistent Project Resource Layer

---

## 1. Objective

Phase 9 establishes WorkBench's persistent **Project Resource Layer**. While Phases 5–8 established Projects, Workspaces, Chats, and Organizations, Phase 9 equips projects to hold their actual working materials — **Files, Notes, Links, Bookmarks, References, and Code Snippets** — as first-class persistent resources under a local-first, privacy-preserving architecture.

Every resource is strongly typed, project-scoped, integrated with the Phase 8 Tag system, and strictly isolated by workspace and project boundaries.

---

## 2. Resource Model Overview

WorkBench Projects hold six primary resource types:

```text
Project
├── Chats & Chat Groups (Phase 7)
├── Files (Metadata + Decoupled Binary Blobs)
├── Notes (Persistent Text / Markdown Documents)
├── Links (External Web URLs & Documentation Pointers)
├── Bookmarks (Fast Navigation Pointers to Internal & External Entities)
├── References (External Specs, Citations, File Pointers, Academic Sources)
└── Code Snippets (Syntax-Typed, Non-Executing Code Blocks & Configs)
```

### Entity Specifications:

1. **`FileEntity`** (`src/domain/entities/file.entity.ts`):
   - Represents the metadata and project relationship of an attached file.
   - Fields: `id`, `workspaceId`, `projectId`, `name`, `originalFilename`, `mimeType`, `extension`, `sizeBytes`, `storageKey`, `description`, `tags`, `createdAt`, `updatedAt`.
2. **`Note`** (`src/domain/entities/note.entity.ts`):
   - Represents a persistent text or markdown working note within a project.
   - Fields: `id`, `workspaceId`, `projectId`, `title`, `content`, `isPinned`, `tags`, `createdAt`, `updatedAt`.
3. **`Link`** (`src/domain/entities/link.entity.ts`):
   - Represents a validated external web link or documentation endpoint.
   - Fields: `id`, `workspaceId`, `projectId`, `title`, `url`, `description`, `domain`, `tags`, `createdAt`, `updatedAt`.
4. **`Bookmark`** (`src/domain/entities/bookmark.entity.ts`):
   - Represents a fast navigation shortcut / bookmark pointing to project chats, files, notes, tasks, or external URLs.
   - Fields: `id`, `workspaceId`, `projectId`, `title`, `targetEntityType`, `targetEntityId`, `targetUrl`, `note`, `order`, `tags`, `createdAt`, `updatedAt`.
5. **`Reference`** (`src/domain/entities/reference.entity.ts`):
   - Represents a structured citation, external specification, paper, or research source.
   - Fields: `id`, `workspaceId`, `projectId`, `title`, `referenceKind` (`url` | `file` | `citation` | `internal`), `targetUri`, `annotation`, `tags`, `createdAt`, `updatedAt`.
6. **`CodeSnippet`** (`src/domain/entities/code-snippet.entity.ts`):
   - Represents a persistent, non-executable code snippet, script, or configuration block.
   - Fields: `id`, `workspaceId`, `projectId`, `title`, `language`, `code`, `filename`, `description`, `tags`, `createdAt`, `updatedAt`.

---

## 3. File Metadata vs. File Bytes

A central architectural requirement of WorkBench is the strict separation between **File Metadata** and **File Bytes**:

```text
┌─────────────────────────────────────────────────────────────┐
│                      File Metadata                          │
│  Entity: FileEntity                                         │
│  Store: 'files' (JSON Metadata Store in IndexedDB/Memory)    │
│  State: Managed via Zustand & FileRepository                │
│  Contents: name, size, mimeType, tags, storageKey           │
└──────────────────────────────┬──────────────────────────────┘
                               │ references storageKey (e.g. file_9f2a...)
┌──────────────────────────────▼──────────────────────────────┐
│                       File Bytes                            │
│  Storage: IFileStorage                                      │
│  Store: 'file_blobs' (Dedicated Binary Store)               │
│  State: NEVER held in global state or entity lists          │
│  Contents: Raw ArrayBuffer / Blob, mimeType                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles:

- Domain entity collections and Zustand stores **never** hold raw binary payloads.
- Listing project files reads metadata only (O(1) memory overhead per file).
- File bytes are retrieved asynchronously only when previewing, downloading, or reading the content.

---

## 4. File Storage Abstraction (`IFileStorage`)

The file storage interface decouples the application and domain layers from physical binary storage:

```typescript
export interface IFileStorage {
  open(): Promise<void>;
  close(): Promise<void>;
  isOpen(): boolean;
  saveFile(
    storageKey: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType?: string,
  ): Promise<string>;
  readFile(storageKey: string): Promise<Blob | null>;
  deleteFile(storageKey: string): Promise<boolean>;
  fileExists(storageKey: string): Promise<boolean>;
  clearAll(): Promise<void>;
}
```

### Implementations:

1. **`IndexedDbFileStorage`** (`src/persistence/file-storage/indexeddb-file-storage.ts`):
   - Targets the dedicated `file_blobs` object store in IndexedDB.
   - Serializes blobs to `ArrayBuffer` payloads for robust structured cloning across browsers and execution environments.
2. **`MemoryFileStorage`** (`src/persistence/file-storage/memory-file-storage.ts`):
   - In-memory Map storage for deterministic headless testing.

---

## 5. Web Storage vs. Future Desktop Storage

WorkBench is currently web-first, storing binary blobs in IndexedDB under a separate object store (`file_blobs`).

### Future Windows Desktop Compatibility:

Because the domain and UI interact solely with `IFileStorage`, future desktop releases (Tauri / Windows OS integration in Phases 25–27) can introduce `WindowsFilesystemFileStorage` implementing `IFileStorage` without requiring changes to `FileService`, `FileEntity`, or UI components.

---

## 6. Upload & Deletion Transactional Safety

`FileService` manages transaction-like safety across metadata and binary storage:

1. **Upload Workflow**:
   - Validate filename, size, and MIME type.
   - Generate secure random storage key `file_<uuid>`.
   - Store binary payload into `IFileStorage`.
   - If binary storage fails, reject without creating metadata.
   - Persist `FileEntity` metadata.
   - If metadata persistence fails, attempt immediate rollback deletion of the stored blob to prevent orphaned binary data.
2. **Deletion Workflow**:
   - Retrieve existing `FileEntity` and verify project ownership.
   - Delete `FileEntity` metadata.
   - Delete binary payload from `IFileStorage` using `storageKey`.
   - Ensure other files or projects are never affected.

---

## 7. Notes Model & Editor

- Notes support freeform text and Markdown formatting.
- Non-destructive inline and full-page editing with explicit **Save** and **Cancel** actions.
- Pinning feature allows highlighting key project documentation.
- Notes directory at `/projects/:projectId/notes` with search, sorting, and tag filtering.
- Dedicated detail route at `/projects/:projectId/notes/:noteId` enforcing project ownership and safe error handling for missing notes.

---

## 8. Links, Bookmarks & References

### Links (`LinkService`):

- Persistent web bookmarks and documentation links.
- URL validation strictly enforces safe web schemes (`http:`, `https:`), rejecting dangerous protocols (`javascript:`, `data:`).
- Automatic domain extraction (e.g. `github.com`, `docs.rs`) for clean UI presentation.
- Manual metadata entry only — **zero remote web scraping or background network requests**.

### Bookmarks (`BookmarkService`):

- Fast internal/external pointers.
- Support navigation targets including `chat`, `file`, `note`, `link`, `project`, `task`, `decision`, or custom URLs.
- Provides quick jump actions directly from the resource grid.

### References (`ReferenceService`):

- Structured research, specification, and academic citation tracker.
- Classified by `referenceKind`: `url` (Web Spec), `file` (Local Paper/PDF), `citation` (Academic Citation), and `internal` (Internal Spec/Note).
- Supports contextual annotations and quotes.

---

## 9. Code Snippets (`CodeSnippetService`)

- Dedicated code snippet repository supporting 15+ standard programming and config languages (`typescript`, `python`, `sql`, `bash`, `rust`, etc.).
- Formatted monospace code preview with line-count indicators and one-click clipboard copying.
- **Strict Execution Boundary**: WorkBench does NOT execute user code snippets. Code is stored purely as static working materials.

---

## 10. Organization & Phase 8 Tag Integration

All six resource entities seamlessly participate in the Phase 8 Tagging and Organization system:

- `TagPicker` and `TagBadge` components integrated into all resource dialogs and cards.
- Cascading tag deletion: when a workspace tag is deleted via `TagService`, references are cleaned up across `files`, `notes`, `links`, `bookmarks`, `references`, and `code_snippets`.
- Usage count calculations (`getTagUsageCount`) accurately aggregate counts across all resource stores.

---

## 11. Project & Workspace Isolation

Strict isolation checks are enforced across all service methods:

- **Project Isolation**: `service.update*(id, input, projectId)` and `service.delete*(id, projectId)` verify `entity.projectId === projectId`.
- **Workspace Isolation**: `service.list*ByWorkspace(workspaceId)` verifies `entity.workspaceId === workspaceId`.
- Resources belonging to Project A are completely invisible to and inaccessible from Project B.

---

## 12. Complete Resource Routing

| Route                                | Page Component          | Description                                                             |
| ------------------------------------ | ----------------------- | ----------------------------------------------------------------------- |
| `/projects/:projectId/files`         | `ProjectFilesPage`      | Project persistent file directory with upload, preview, and download    |
| `/projects/:projectId/notes`         | `ProjectNotesPage`      | Project notes directory with creation, pinning, and filtering           |
| `/projects/:projectId/notes/:noteId` | `ProjectNoteDetailPage` | Dedicated full-page note viewer & editor with breadcrumb integration    |
| `/projects/:projectId/resources`     | `ProjectResourcesPage`  | Project resource center with Links, Bookmarks, References, Snippets     |
| `/resources`                         | `ResourcesPage`         | Global workspace-wide resource directory with tabbed category filtering |

---

## 13. Deferred Features (Boundary Discipline)

The following capabilities are strictly deferred to their designated roadmap phases:

- **Universal Search & FTS** → Phase 13
- **Content Intelligence & Provenance Processing** → Phase 14
- **Universal Import Engine (ChatGPT/Claude/Gemini/HTML/PDF importers)** → Phase 15+
- **Quick Capture** → Phase 19
- **Automation & Rules Engine** → Phase 20
- **Activity Stream & Audit Logs** → Phase 21
- **Browser Extension** → Phase 23
- **Desktop Filesystem & SQLite Integration** → Phases 25–27
- **Backup, Recovery & Data Migration** → Phase 28
