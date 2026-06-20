# Component Structure Documentation

This document describes the design principles and hierarchy of components in the AI Recommendation System.

## Atomic Design Principles
We utilize a modified Atomic Design approach to ensure reusability and scalability.

### 1. Common Components (`/src/components/common`)
Pure, stateless components that provide basic UI functionality.
- **Buttons**: Variant-based (primary, secondary, outline, ghost).
- **Inputs**: Controlled and uncontrolled wrappers for standard HTML inputs.
- **Badges**: Status indicators (e.g., Application Status, Recommendation Category).

### 2. Layout Components (`/src/components/layout`)
Managed shells that define the structure of the application.
- **Sidebar**: Dynamic navigation with role-based visibility.
- **Navbar**: High-level actions (Theme switch, Profile menu, Notifications).
- **Breadcrumbs**: Automated path tracking based on routing.

### 3. Feature Cards (`/src/components/cards`)
Self-contained units for displaying entity data.
- **UniversityCard**: Image, name, ranking, and quick-save button.
- **ProgramCard**: Program details, fees, and requirements.
- **PredictionCard**: Visualization of admission probability.
- **ExplanationCard**: Expandable AI-generated insights.

### 4. Data Management (`/src/components/tables` & `/src/components/forms`)
- **DataTable**: Integrated with TanStack Table for sorting, filtering, and pagination.
- **ReactiveForms**: Built on React Hook Form + Zod for robust validation and error handling.

### 5. Specialized UI (`/src/components/charts` & `/src/components/dialogs`)
- **Recharts Wrappers**: Pre-configured charts (Bar, Area, Pie) for consistent branding.
- **Modal/Dialogs**: Centrally managed overlays for CRUD and confirmation flows.

## Component Reusability Rules
1. **No Side Effects**: Common and Card components should not fetch data; props only.
2. **Typescript/Zod Proof**: All component inputs are validated or strictly typed.
3. **Styling**: Components must use Tailwind utility classes defined in the global theme.
