# WorkBench — Phase 3: Application Shell

**Status:** Completed  
**Milestone:** Phase 3 of 33  
**Date:** September 2026

---

## 1. Objective

The objective of Phase 3 is to establish the permanent, production-grade **WorkBench Application Shell** (`AppShell`). Building strictly on the Phase 0 Product & Engineering Contract, Phase 1 Architecture Foundation, and Phase 2 Design System, Phase 3 transforms WorkBench into a cohesive, structured, and modern digital workspace.

WorkBench is the user's **personal digital work area**—not an AI chatbot or wrapper. The shell prioritizes clarity, low visual noise, information hierarchy, fast interaction, keyboard accessibility, and seamless responsiveness.

---

## 2. Shell Architecture

The application shell provides a modular layout container wrapping all routed views, global headers, sidebars, navigation breadcrumbs, and modal trigger overlays.

```text
AppShell (Layout Root)
├── AppSidebar
│   ├── Logo / Brand (WorkBench official logo)
│   ├── Primary Navigation (Home, Projects, Conversations, Inbox, Tasks, Decisions, Resources)
│   ├── Workspace Collections (Favorites, Recent)
│   └── Secondary / Utility (Settings, Design System Showcase)
│
├── Main Viewport
│   ├── AppHeader
│   │   ├── Sidebar Collapse/Expand Trigger
│   │   ├── Route-Derived Breadcrumbs
│   │   └── GlobalActions
│   │       ├── Search (Ctrl+K Command Palette Trigger)
│   │       ├── Quick Capture (Ctrl+Shift+Space Trigger)
│   │       ├── Theme Selector (Dark, Light, System)
│   │       ├── Notifications Trigger
│   │       └── User Profile / Workspace Menu
│   │
│   └── Content Area (<main id="main-content">)
│       └── <ErrorBoundary>
│           └── <Outlet /> (Routed Pages)
│
└── Global UI Overlays
    ├── CommandPaletteModal (Ctrl+K / Cmd+K)
    ├── QuickCaptureModal (Ctrl+Shift+Space)
    └── ToastContainer (Global notifications)
```

---

## 3. Component Structure & Responsibilities

The application shell components are located in [`src/components/layout/`](file:///c:/WorkBench/src/components/layout/):

1. **[`AppShell.tsx`](file:///c:/WorkBench/src/components/layout/AppShell.tsx)**:
   - Root layout component rendered by `react-router-dom`.
   - Manages sticky sidebar positioning, scrollable main viewport, and modal mounting.
   - Embeds the application-level [`ErrorBoundary`](file:///c:/WorkBench/src/components/ui/ErrorBoundary.tsx) to catch rendering exceptions gracefully without exposing raw stack traces.

2. **[`AppSidebar.tsx`](file:///c:/WorkBench/src/components/layout/AppSidebar.tsx)**:
   - Houses primary navigation links with active indicator bars and route matching.
   - Supports **expanded** (16rem / 256px) and **collapsed** (4.25rem / 68px) visual states.
   - When collapsed, icon-only navigation items display descriptive [`Tooltip`](file:///c:/WorkBench/src/components/ui/Tooltip.tsx) elements on hover/focus.
   - Displays static placeholders for pinned/favorite projects and recent items.

3. **[`AppHeader.tsx`](file:///c:/WorkBench/src/components/layout/AppHeader.tsx)**:
   - Sticky top bar with glassmorphic backdrop blur (`--wb-z-sticky`).
   - Hosts the sidebar toggle button, dynamic route breadcrumbs, and global action buttons.

4. **[`Breadcrumbs.tsx`](file:///c:/WorkBench/src/components/layout/Breadcrumbs.tsx)**:
   - Route-derived path navigation with chevron separators (`lucide-react`).
   - Supports both automated pathname segment mapping and custom navigation overrides.

5. **[`GlobalActions.tsx`](file:///c:/WorkBench/src/components/layout/GlobalActions.tsx)**:
   - Search trigger opening the Command Palette (`Ctrl+K`).
   - Quick Capture trigger (`Ctrl+Shift+Space`).
   - Theme switcher dropdown (`Dark`, `Light`, `System`).
   - Notifications trigger (displaying toast status).
   - User profile dropdown menu.

6. **[`CommandPaletteModal.tsx`](file:///c:/WorkBench/src/components/layout/CommandPaletteModal.tsx)**:
   - Keyboard-accessible modal listening globally for `Ctrl+K` and `Cmd+K`.
   - Search filter for quick navigation across all application modules and theme toggles.

7. **[`QuickCaptureModal.tsx`](file:///c:/WorkBench/src/components/layout/QuickCaptureModal.tsx)**:
   - Global capture scratchpad accessible via `Ctrl+Shift+Space`.
   - Allows capturing raw thoughts, notes, and links directly to the **Inbox Staging Area**.

---

## 4. Navigation & Routing Structure

All routes are registered under the root `AppShell` layout in [`src/app/router/index.tsx`](file:///c:/WorkBench/src/app/router/index.tsx):

| Route            | Destination Component      | Purpose                                                                   |
| :--------------- | :------------------------- | :------------------------------------------------------------------------ |
| `/`              | `HomePage`                 | Workspace dashboard overview, metrics, recent projects, and quick actions |
| `/projects`      | `ProjectsPage`             | Project workspaces, status tags, and project directory                    |
| `/chats`         | `ChatsPage`                | Multi-platform AI conversation ingestion and exploration                  |
| `/inbox`         | `InboxPage`                | Fast-capture staging area for unorganized thoughts and items              |
| `/tasks`         | `TasksPage`                | Actionable work items connected to projects and decisions                 |
| `/decisions`     | `DecisionsPage`            | Architectural and technical Decision Record (ADR) log                     |
| `/resources`     | `ResourcesPage`            | External reference links, code repositories, and documentation            |
| `/settings`      | `SettingsPage`             | Workspace settings, theme configuration, and offline status               |
| `/showcase`      | `DesignSystemShowcasePage` | Interactive Phase 2 Design System showcase                                |
| `/design-system` | `DesignSystemShowcasePage` | Alias to design system showcase                                           |
| `*`              | `NotFoundPage`             | 404 handler with return navigation                                        |

---

## 5. Responsive & Adaptive Behavior

- **Desktop (>= 1024px)**: Full expanded sidebar (16rem), full header with all global action buttons, and responsive grid layouts for dashboard/page contents.
- **Tablet (768px - 1023px)**: Responsive width adaptation with automatic collapsing capabilities.
- **Narrow Viewport (< 768px)**: Sidebar collapses into compact icon mode (4.25rem) with tooltips to maximize content space while keeping navigation 1-click accessible.
- **Motion & Accessibility**: Smooth CSS transitions using design system motion tokens (`var(--wb-duration-normal) var(--wb-ease-default)`).

---

## 6. Theme Integration

All shell elements strictly consume the Phase 2 CSS design tokens (`var(--wb-color-*)`):

- Dynamic dark/light/system theme switching via `useThemeStore`.
- High-contrast active navigation states with accent indicator borders.
- Consistent background surfaces (`--wb-color-bg`, `--wb-color-bg-subtle`, `--wb-color-surface-elevated`).
- Clear text hierarchy (`--wb-color-fg`, `--wb-color-fg-muted`, `--wb-color-fg-subtle`).

---

## 7. Accessibility

- **Landmarks**: Semantic `<aside aria-label="Sidebar Navigation">`, `<header>`, `<nav aria-label="Breadcrumb">`, and `<main id="main-content">`.
- **Keyboard Navigation**: Full Tab navigation, focus outlines (`--wb-color-primary`), and `Escape` handlers for modals and menus.
- **Global Shortcuts**:
  - `Ctrl + K` / `Cmd + K`: Open Command Palette
  - `Ctrl + Shift + Space`: Open Quick Capture Scratchpad
- **Screen Reader Support**: Icon-only buttons provide explicit `aria-label` attributes and tooltip announcements.

---

## 8. Validation & Verification Results

All automated verification commands executed successfully:

```powershell
npm run typecheck      # PASS (TypeScript strict mode, 0 errors)
npm run test:run       # PASS (17 test files, 59 tests passing)
npm run lint           # PASS (ESLint 9 flat config, 0 errors, 0 warnings)
npm run format:check   # PASS (Prettier formatting verified)
npm run build          # PASS (Vite production bundle built cleanly)
```

### Test Coverage Summary:

- **`tests/shell/app-shell.test.tsx`**: Validates shell layout rendering, sidebar toggle, Ctrl+K shortcut, and capture shortcut.
- **`tests/shell/sidebar.test.tsx`**: Validates primary navigation items, active link indicator, and collapsed mode tooltips.
- **`tests/shell/breadcrumbs.test.tsx`**: Validates route-derived breadcrumb parsing and custom segment rendering.
- **`tests/shell/global-actions.test.tsx`**: Validates search, capture, notifications toast, and profile actions.
- **`tests/router.test.tsx`**: Validates all 10 registered application routes rendering inside the shell.
- **`tests/app.test.tsx`**: Validates root application startup and logo rendering.

## 9. Deferred Functionality (Explicit Roadmap Roadmap Boundaries)

In strict accordance with the Phase 3 contract and overall 33-phase roadmap:

- **Command Palette Functionality**: Filterable command execution, command registry, and action dispatching are deferred to **Phase 19 (Quick Capture & Command Center)**. Phase 3 only mounts the global shortcut (`Ctrl+K`) and placeholder modal.
- **Quick Capture Functionality**: Content capture parsing, destination triage, and Inbox ingestion are deferred to **Phase 19 (Quick Capture & Command Center)**. Phase 3 only mounts the global shortcut (`Ctrl+Shift+Space`) and placeholder modal.
- **Projects CRUD & Core Entities**: Project creation, lifecycle, editing, deletion, and status management are deferred to **Phase 5 (Project Management & Data Model)**.
- **Project Workspace & Context Engine**: Multi-tab workspace, project overview dashboard, and pinned resource views are deferred to **Phase 6 (Project Workspace & Context Engine)**.
- **Conversations / Chat Groups**: Multi-platform chat ingestion, group organization, session grouping, and transcript viewing are deferred to **Phase 7 (Multi-Platform Chat Ingestion & Normalization)**.
- **Organization & Triage Engine**: Auto-categorization, tagging, collections, and triage rules are deferred to **Phase 8 (Workspace Organization & Information Architecture)**.
- **Files, Notes, Links & Resources**: File attachment indexing, rich markdown notes, external resource libraries, and code snippet storage are deferred to **Phase 9 (Files, Notes, Snippets & Resource Management)**.
- **Tasks & Decision Log Engine**: Actionable work item lifecycles, bidirectional entity linking, and Architectural Decision Record (ADR) workflows are deferred to **Phase 10 (Task System & Decision Log)**.
- **Universal Search & Indexing Engine**: Full-text keyword search, inverted index creation, and filter query processing are deferred to **Phase 13 (Universal Search Engine)**.
- **Database & Persistence**: Local persistence via IndexedDB / Dexie / SQLite is deferred to **Phase 4 (Core Data Architecture & Persistence Foundation)** and **Phase 27 (Local Database Architecture)**.
- **Desktop Packaging & Windows APIs**: Tauri packaging, native file system integrations, and OS window controls are deferred to **Phase 25 (Desktop Packaging & Native Integration)**.
- **AI & LLM Integrations**: WorkBench is an offline-first workspace. No AI chatbots, LLM API calls, or vector databases are included.
