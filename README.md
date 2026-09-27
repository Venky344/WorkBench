# WorkBench

> **Everything you work on, organized in one digital work area.**

WorkBench is a lightweight personal digital work area designed to help a single user organize and manage work spread across AI platforms (ChatGPT, Claude, Gemini, Perplexity) and digital sources (websites, documents, PDFs, code, notes, research).

---

## 📌 Phase 0: Product & Engineering Contract

WorkBench is developed under a strict, fixed **33-phase development roadmap (Phase 0 through Phase 32)**. Phase 0 establishes the immutable foundational contract, architectural boundaries, and engineering standards for all subsequent development.

### Core Documentation

The definitive specifications governing this project are documented in `/docs`:

- **[Product Contract](file:///c:/WorkBench/docs/PRODUCT_CONTRACT.md)**: Product definition, problem statement, the 8 core pillars, boundaries, local-first philosophy, lightweight requirements, and the explicit **No-LLM** rule.
- **[Engineering Principles](file:///c:/WorkBench/docs/ENGINEERING_PRINCIPLES.md)**: Code standards, modularity guidelines, strict type safety, defensive security, performance metrics, accessibility (a11y), error handling, and testing strategy.
- **[Architecture Principles](file:///c:/WorkBench/docs/ARCHITECTURE_PRINCIPLES.md)**: System design, normalized data pipelines, provider adapter isolation, non-LLM WorkBench Brain, provenance tracking, deterministic automations, and web-to-desktop migration path.
- **[Terminology & Glossary](file:///c:/WorkBench/docs/GLOSSARY.md)**: Standardized definitions for all domain entities and product concepts.
- **[Development Roadmap](file:///c:/WorkBench/docs/ROADMAP.md)**: Fixed 33-phase execution roadmap from Phase 0 to Phase 32.

---

## 🏛️ Core Architectural Invariants

1. **Not an AI Chatbot**: WorkBench organizes work that originated from AI platforms; it does not generate AI responses or wrap LLMs.
2. **Non-LLM WorkBench Brain**: The internal organizational intelligence is a deterministic relational and indexing engine, not an artificial intelligence model.
3. **Local-First & Offline Capable**: All core features (opening projects, browsing chats, notes, search, tasks, decisions) function 100% locally without cloud dependencies.
4. **Normalized Internal Format**: External provider formats (ChatGPT, Claude, Gemini, etc.) never leak into core components. All imports pass through isolated provider adapters and AST normalizers.
5. **Fast & Lightweight**: Sub-second cold start, instant local search, zero bloated background processes.
6. **Web to Desktop Strategy**: Web-first architecture designed to transition smoothly into a native Windows desktop shell (Tauri) in later phases without rewriting application logic.

---

## 🗺️ High-Level Roadmap Overview

| Phase Group | Phases | Key Focus |
| :--- | :--- | :--- |
| **Foundations & Shell** | 0 – 3 | Contract, Tooling, Custom Design System, Application Shell |
| **Core Data & Organization** | 4 – 10 | Local Storage, Projects, Chats, Notes, Tasks & Decision Log |
| **Brain & Search** | 11 – 14 | Relational Entity Graph, Project Memory, Full-Text Search, Provenance |
| **Universal Import** | 15 – 18 | Provider Adapters (ChatGPT/Claude/Gemini), Inbox Staging, Versioning |
| **Power Tools & Hardening** | 19 – 24 | Command Palette, Rule Automations, Extension, Web Release |
| **Desktop & Windows** | 25 – 32 | Tauri Shell, System Tray, SQLite/Local FS, Backups, Installer, QA |

---

## 🔒 Current Phase Status

- **Active Phase**: Phase 0 — Product & Engineering Contract
- **Status**: **COMPLETE — READY FOR REVIEW**
- **Next Phase**: Phase 1 — Repository & Architecture Foundation (Awaiting explicit instruction to begin)
