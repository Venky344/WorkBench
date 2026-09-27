# WorkBench — Terminology & Product Glossary

**Status:** Phase 0 Locked  
**Scope:** Standardized lexicon to be used consistently across all documentation, codebases, UI copy, and commit histories.

---

| Term | Definition |
| :--- | :--- |
| **WorkBench** | The overall product: a lightweight, personal digital work area for organizing projects, AI conversations, notes, files, tasks, and decisions. |
| **Workspace** | The user's top-level work environment containing all projects, inbox items, automations, global indexes, and user configuration. |
| **Project** | The primary organizational container within a workspace. Groups related chats, files, notes, tasks, decisions, links, and context. |
| **Chat / Conversation** | A structured record of messages (user inputs and assistant outputs) imported from an external AI platform or created locally. |
| **Group / Chat Group** | A sub-organizational folder or grouping of conversations within a specific project. |
| **Inbox** | The default staging buffer where captured snippets, URLs, and imported conversations land when no target project is specified. |
| **Task** | An actionable work item tracked within a project, optionally linked to specific messages, files, or decisions. |
| **Decision** | An explicit record of an architectural, design, or product decision, capturing context, options considered, and chosen rationale. |
| **Resource** | A reference asset associated with a project (e.g., external URL, documentation link, PDF, code file, bookmark). |
| **Source** | The original external origin of an imported item (e.g., ChatGPT shared URL, Claude export ZIP, web article URL). |
| **Import** | The automated or manual pipeline that brings external data into WorkBench through provider adapters, parsers, and normalizers. |
| **Provider Adapter** | A specialized module responsible for parsing raw data from a specific external platform (e.g., OpenAI, Anthropic, Google) into standard tokens. |
| **Normalizer** | The component that converts provider-specific ASTs or payloads into the universal, type-safe WorkBench internal data schema. |
| **WorkBench Brain** | The deterministic, non-LLM relational and indexing engine responsible for entity linking, full-text search, provenance, and automations. |
| **Provenance** | The immutable audit trail recording where, when, and from what external platform/URL a piece of content originated. |
| **Project Context / Memory**| The accumulated structured metadata, summary, decisions, and active focus areas that define a project's current state. |
| **Automation** | A deterministic, user-defined workflow rule following the `WHEN [Event] -> IF [Condition] -> THEN [Action]` pattern. |
| **Quick Capture** | A low-friction global modal or shortcut for instantly storing notes, snippets, URLs, or clipboard text into the Inbox or a project. |
| **Activity Log** | An append-only chronological log of operations performed in the workspace (create, edit, move, archive, tag, link, delete). |
| **Local-First** | An architectural paradigm where data is stored, indexed, and processed on the local device, functioning completely offline without mandatory cloud dependencies. |
