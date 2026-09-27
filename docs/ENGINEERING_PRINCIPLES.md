# WorkBench — Engineering Principles & Standards

**Status:** Phase 0 Locked  
**Scope:** Applies to all future code, architecture, and design decisions across Phases 0–32.

---

## 1. Core Engineering Commandments

1. **Simplicity Over Cleverness**: Write readable, self-documenting code. Avoid premature abstractions and bloated meta-frameworks.
2. **Deterministic Behavior**: Systems must produce predictable, inspectable outputs. Avoid non-deterministic background heuristics or magic state mutations.
3. **Zero AI Invariance**: The core engine must never require an LLM, API key, or heavy neural network runtime to function.
4. **Local-First Reliability**: Local state is the source of truth. All CRUD, search, and indexing operations must function seamlessly offline.
5. **Defensive Boundaries**: Treat all external data (imports, files, URLs, clipboard) as untrusted. Sanitize, parse, and validate at the boundary.

---

## 2. Code Quality & Maintainability

### Modular Architecture
- Code must be organized into decoupled, single-responsibility modules.
- **File Size Guidelines**: Aim to keep component and service files under 250–300 lines. Avoid monolithic "God files" or catch-all utility buckets.
- **Clear Boundaries**: Separate Presentation (UI components), Domain Logic (services, reducers, Brain), and Data Access (storage adapters, parsers).
- **Naming Conventions**: Use clear, unambiguous, domain-specific names (e.g., `useConversationRecord`, `normalizeChatGPTExport`, `ProjectContextStore`).

### Strong Type Safety
- The codebase must strictly use TypeScript with `strict: true`.
- Explicitly avoid `any`. In rare edge cases where dynamic JSON parsing is necessary, use `unknown` combined with type guards or runtime validators (e.g., Zod schemas).
- Define normalized domain models for all entities (Projects, Chats, Messages, Decisions, Tasks, Notes).

---

## 3. Security Principles

WorkBench interacts with user files, external imports, and clipboard data. Security must be built-in from Phase 0:

- **Untrusted Input Sanitization**: All imported HTML/Markdown from external AI platforms must be sanitized before rendering (e.g., using DOMPurify with strict allowlists) to prevent Cross-Site Scripting (XSS).
- **Safe File & Path Handling**:
  - Prevent Path Traversal attacks (`../`, absolute path manipulation).
  - Explicitly validate allowed file extensions, MIME types, and file sizes.
  - Never execute arbitrary code or shell scripts automatically from imported content.
- **Secrets & Credentials Management**:
  - Never hardcode or commit secrets, tokens, or personal identifiers to version control.
  - Keep configuration and environment variables strictly decoupled.
- **Desktop & Native Security**:
  - Apply the principle of least privilege in desktop bindings (e.g., Tauri IPC / native APIs).
  - Explicitly restrict file system access to user-selected workspace directories.

---

## 4. Performance & Resource Discipline

WorkBench must feel instantaneous:
> **Target:** Cold start < 1s, Search latency < 50ms, UI interaction latency < 16ms (60 FPS).

- **Zero Unnecessary Daemons**: Avoid background pollers, continuous indexing loops, or unmonitored timers.
- **Bundle & Dependency Discipline**:
  - Strictly vet every dependency before addition.
  - Avoid large runtime libraries when standard browser APIs or small focused packages suffice.
  - Prevent duplicate packages and bundle bloat.
- **State & Render Optimization**:
  - Use granular state updates to prevent unnecessary re-rendering of large conversation trees.
  - Virtualize long lists (e.g., conversations with hundreds of messages, extensive search result lists).
  - Debounce/throttle expensive disk writes and search queries.

---

## 5. User Experience (UX) & Accessibility

- **Keyboard-First Workflow**:
  - Global Command Palette (`Ctrl+K`) for rapid navigation and action execution.
  - Global Quick Capture (`Ctrl+Shift+Space` or user-defined shortcut) for instant ingestion.
  - Full keyboard accessibility for modal dialogs, list navigation, and form inputs.
- **Low-Friction Interactions**:
  - Avoid unnecessary confirmations for reversible actions (use non-blocking undo toasts instead).
  - Require explicit confirmation only for destructive, irreversible operations (e.g., permanently deleting a project).
  - Minimize multi-step wizards; favor streamlined, direct-manipulation flows.
- **Accessibility (a11y)**:
  - Use semantic HTML elements (`<main>`, `<nav>`, `<article>`, `<header>`, `<button>`).
  - Maintain WCAG 2.1 AA compliant color contrast across light and dark themes.
  - Ensure proper focus management when modals, drawers, or menus open and close.
  - Use descriptive `aria-label` and `aria-live` attributes where visual cues alone are insufficient.
- **Desktop Viewport Priority**:
  - Primary target: modern desktop/laptop screens (1280x720 up to 4K multi-monitor setups).
  - Clean responsive adaptability for flexible multi-pane splitting and window resizing.

---

## 6. Error Handling & Observability

- **No Silent Failures**: Every error must be caught, categorized, and presented with actionable user context.
- **Graceful Degradation**: If an external import parser encounters an unrecognized markdown dialect, it should import raw text with a warning rather than crashing the workspace.
- **Structured Error Model**:
  ```typescript
  interface AppError {
    code: string;           // e.g., 'IMPORT_PARSER_FAILED'
    message: string;        // User-friendly explanation
    details?: unknown;      // Debugging payload (in dev mode)
    recoverable: boolean;   // Whether the operation can be retried
  }
  ```
- **Local Diagnostics**: Maintain an in-memory or local activity log for operations and errors without transmitting analytics to remote servers without user consent.

---

## 7. Testing Philosophy

Testing must scale with development phases:
1. **Unit Tests**: Mandatory for data normalizers, import adapters, Brain relationship indexers, search tokenizers, and automation rule evaluators.
2. **Integration Tests**: Verify state transitions, project CRUD, file system read/write adapters, and import pipelines.
3. **End-to-End (E2E) Tests**: Verify shell navigation, command palette, capture workflows, and desktop packaging in later phases.
