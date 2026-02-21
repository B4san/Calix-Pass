# Spec: UI Theme (Clean Enterprise SaaS)

## functional_requirements

### ADDED Color System
The application MUST use the following strict Light Mode palette:
- **Background**: Pure White (#FFFFFF)
- **Primary**: Electric Blue (#2563EB) for main actions, active states, and highlights.
- **Primary Text**: Dark Charcoal (#1F2937) for headings and body.
- **Secondary Text**: Medium Gray (#6B7280) for metadata and placeholders.
- **Borders**: Very subtle Light Gray (#F3F4F6) or (#E5E7EB).
- **Active Background**: Pale Blue (#EFF6FF) for selected items.

### ADDED Typography
The application MUST use a modern Sans-Serif font stack (Inter, system-ui).
- **Headings**: Semi-Bold (600), 16px-20px.
- **Body**: Regular (400), 14px.
- **Metadata**: Regular (400), 12px.

### ADDED Component Styles
- **Buttons**:
    - Primary: Solid #2563EB, White text, pill shape (rounded-full).
    - Secondary/Ghost: Transparent background, #1F2937 text, hover #F3F4F6.
- **Inputs**: Pill shape (rounded-full), subtle border.
- **Cards/Modals**: Large border radius (16px-24px), white background, subtle shadow (shadow-sm).
- **Tables/Lists**:
    - No vertical borders.
    - Subtle horizontal borders (#F3F4F6).
    - Generous vertical padding (py-3 or py-4).
    - Hover state: Background #F9FAFB or #EFF6FF.
- **Avatars**: Circular, overlapping with white border if grouped.

## user_interaction

### ADDED Visual Feedback
- **Hover**: Subtle background change or opacity shift.
- **Focus**: Blue ring (#2563EB) with offset.
- **Active/Selected**: Pale blue background (#EFF6FF) + Blue text (#2563EB).

## edge_cases

### ADDED Dark Mode Constraint
- The application MUST NOT support Dark Mode in this version. It is strictly Light Mode as per requirements.
