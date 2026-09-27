# WorkBench — Architecture Principles & System Design

**Status:** Phase 0 Locked  
**Scope:** Architectural blueprint governing all data models, services, engines, and integration layers across Phases 0–32.

---

## 1. Architectural Overview & System Layers

WorkBench follows a layered, modular architecture designed for local-first execution, clean separation of concerns, and seamless migration from web to desktop.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                            │
│  Workspace Shell │ Project Views │ Chat Viewer │ Note Editor │ Search  │
├────────────────────────────────────────────────────────────────────────┤
│                       WORKBENCH BRAIN LAYER                            │
│  Entity Graph │ Provenance Engine │ Full-Text Index │ Rule Automation │
├────────────────────────────────────────────────────────────────────────┤
│                       CORE DOMAIN SERVICES                             │
│  Project Store │ Chat Store │ Task/Decision Manager │ Inbox Manager    │
├────────────────────────────────────────────────────────────────────────┤
│                     UNIVERSAL IMPORT ENGINE                            │
│  Provider Adapters (ChatGPT, Claude, Gemini, Web, Markdown, PDF)      │
│  Parser Pipeline → Normalizer → Internal WorkBench Schema              │
├────────────────────────────────────────────────────────────────────────┤
│                     DATA ACCESS & STORAGE LAYER                        │
│  Local Storage Adapter (IndexedDB / SQLite / Local File System)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Normalized Internal Data Philosophy

External AI platforms and formats use wildly divergent schemas (e.g., ChatGPT conversation trees vs. Claude message lists vs. raw Markdown exports).

### The Invariant Rule

**Provider-specific formats MUST NEVER leak into the core UI or persistence layers.**

All imported or created content is parsed and transformed into a strictly typed, normalized WorkBench internal schema before entering the workspace or Inbox.

### Normalized Import Pipeline

```
[ External Source (ChatGPT / Claude / Gemini / Web / File) ]
                        │
                        ▼
               [ Provider Adapter ]
          (Extracts metadata & raw blocks)
                        │
                        ▼
                    [ Parser ]
          (Validates structure & syntax)
                        │
                        ▼
                  [ Normalizer ]
         (Maps to WorkBench Standard Schema)
                        │
                        ▼
         [ Normalized WorkBench Record ]
                        │
                        ▼
            [ Inbox OR Target Project ]
```

---

## 3. WorkBench Brain (Non-LLM Organizational Engine)

The term **WorkBench Brain** refers exclusively to the internal relational and indexing intelligence of the application.

> **CRITICAL ARCHITECTURE INVARIANT:**  
> The WorkBench Brain is **NOT** a neural network, LLM, or AI agent. It is a deterministic, high-performance relational engine and metadata index.

### Core Brain Responsibilities

1. **Entity Graphing**: Maintains bidirectional links between Projects, Chats, Messages, Files, Notes, Code Snippets, Tasks, and Decisions.
2. **Metadata & Tag Aggregation**: Manages tags, categories, timestamps, and custom attributes.
3. **Full-Text Indexing**: Powers sub-50ms local full-text search across all content without cloud services.
4. **Provenance Tracking**: Preserves source metadata for every imported piece of information.
5. **Automation Evaluation**: Executes deterministic `WHEN` -> `optional IF` -> `THEN` rules.
6. **Activity & History Stream**: Records structured event logs for auditability, timelines, and recovery.

### Relational Model Example

```
[ Project: CricAuction ]
   ├── [ Chat: CricHeroes Integration ] (Provider: ChatGPT, Shared URL)
   │      └── [ Message #4 ] ──(references)──► [ File: architecture.pdf ]
   ├── [ Decision: Use WebSocket Protocol ] ──(derived from)──► [ Message #4 ]
   └── [ Task: Implement Auth Handshake ] ──(linked to)──► [ Decision ]
```

---

## 4. Universal Import Security & Provider Boundaries

### Security Boundary

- WorkBench strictly imports content that the user legitimately owns or has authorized access to.
- **Never design or implement mechanisms to:**
  - Bypass authentication barriers or paywalls
  - Circumvent CAPTCHAs
  - Exploit private APIs or bypass platform security controls
- Legitimate import vectors:
  - User-provided export files (JSON, ZIP, Markdown, TXT, PDF)
  - Public/shared conversation URLs explicitly provided by the user
  - Browser extension capturing active user session with user consent
  - Manual copy-paste and clipboard capture

### Provider Adapter Isolation

Each provider (ChatGPT, Claude, Gemini, Perplexity, Generic Markdown, Web URLs) is implemented as a self-contained, isolated adapter module implementing a standard interface:

```typescript
interface ProviderAdapter<TRawInput = unknown> {
  readonly providerId: string;
  readonly providerName: string;
  canHandle(input: TRawInput): boolean;
  parse(input: TRawInput): Promise<NormalizedImportPayload>;
}
```

---

## 5. Provenance as a First-Class Citizen

Every imported entity must answer the user question: **"Where did this come from?"**

Provenance metadata is attached at normalization time and preserved across moves, edits, and exports:

```typescript
interface ProvenanceMetadata {
  provider: 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'web' | 'manual' | 'file';
  sourceUrl?: string;
  sourceConversationId?: string;
  sourceMessageId?: string;
  importedAt: string; // ISO 8601 UTC
  originalTitle?: string;
  externalId?: string;
  contentType: 'chat' | 'note' | 'code' | 'pdf' | 'html' | 'link';
}
```

---

## 6. Universal Search Architecture

- **Phases 0–13 Focus**: Fast, local, full-text inverted index.
  - Tokenization, stemming, exact match, fuzzy prefix match, and tag filtering.
  - Sub-50 millisecond response time across thousands of messages and notes.
  - Zero network overhead and zero cloud indexing.
- **Strict Prohibition for Initial Phases**: No vector databases (Chroma, Pinecone, Qdrant, etc.), no mandatory embedding computations, and no local neural search engines.
- **Future Optional Enhancements**: Semantic search may only be evaluated in late phases as an optional, pluggable local enhancement that never compromises lightweight startup or core search availability.

---

## 7. Deterministic Automation Architecture

WorkBench automations are built on a deterministic rule engine:

```
WHEN [Event Trigger] ──► IF [Conditions (Optional)] ──► THEN [Actions]
```

### Key Principles

- **Predictable**: No non-deterministic agentic decisions or hallucinations.
- **Inspectable & Debuggable**: Every triggered automation generates a visible execution log.
- **Reversible**: Where feasible, automated actions support undo/reversion.
- **Lightweight**: Evaluated synchronously or in microtasks on local events without background server processes.

_Example:_

- **WHEN**: `Conversation imported`
- **IF**: `Provider == 'Claude'` AND `Title contains 'Database Schema'`
- **THEN**: `Assign to Project 'Backend Refactor'`, `Add Tag #schema`

---

## 8. Inbox & Staging Strategy

- Captures or imports that lack an explicit project assignment automatically route to the **Inbox**.
- The Inbox serves as a clean, low-pressure staging buffer.
- Prevents project clutter and allows users to triage, tag, connect, or delete content at their own pace.

---

## 9. Web to Desktop Strategy & Evolution

WorkBench follows an intentional, non-disruptive migration path:

```
[ Phase 0-24: Web Application & Local-First Architecture ]
  - Standards-compliant HTML, CSS, TypeScript
  - Decoupled storage adapter layer (IndexedDB / File System Access API)
  - Modular shell and design system
                        │
                        ▼
[ Phase 25-27: Desktop Shell Conversion (Tauri) ]
  - Swap web storage adapter for native SQLite / Local File System
  - Ultra-lightweight native binary (Rust/Tauri backend)
  - Zero Electron bloat; ultra-low RAM footprint
                        │
                        ▼
[ Phase 28-32: Deep Windows Integration & Installer ]
  - System Tray, Global Shortcuts (Ctrl+Shift+Space), Native Notifications
  - File associations, Startup options, Windows MSI/EXE installer
```

### Architecture Rule

The web application must be designed with clean abstraction layers so converting to desktop requires **no rewrites of UI, business logic, or data normalizers**.

---

## 10. Backup, Portability & Data Safety

- **Zero Vendor Lock-in**: All workspace data can be exported in open, human-readable formats (JSON, Markdown directories, standard files).
- **Comprehensive Backup & Restore**: Full workspace snapshots with checksum verification to guarantee data integrity across years of use.
