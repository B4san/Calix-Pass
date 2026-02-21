## Context
The application is currently a web/desktop hybrid using React and Electron. The UI is inconsistent or missing, and the Electron build is broken due to a syntax error. A new "Clean Enterprise SaaS" UI is required.

## Goals
1.  Establish a cohesive design system using Tailwind CSS.
2.  Refactor key UI components to match the "Clean Enterprise SaaS" spec.
3.  Fix the Electron build pipeline.

## Non-Goals
1.  Adding new functional features (e.g., password generation logic changes).
2.  Implementing Dark Mode (explicitly excluded).

## Design Decisions

### Decision: Tailwind CSS for Design System
- **Approach:** Leverage existing Tailwind configuration. Extend theme with custom colors (Electric Blue #2563EB) and border radius.
- **Rationale:** Aligns with project conventions and allows rapid styling.
- **Alternatives considered:** Vanilla CSS (rejected due to existing Tailwind setup and project constraints).

### Decision: Electron Fix
- **Approach:** Correct the syntax error in `src/main/index.ts` directly.
- **Rationale:** Blocking issue for packaging.

## Architecture
- **Frontend**: React 18 + Tailwind.
- **Desktop**: Electron 28 (Main process) + React (Renderer).
- **State**: Zustand stores (no change).
