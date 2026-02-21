## Why
The current UI lacks a cohesive design and "Clean Enterprise SaaS" aesthetic required by the stakeholder. Additionally, the Electron build is currently broken due to a syntax error in the main process entry file (`src/main/index.ts`), preventing desktop application packaging.

## What Changes
1.  **UI Overhaul**: Implement a "Clean Enterprise SaaS" design system (strict Light Mode) using Tailwind CSS.
    -   **Colors**: White background (#FFFFFF), Electric Blue (#2563EB) primary accent, Dark Charcoal (#1F2937) text, subtle borders (#F3F4F6).
    -   **Typography**: Modern Sans-Serif (Inter/system-ui), clear hierarchy (Semi-Bold titles, Regular body).
    -   **Shapes**: Extensive rounded corners (16-24px for cards/modals, pill-shaped buttons/inputs).
    -   **Layout**: Maximize whitespace, minimize shadows/borders.
    -   **Components**: Update buttons, tables (no vertical borders, subtle hover), avatars (overlapping), and timelines.
2.  **Electron Fix**: Correct the syntax error in `src/main/index.ts` (unexpected `]`) to unblock the build process.

## Capabilities

### New Capabilities
- `ui-theme`: A "Clean Enterprise SaaS" visual theme (Light Mode only).
- `desktop-build`: Functional Electron build process.

### Modified Capabilities
- `app-shell`: Updated main application shell with new layout and styling.
- `component-library`: Updated button, card, modal, list, and avatar styles to match the new design system.

## Impact
- **Files**: `src/index.css` (global styles), `src/App.tsx` (layout), `src/components/*` (UI components), `src/main/index.ts` (Electron main process).
- **Dependencies**: None (leveraging existing Tailwind CSS).
- **Systems**: Electron build pipeline, Frontend UI rendering.
