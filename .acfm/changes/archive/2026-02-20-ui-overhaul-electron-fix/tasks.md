## Tasks

### Electron Fix
- [x] Correct syntax error in `src/main/index.ts` (unexpected `]`).
- [x] Verify `npm run build` succeeds.

### Design System Setup
- [x] Configure `tailwind.config.js` with new color palette (Electric Blue #2563EB) and extended border radius.
- [x] Update `src/index.css` with global resets, font imports (Inter), and base styles.

### Component Library Updates
- [x] `src/components/common/Button.tsx`: Update to pill shape, primary/secondary variants.
- [x] `src/components/common/Input.tsx`: Update to pill shape, subtle borders.
- [x] `src/components/common/Dialog.tsx` (Modal): Update radius (16-24px), white bg, subtle shadow.
- [x] `src/components/common/Dropdown.tsx`: Update styling.
- [x] `src/components/common/Toast.tsx`: Update styling.

### Layout & Shell
- [x] `src/components/layout/AppShell.tsx`: Implement new layout (Sidebar + Main Content), maximizing whitespace.
- [x] `src/components/layout/Sidebar.tsx`: Implement navigation styling (active state: pale blue + primary text).
- [x] `src/components/layout/EntryList.tsx`: Implement list styling (no vertical borders, generous padding).
- [x] `src/components/layout/DetailPanel.tsx`: Update detail view styling.

### Feature Components
- [x] `src/components/vault/UnlockDialog.tsx`: Update vault unlock UI.
- [x] `src/components/vault/VaultPicker.tsx`: Update vault selection UI.
- [x] `src/components/entry/EntryForm.tsx`: Update form fields and layout.
- [x] `src/components/group/GroupForm.tsx`: Update form fields.
- [x] `src/components/generator/PasswordGenerator.tsx`: Update generator UI.

### Verification
- [x] Verify UI matches "Clean Enterprise SaaS" spec.
- [x] Verify Electron build still works.
