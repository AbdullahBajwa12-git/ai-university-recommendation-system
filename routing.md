# Routing Documentation

The application uses `react-router-dom` v6 for client-side navigation.

## Route Philosophy
- **Dynamic Loading**: Routes are code-split using `React.lazy()` to optimize initial bundle size.
- **Role-Based Access Control (RBAC)**: Defined explicitly in the routing table.
- **Persistence**: Navigation state is preserved across reloads where appropriate.

## Route Structure

### Public Routes
- `/login`: User authentication entry point.
- `/register`: Account creation.
- `/forgot-password`: Recovery flow.

### Student Routes (Protected: `role === 'student'`)
- `/`: Dashboard overview.
- `/profile`: Personal and Account settings.
- `/profile/academic`: Detailed academic scores and history.
- `/preferences`: Study and country preference management.
- `/universities`: Search and discovery.
- `/universities/:id`: Detailed university view.
- `/recommendations`: AI-driven list of university programs.
- `/recommendations/:id`: Deep dive into specific suggestion + AI explanation.
- `/applications`: Application tracking and history.
- `/ai-chat`: Assistant interface.

### Admin Routes (Protected: `role === 'admin'`)
- `/admin`: Analytics and high-level stats.
- `/admin/users`: User management and logging.
- `/admin/universities`: Database management for schools.
- `/admin/programs`: Database management for programs.
- `/admin/fields`: Domain management.

## Access Wrappers
- **`<ProtectedRoute />`**: Redirects to `/login` if no session exists.
- **`<RoleRoute role="admin" />`**: Redirects student users to the student dashboard if they attempt to access admin pages.

## Navigation Logic
- **Redirects**: Unauthenticated attempts at protected paths are captured and redirected back after successful login.
- **Breadcrumbs**: Automatically generated from the URI stack.
