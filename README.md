# WorkBench

> **Everything you work on, organized in one digital work area.**

WorkBench is a lightweight personal digital work area designed to help a single user organize and manage work spread across AI platforms (ChatGPT, Claude, Gemini, Perplexity) and digital sources (websites, documents, PDFs, code, notes, research).

---

## 📌 Development Status

- **Current Phase**: **Phase 2 — WorkBench Design System** (Completed & Validated)
- **Next Phase**: **Phase 3 — Application Shell**

---

## 🎨 Design System & Component Showcase

WorkBench features a centralized design system with semantic tokens, dark/light themes, and accessible UI primitives.

Access the interactive showcase:

- Run `npm run dev` and navigate to `http://localhost:3000/showcase` (or `/design-system`).

---

## 🚀 Quick Start & Development Guide

### Prerequisites

- Node.js `>= 18.0.0` (Tested on Node `v24.x`)
- npm `>= 9.0.0`

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Starts the local development server at `http://localhost:3000`.

### 3. Run Test Suite

```bash
npm run test:run
```

Executes all unit and integration tests via Vitest in jsdom environment.

### 4. Type Check

```bash
npm run typecheck
```

Executes TypeScript compilation check (`tsc --noEmit`) in strict mode.

### 5. Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Verify formatting without modifying files
npm run format:check
```

### 6. Production Build & Preview

```bash
npm run build
npm run preview
```

---

## 📚 Core Architecture & Documentation

All architectural contracts and specifications are located in `/docs`:

- **[Product Contract](file:///c:/WorkBench/docs/PRODUCT_CONTRACT.md)**: Product scope, 8 core pillars, and the **No-LLM** rule.
- **[Engineering Principles](file:///c:/WorkBench/docs/ENGINEERING_PRINCIPLES.md)**: Strict typing, performance targets, defensive security, and code quality standards.
- **[Architecture Principles](file:///c:/WorkBench/docs/ARCHITECTURE_PRINCIPLES.md)**: Normalized data pipeline, provider isolation, and non-LLM WorkBench Brain.
- **[Phase 1 Architecture Reference](file:///c:/WorkBench/docs/ARCHITECTURE_FOUNDATION_PHASE1.md)**: Layered system design, repository abstractions, and state taxonomy.
- **[Phase 2 Design System Reference](file:///c:/WorkBench/docs/DESIGN_SYSTEM_PHASE2.md)**: Semantic design tokens, typography, spacing, component inventory, theme architecture, and accessibility standards.
- **[Terminology Glossary](file:///c:/WorkBench/docs/GLOSSARY.md)**: Standardized domain lexicon.
- **[33-Phase Roadmap](file:///c:/WorkBench/docs/ROADMAP.md)**: Immutable development roadmap from Phase 0 to Phase 32.

---

## 🏛️ Architectural Invariants

1. **Not an AI Chatbot**: WorkBench organizes external conversations; it does not wrap LLMs or generate AI text.
2. **Deterministic WorkBench Brain**: Internal relational indexing and full-text search without neural models.
3. **Local-First**: Complete functionality without mandatory internet access or cloud services.
4. **Normalized Pipelines**: External provider formats (ChatGPT, Claude, Gemini) are normalized at the boundary and never leak into core logic.
5. **Web to Desktop Strategy**: Web-first codebase designed for clean packaging into a native Windows desktop shell (Tauri) in Phase 25.
