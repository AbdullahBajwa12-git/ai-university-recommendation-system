# API Documentation (Frontend Contract)

This document defines the expected API endpoints from the FastAPI backend. All frontend services must adhere to this contract.

## Base URL
`VITE_API_URL` (e.g., `http://localhost:8000/api/v1`)

---

## 1. Authentication
Endpoints for user identity management.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create a new student/admin account | No |
| POST | `/auth/login` | Obtain access and refresh tokens | No |
| POST | `/auth/refresh` | Obtain a new access token using refresh token | No |
| POST | `/auth/logout` | Invalidate current session | Yes |
| GET | `/auth/me` | Retrieve current user profile | Yes |

---

## 2. Student Profile & Preferences
Managing student-specific data.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/student/profile` | Get student profile details | Yes |
| PUT | `/student/profile` | Update academic info (CGPA, etc.) | Yes |
| GET | `/student/preferences` | Get current study preferences | Yes |
| PUT | `/student/preferences` | Update preferred countries/fields | Yes |
| GET | `/student/activities` | List extracurricular activities | Yes |
| POST | `/student/activities` | Add a new activity | Yes |

---

## 3. Universities & Programs
Discovery and details.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/universities` | List universities (w/ search & filters) | Yes |
| GET | `/universities/{id}` | Get detailed university information | Yes |
| GET | `/universities/{id}/programs` | List programs offered by university | Yes |
| POST | `/universities/{id}/save` | Bookmark a university | Yes |
| DELETE | `/universities/{id}/save` | Remove from bookmarks | Yes |
| GET | `/fields` | List available fields of study | Yes |
| GET | `/countries` | List available countries | Yes |

---

## 4. AI & Predictions
Core intelligent features.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/predictions/admission` | Generate admission probability | Yes |
| GET | `/predictions/history` | List previous predictions | Yes |
| GET | `/recommendations` | Get personalized uni recommendations | Yes |
| GET | `/recommendations/{id}/explanation` | Get AI explanation for recommendation | Yes |
| POST | `/ai/chat` | Send message to AI assistant | Yes |
| POST | `/ai/analyze-resume` | Upload and analyze PDF resume | Yes |
| POST | `/ai/analyze-sop` | Upload and analyze SOP text/file | Yes |

---

## 5. Applications & Tracking
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/applications` | List student applications | Yes |
| POST | `/applications` | Submit a new application | Yes |
| GET | `/applications/{id}` | Get application status and notes | Yes |

---

## 6. Admin Management
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/stats` | System-wide statistics for dashboard | Admin |
| GET | `/admin/users` | List and manage all users | Admin |
| POST | `/admin/universities` | Create new university record | Admin |
| PUT | `/admin/universities/{id}` | Update university record | Admin |
| DELETE | `/admin/universities/{id}` | Delete university record | Admin |

---

## Error Responses
The backend should return errors in the following format:
```json
{
  "status": "error",
  "code": 400,
  "message": "Friendly error message",
  "detail": { ... validation details ... }
}
```
