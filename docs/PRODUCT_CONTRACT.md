# WorkBench — Product Contract

**Product Name:** WorkBench  
**Status:** Phase 0 Locked  
**Audience:** All engineers, designers, and contributors working on WorkBench (Phases 0–32)

---

## 1. Executive Summary & Product Vision

**WorkBench** is a lightweight, personal digital work area designed to help a single user organize and manage work spread across AI platforms and digital sources.

The central product idea is:
> **Everything you work on, organized in one digital work area.**

### The Core Problem
Modern knowledge workers increasingly perform complex work through AI conversations and distributed web tools. Over time, this causes severe fragmentation. A user often remembers:
- Discussing an architectural design with an AI
- Researching a framework or library
- Generating code snippets
- Making a critical technical or product decision
- Solving a difficult bug or drafting an algorithm

...but cannot remember:
- Which AI platform was used (ChatGPT, Claude, Gemini, Perplexity, etc.)
- Which conversation contained the specific breakthrough or decision
- Which project or repository it belonged to
- Where the exact response or code block is located
- What downstream tasks or decisions were made from that interaction
- Where they stopped working during the last session

Existing tools (browser history, pinned chats, bookmarks, local folders, generic note apps) do not solve this problem because they lack conversation provenance, project relationship graphing, and cross-platform capture. WorkBench solves this by serving as the persistent, organized work area above these diverse sources.

---

## 2. What WorkBench IS and IS NOT

| What WorkBench IS | What WorkBench IS NOT |
| :--- | :--- |
| **A personal digital work area** for organizing projects, chats, notes, files, tasks, and decisions. | **NOT another AI chatbot** or LLM wrapper. |
| **A local-first, lightweight command center** that preserves context and provenance across AI sources. | **NOT an AI generation engine** that requires API keys or continuous inference. |
| **A fast indexing & organization layer (WorkBench Brain)** for entity linking and structured metadata. | **NOT a vector database** or heavy agentic runtime. |
| **A universal capture and import system** for external AI conversations and web resources. | **NOT a scraper that bypasses security/auth** or circumvents platform boundaries. |

---

## 3. The 8 Core Product Pillars

WorkBench is built on eight foundational pillars:

1. **Organize**: Projects, Conversations, Groups, Files, Notes, Tasks, Decisions, and Resources structured in unified, linked project workspaces.
2. **Find**: Instant universal full-text search across all workspace entities, messages, metadata, tags, and decisions.
3. **Import**: Multi-source import pipelines bringing conversations and artifacts from external platforms into normalized WorkBench records.
4. **Remember**: Persistent project memory, contextual decision logs, metadata, relationships, activity streams, and historical snapshots.
5. **Connect**: Deep bidirectional referencing and relationship modeling between tasks, chats, files, snippets, and decisions.
6. **Capture**: Frictionless multi-modal capture (Quick Capture, clipboard listeners, browser extension, OS-level shortcuts).
7. **Automate**: Lightweight, deterministic rule-based automations (`WHEN` -> `optional IF` -> `THEN`) without unpredictable agents.
8. **Stay Lightweight**: Lightning-fast startup, instant UI transitions, zero bloat, low RAM/CPU footprint, and zero mandatory background daemons.

---

## 4. Critical Product Rule: NO Embedded LLM

WorkBench **MUST NOT** require an embedded LLM or cloud AI service to function.

- **Zero Core Dependency on AI Models**: The core architecture must never depend on OpenAI, Anthropic, Gemini, Perplexity, Ollama, local LLMs, Transformers, GPU acceleration, model downloads, or mandatory embedding pipelines.
- **Independent Utility**: WorkBench must remain 100% useful, functional, and fast as an offline workspace without any internet access or AI subscriptions.
- **Role of AI in WorkBench**: WorkBench *organizes* content that originated from AI platforms; it does not need to generate AI responses itself. Any future intelligence features must strictly be optional, decoupled add-ons that never break or gate core functionality.

---

## 5. Local-First & Performance Philosophy

### Local-First Operation
- WorkBench is designed to operate primarily on the user's local machine.
- Core local operations include: opening workspaces, browsing chats, editing notes, reading files, searching, managing tasks, logging decisions, and executing automations.
- Internet connectivity is required **only** when explicitly interacting with external web resources (e.g., importing from a live shared URL or optional remote sync).

### Performance Philosophy
> **Open instantly. Search instantly. Organize instantly.**

Engineering must actively prevent:
- Unnecessary background worker processes and heavy polling loops
- Extraneous network round-trips
- Bulky, unvetted runtime dependencies
- Heavy memory bloat and CPU spikes
- Complex, unindexed database queries

Performance is an architectural invariant from Phase 0 to Phase 32, not an afterthought.

---

## 6. Product Entity Scope

WorkBench establishes a clear hierarchy of workspace entities:

```
Workspace
├── Inbox (Staging Area for unassigned imports & captures)
├── Automations (Rule-based triggers & actions)
└── Projects (Primary Organizational Containers)
    ├── Context & Settings (Project memory & configuration)
    ├── Chat Groups & Conversations (Normalized multi-source chat records)
    ├── Files & Documents (Referenced or imported files, PDFs, assets)
    ├── Notes & Code Snippets (Rich/plain text notes, tagged snippets)
    ├── Tasks (Actionable work items linked to context)
    ├── Decisions (Architectural/design records with rationale)
    ├── Resources & Links (External URLs, documentation, bookmarks)
    └── Activity Log (Audit trail of operations & milestones)
```

No entity exists in a silo. Every entity can reference, link to, or be derived from another entity (e.g., a Task links to a specific Chat message, which links to a Decision and a Code Snippet).

---

## 7. Product Boundary Checklist for All Phases

- [x] Does this feature work without an LLM? **(Must be YES)**
- [x] Does this feature operate locally without requiring cloud servers? **(Must be YES)**
- [x] Is the data model normalized and decoupled from external provider specifics? **(Must be YES)**
- [x] Does imported content preserve provenance (source, provider, timestamp, URL)? **(Must be YES)**
- [x] Does the UI respond instantly without blocking on background tasks? **(Must be YES)**
- [x] Does this feature follow the fixed 33-phase roadmap? **(Must be YES)**
