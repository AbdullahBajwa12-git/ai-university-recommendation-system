# API Integration Documentation

## Axios Infrastructure
The frontend communicates with the FastAPI backend via a centralized Axios instance located in `src/services/apiClient.js`.

### Configuration
```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Authentication Interceptors
1. **Request Interceptor**:
   - Injects the `Authorization: Bearer <token>` header if a JWT exists in storage.
2. **Response Interceptor**:
   - Catches `401 Unauthorized` errors.
   - Attempts a `POST /auth/refresh` with the stored refresh token.
   - If successful, retries the original failed request.
   - If unsuccessful, logs the user out and clears local memory.

## React Query Integration
For server-state management, we use `@tanstack/react-query`.

### Key Features
- **Caching**: 5-minute stale-time for static data (like countries/fields).
- **Optimistic Updates**: Used for "Save University" and "Application Submission" to provide instant UI feedback.
- **Auto-Refetching**: Enabled for high-priority data like application status updates.

### Hook Pattern
Each service has a corresponding React Query hook in `src/hooks/`.
Example:
- `useUniversities()` calls `universityService.fetchList()`.

## Error Handling
Global error handling is implemented via the Axios interceptor and localized in individual components using React Query's `error` state.
- **Toasts**: Used for transient errors (Network failure, 4xx).
- **Fallbacks**: Used for persistent failures in critical UI sections.
