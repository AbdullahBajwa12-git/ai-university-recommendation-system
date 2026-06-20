# Frontend Architecture Documentation

## Core Technologies
- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS + Shadcn UI (Radix UI primitives)
- **Routing**: React Router v6
- **State Management**:
  - **Server State**: React Query (TanStack Query) for caching, refetching, and synchronization.
  - **Global UI State**: React Context API for lightweight state (Auth, Theme).
- **Forms**: React Hook Form + Zod for schema-based validation.
- **Visuals**: Recharts (Analytics), Framer Motion (Transitions/Animations).

## API Integration Layer
We use a centralized Axios instance configured in `src/services/api.js`.

### Interceptors
- **Request Interceptor**: Automatically attaches the JWT token from `localStorage` to every request's `Authorization` header.
- **Response Interceptor**:
  - Handles `401 Unauthorized` by attempting a token refresh.
  - If refresh fails, redirects to `/login` and clears user data.
  - Standardizes error handling to display global toast notifications.

## Design Patterns

### 1. Atomic-inspired Components
- **Common**: Reusable, pure components (Buttons, Inputs).
- **Composite**: Complex components built from common ones (DataTables, Navbar).
- **Page-level**: Layouts that orchestrate multiple components.

### 2. Custom Hooks for Logic
All data fetching and complex business logic live inside custom hooks in `src/hooks/`. This keeps components focused on presentation.
Example: `useUniversities()`, `useAdmissionPrediction()`.

### 3. Protected Routing (RBAC)
We utilize a wrapper component strategy for routing:
- `ProtectedRoute`: Ensures user is authenticated.
- `RoleRoute`: Extends protection to check for specific roles (e.g., `admin`).

## Theming
- **Mode**: Light and Dark mode supported via Tailwind's `class` strategy.
- **Persistence**: Theme preference stored in `localStorage`.
- **System Preference**: Defaults to system settings on first load.

## Performance Optimization
- **Code Splitting**: Routes are lazily loaded using `React.lazy()` and `Suspense`.
- **Image Optimization**: Use WebP formats and dynamic sizing where possible.
- **Caching**: React Query's `staleTime` and `cacheTime` tuned per resource.

## Security Best Practices
- **XSS Protection**: React's automatic escaping.
- **CSRF**: JWT tokens stored in `localStorage` or `HttpOnly` cookies (depending on backend).
- **Input Sanitization**: Client-side validation via Zod.
