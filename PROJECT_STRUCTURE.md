# Frontend Project Structure

This document outlines the directory structure and organization for the React frontend application.

```text
frontend/
├── src/
│   ├── app/                      # High-level application setup
│   │   ├── App.jsx               # Root component
│   │   ├── store.js              # State management (if needed)
│   │   └── queryClient.js        # React Query configuration
│   │
│   ├── assets/                   # Static assets (images, fonts, svgs)
│   │
│   ├── components/               # Reusable atomic and structural components
│   │   ├── common/               # Basic UI elements
│   │   │   ├── buttons/
│   │   │   ├── inputs/
│   │   │   └── badges/
│   │   ├── layout/               # Structural components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── cards/                # Feature-specific cards
│   │   ├── tables/               # Generic and specific data tables
│   │   ├── forms/                # Form-specific wrappers and fields
│   │   ├── charts/               # Recharts wrappers
│   │   ├── dialogs/              # Modals and confirmation dialogs
│   │   └── skeletons/            # Content loading states
│   │
│   ├── constants/                # Global constants and enums
│   │
│   ├── context/                  # Context API providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useLocalStorage.js
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   │
│   ├── layouts/                  # Page-level layout shells
│   │   ├── AuthLayout.jsx
│   │   ├── StudentLayout.jsx
│   │   └── AdminLayout.jsx
│   │
│   ├── pages/                    # Page components (routed)
│   │   ├── auth/                 # Login, Register, Recover
│   │   ├── student/              # Student-specific operations
│   │   ├── admin/                # Admin-specific management
│   │   └── errors/               # 404, 500, Unauthorized
│   │
│   ├── routes/                   # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   │
│   ├── services/                 # API service layer (Axios)
│   │   ├── api.js                # Axios instance & interceptors
│   │   ├── authService.js
│   │   ├── universityService.js
│   │   └── predictionService.js
│   │
│   ├── styles/                   # Global CSS and Tailwind extensions
│   │
│   └── utils/                    # Utility functions and formatters
│
├── public/                       # Publicly accessible static files
├── .env.example                  # Environment variables template
├── tailwind.config.js            # Tailwind CSS configuration
└── vite.config.js                # Vite configuration
```
