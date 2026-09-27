# WorkBench — Phase 1: Architecture Foundation Reference

**Status:** Phase 1 Complete  
**Scope:** Structural layers, abstraction boundaries, and architectural patterns established in Phase 1.

---

## 1. System Layering & Separation of Concerns

WorkBench strictly decouples presentation, domain logic, persistence, and external ingestion into hierarchical layers:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
│       React Components │ Pages │ UI Primitives │ Layout Shell           │
├─────────────────────────────────────────────────────────────────────────┤
│                            FEATURE LAYER                                │
│       Feature-Scoped Hooks │ Feature Stores │ Feature UI Components     │
├─────────────────────────────────────────────────────────────────────────┤
│                            SERVICES LAYER                               │
│       Application Services │ Business Rules │ Brain Relational Engine   │
├─────────────────────────────────────────────────────────────────────────┤
│                          REPOSITORIES LAYER                             │
│       IRepository<T> Interfaces │ Storage Abstractions                  │
├─────────────────────────────────────────────────────────────────────────┤
│                     PERSISTENCE LAYER (Phases 4 & 27)                   │
│       IndexedDB (Web) │ SQLite & Local File System (Desktop)            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

1. **Presentation / UI (`src/components/`, `src/pages/`)**:
   - Strictly responsible for rendering, user input, visual feedback, and accessibility.
   - Must never directly interact with storage drivers or parse raw external AI payloads.
2. **Features (`src/features/`)**:
   - Encapsulates domain-specific workflows (e.g., `projects/`, `chats/`, `search/`, `inbox/`).
   - Connects UI to services and manages feature-local state.
3. **Services (`src/services/`)**:
   - Implements application workflows, entity linking, and orchestration.
   - Extends `BaseService` for unified structured logging.
4. **Repositories (`src/repositories/`)**:
   - Implements `IRepository<T>` contracts to isolate the application from the underlying storage mechanism.
   - In Phase 1, backed by `InMemoryRepository` to verify behavior before permanent database layers are attached.
5. **Persistence (Future Phases 4 & 27)**:
   - Pluggable storage drivers (IndexedDB for browser web app; SQLite/File System for Tauri desktop).

---

## 2. External Provider Ingestion Architecture

External AI sources (ChatGPT, Claude, Gemini, Perplexity) format conversation histories differently. WorkBench protects its internal models using an isolated adapter pipeline:

```text
[ External AI Platform / File / URL ]
                  │
                  ▼
         [ Provider Adapter ]          (Extracts raw messages & metadata)
                  │
                  ▼
          [ AST Normalizer ]           (Converts to standard schema)
                  │
                  ▼
         [ Normalized Model ]          (WorkBench Domain Entity + Provenance)
                  │
                  ▼
       [ Domain & Services ]           (Brain graph, search index, inbox)
                  │
                  ▼
           [ UI Viewer ]
```

---

## 3. Explicit Architectural Invariants

### Why There Is No Database Yet

- Phase 1 focuses purely on repository contracts (`IRepository<T>`) and in-memory test doubles.
- Permanent storage engines (IndexedDB in Phase 4 and SQLite in Phase 27) will plug cleanly into these interfaces without requiring refactoring in the UI or service layers.

### Why There Is No LLM

- WorkBench is a personal digital work area and organizer, **not** an AI chatbot.
- It does not generate AI responses or query LLM APIs. Core organizational operations (WorkBench Brain) rely on fast, local, deterministic relational indexing and full-text search.

### Why There Is No Tauri Yet

- Tauri (Rust desktop wrapper) will be introduced in Phase 25.
- The web application is built with standard Web APIs and decoupled storage adapters so it can be wrapped into a native desktop shell without rewriting business logic.

---

## 4. State Management Taxonomy

| Level               | Scope                   | Technology               | Example Use Case                              |
| :------------------ | :---------------------- | :----------------------- | :-------------------------------------------- |
| **Local Component** | Single Component / Form | `useState`, `useReducer` | Form input values, dropdown open state        |
| **Feature Store**   | Specific Domain Feature | Feature Zustand hook     | Active filters in Project view, Chat playback |
| **Global App**      | Cross-Cutting Shell     | `useAppStore` (Zustand)  | Sidebar collapsed, active modal, global theme |

---

## 5. Development Workflow Alignment

All code added in Phase 1 strictly complies with:

- [Product Contract](file:///c:/WorkBench/docs/PRODUCT_CONTRACT.md)
- [Engineering Principles](file:///c:/WorkBench/docs/ENGINEERING_PRINCIPLES.md)
- [Architecture Principles](file:///c:/WorkBench/docs/ARCHITECTURE_PRINCIPLES.md)
- [Glossary](file:///c:/WorkBench/docs/GLOSSARY.md)
- [Roadmap](file:///c:/WorkBench/docs/ROADMAP.md)
