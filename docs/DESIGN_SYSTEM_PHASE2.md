# WorkBench — Phase 2: Design System Specification

**Status:** Phase 2 Complete  
**Scope:** Complete visual language, semantic design tokens, theme architecture, and reusable UI component primitives.

---

## 1. Design Philosophy & Aesthetic Principles

WorkBench is a professional productivity and workspace application designed for long, focused work sessions.

> **Core Objective:** clarity → speed → hierarchy → usability

### Visual Tenets

- **Calm & Focused**: Dark mode by default with ultra-low visual fatigue (`--wb-color-bg: #0a0d14`). Restrained contrast with clear visual hierarchy.
- **Desktop-Oriented & Information-Dense**: Clean, structured layout with compact component heights (2.25rem standard input/button) without feeling cluttered.
- **Fast & Responsive**: Sub-150ms transitions, instant keyboard navigation, and zero unnecessary visual decorations or heavy animations.
- **Semantic First**: All styling is driven by `--wb-*` semantic design tokens, enabling complete theme switching between dark and light modes without altering component code.

---

## 2. Design Tokens Reference

All design tokens are centralized in `src/styles/tokens/` with the `--wb-` namespace prefix.

### A. Semantic Color Palette

| Token                         | Dark Theme                | Light Theme              | Usage                                  |
| :---------------------------- | :------------------------ | :----------------------- | :------------------------------------- |
| `--wb-color-bg`               | `#0a0d14`                 | `#f8fafc`                | Deep application background            |
| `--wb-color-bg-subtle`        | `#0f1420`                 | `#f1f5f9`                | Inputs, sub-panels, empty states       |
| `--wb-color-surface`          | `#141a29`                 | `#ffffff`                | Standard card and panel surfaces       |
| `--wb-color-surface-elevated` | `#1a2236`                 | `#ffffff`                | Modals, dropdown menus, popovers       |
| `--wb-color-surface-hover`    | `#1f2940`                 | `#f1f5f9`                | Hover state for interactive surfaces   |
| `--wb-color-surface-active`   | `#26334f`                 | `#e2e8f0`                | Active selection, track backgrounds    |
| `--wb-color-border`           | `#232d42`                 | `#e2e8f0`                | Standard structural borders            |
| `--wb-color-border-subtle`    | `#182030`                 | `#f1f5f9`                | Internal separators, subtle lines      |
| `--wb-color-border-strong`    | `#364566`                 | `#cbd5e1`                | Input borders, active outlines         |
| `--wb-color-fg`               | `#f8fafc`                 | `#0f172a`                | Primary high-contrast text             |
| `--wb-color-fg-muted`         | `#94a3b8`                 | `#475569`                | Secondary descriptions, subheadings    |
| `--wb-color-fg-subtle`        | `#64748b`                 | `#94a3b8`                | Placeholder text, timestamps, captions |
| `--wb-color-primary`          | `#38bdf8`                 | `#0284c7`                | Primary action buttons, active tabs    |
| `--wb-color-primary-hover`    | `#0ea5e9`                 | `#0369a1`                | Primary action hover state             |
| `--wb-color-primary-fg`       | `#04131f`                 | `#ffffff`                | High contrast text on primary          |
| `--wb-color-secondary`        | `#1e293b`                 | `#f1f5f9`                | Secondary buttons and badges           |
| `--wb-color-secondary-fg`     | `#e2e8f0`                 | `#1e293b`                | Text on secondary surfaces             |
| `--wb-color-accent`           | `#6366f1`                 | `#4f46e5`                | Source badges, special highlights      |
| `--wb-color-success`          | `#10b981`                 | `#059669`                | Sync indicators, completed tasks       |
| `--wb-color-warning`          | `#f59e0b`                 | `#d97706`                | Staging inbox items, review alerts     |
| `--wb-color-destructive`      | `#ef4444`                 | `#dc2626`                | Destructive buttons, error alerts      |
| `--wb-color-info`             | `#0ea5e9`                 | `#0284c7`                | Informational toasts and tags          |
| `--wb-color-focus-ring`       | `rgba(56, 189, 248, 0.5)` | `rgba(2, 132, 199, 0.4)` | Focus outline ring                     |

### B. Typography Scale

- **Font Sans**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Font Mono**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

| Scale             | Token            | Size            | Line Height | Weight          | Usage                         |
| :---------------- | :--------------- | :-------------- | :---------- | :-------------- | :---------------------------- |
| **Display**       | `--wb-text-4xl`  | 2.25rem (36px)  | 1.25        | Bold (700)      | Marketing / Hero banners      |
| **Heading 1**     | `--wb-text-3xl`  | 1.875rem (30px) | 1.25        | Bold (700)      | Top-level section titles      |
| **Heading 2**     | `--wb-text-2xl`  | 1.5rem (24px)   | 1.375       | Semibold (600)  | Project view titles           |
| **Heading 3**     | `--wb-text-xl`   | 1.25rem (20px)  | 1.375       | Semibold (600)  | Card and modal titles         |
| **Body Large**    | `--wb-text-lg`   | 1.125rem (18px) | 1.625       | Normal (400)    | Intro copy, summaries         |
| **Body Standard** | `--wb-text-base` | 1.0rem (16px)   | 1.5         | Normal (400)    | Default message and note text |
| **Body Small**    | `--wb-text-sm`   | 0.875rem (14px) | 1.5         | Normal / Medium | Inputs, buttons, lists        |
| **Caption**       | `--wb-text-xs`   | 0.75rem (12px)  | 1.5         | Normal / Medium | Badges, timestamps, tooltips  |

### C. Spacing Scale

Base grid unit is 4px (`--wb-space-1` = 0.25rem):
`--wb-space-1` (4px), `--wb-space-2` (8px), `--wb-space-3` (12px), `--wb-space-4` (16px), `--wb-space-5` (20px), `--wb-space-6` (24px), `--wb-space-8` (32px), `--wb-space-10` (40px), `--wb-space-12` (48px), `--wb-space-16` (64px).

### D. Border Radius Scale

`--wb-radius-sm` (4px), `--wb-radius-md` (6px), `--wb-radius-lg` (8px), `--wb-radius-xl` (12px), `--wb-radius-2xl` (16px), `--wb-radius-full` (9999px).

### E. Elevation & Shadows

- `--wb-shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.4)` (Standard cards)
- `--wb-shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.5)` (Elevated cards, tooltips)
- `--wb-shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.6)` (Dropdowns, toasts)
- `--wb-shadow-elevated`: `0 20px 25px -5px rgba(0, 0, 0, 0.7)` (Modal dialogs)

### F. Motion & Reduced Motion

- `--wb-duration-instant`: 50ms (Button presses)
- `--wb-duration-fast`: 150ms (Dropdowns, tooltips, fades)
- `--wb-duration-normal`: 200ms (Progress transitions)
- `--wb-duration-slow`: 300ms (Dialog transitions)
- `@media (prefers-reduced-motion: reduce)`: All animation and transition durations drop to 0ms.

---

## 3. Component Inventory

| Component      | Location                             | Features                                                                                                                                                                 |
| :------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Logo`         | `src/components/ui/Logo.tsx`         | Official WorkBench logo wrapper with responsive sizing (`sm`, `md`, `lg`, custom px) and SVG fallback.                                                                   |
| `Button`       | `src/components/ui/Button.tsx`       | Variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`), sizes (`sm`, `md`, `lg`, `icon`), loading spinner, icon slots.                             |
| `Input`        | `src/components/ui/Input.tsx`        | Accessible label, left/right icon slots, helper text, error state, `aria-invalid`, `aria-describedby`.                                                                   |
| `Textarea`     | `src/components/ui/Textarea.tsx`     | Multiline input with validation states, dynamic rows, and helper text.                                                                                                   |
| `Select`       | `src/components/ui/Select.tsx`       | Custom styled select dropdown with options array, chevron indicator, and error states.                                                                                   |
| `Checkbox`     | `src/components/ui/Checkbox.tsx`     | Accessible checkbox supporting `checked`, `unchecked`, and `indeterminate` states.                                                                                       |
| `Switch`       | `src/components/ui/Switch.tsx`       | Toggle switch with `role="switch"`, `aria-checked`, label, and description.                                                                                              |
| `Radio`        | `src/components/ui/Radio.tsx`        | Radio group item with label, description, and custom circular indicator.                                                                                                 |
| `Card`         | `src/components/ui/Card.tsx`         | Composable surface primitive (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) with `default`, `elevated`, `outlined`, `interactive` variants. |
| `Badge`        | `src/components/ui/Badge.tsx`        | Status tags for `neutral`, `primary`, `success`, `warning`, `destructive`, `info`; styles `subtle`, `solid`, `outline`; optional status dot.                             |
| `Avatar`       | `src/components/ui/Avatar.tsx`       | Entity avatar for users, projects, and sources; sizes `sm`, `md`, `lg`, `xl`; initials fallback; image error handling.                                                   |
| `Tooltip`      | `src/components/ui/Tooltip.tsx`      | Accessible tooltip with hover/focus triggers, configurable placement (`top`, `bottom`, `left`, `right`), and Escape key dismiss.                                         |
| `Dialog`       | `src/components/ui/Dialog.tsx`       | Accessible modal dialog with focus management, backdrop blur, Escape key dismiss, and `DialogFooter`.                                                                    |
| `DropdownMenu` | `src/components/ui/DropdownMenu.tsx` | Accessible menu popup with trigger, items, separators, and outside-click dismiss.                                                                                        |
| `Tabs`         | `src/components/ui/Tabs.tsx`         | Accessible tabs container (`TabsList`, `TabsTrigger`, `TabsContent`) with ARIA roles and active indicators.                                                              |
| `Toast`        | `src/components/ui/Toast.tsx`        | Non-blocking toast notification system with `toast.success()`, `toast.error()`, `toast.warn()`, `toast.info()`.                                                          |
| `Separator`    | `src/components/ui/Separator.tsx`    | Horizontal and vertical visual dividers with optional text label.                                                                                                        |
| `Skeleton`     | `src/components/ui/Skeleton.tsx`     | Subtle pulsing loading placeholders with custom height, width, and circular options.                                                                                     |
| `Progress`     | `src/components/ui/Progress.tsx`     | Accessible progress bar with percentage calculations and semantic variants.                                                                                              |
| `EmptyState`   | `src/components/ui/EmptyState.tsx`   | Generic empty container placeholder with icon, title, description, and action button.                                                                                    |
| `LoadingState` | `src/components/ui/LoadingState.tsx` | Generic loading placeholder with spinner and customizable message.                                                                                                       |
| `ErrorState`   | `src/components/ui/ErrorState.tsx`   | Generic error alert placeholder with retry action.                                                                                                                       |

---

## 4. Theme System

Theme switching is managed through `useThemeStore` (`src/stores/theme.store.ts`):

- **Modes Supported**: `'dark'`, `'light'`, `'system'`
- **DOM Integration**: Sets `data-theme="dark"` or `data-theme="light"` on `document.documentElement`.
- **System Preference**: Automatically detects `window.matchMedia('(prefers-color-scheme: dark)')` when mode is `'system'`.

---

## 5. Accessibility & Keyboard Standards

1. **Semantic HTML**: Buttons use `<button>`, inputs use `<input>`, headings use appropriate `<h1>`–`<h3>`.
2. **Focus Rings**: `:focus-visible` outline uses `--wb-color-focus-ring` with a 2px offset.
3. **Keyboard Dismiss**: Modals, tooltips, and dropdown menus close automatically on `Escape`.
4. **ARIA Roles**: Explicit `role="dialog"`, `role="menu"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="switch"`, `role="progressbar"`, `role="status"`, `role="alert"`.
5. **Contrast Compliance**: WCAG 2.1 AA compliant contrast across all foreground/background pairings.

---

## 6. Showcase Route

Developers can inspect and test all design tokens, components, states, and light/dark theme switches at:

```text
http://localhost:3000/showcase
```

(or `/design-system`)
