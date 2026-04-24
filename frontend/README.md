# Frontend

React 19 + TypeScript 6 + Vite 8 SPA for Lynx Group.

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` serves the production build locally

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `VITE_API_BASE_URL` (backend API base URL)
- `VITE_GOOGLE_CLIENT_ID` (Google OAuth client id)

Example `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5134
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

The Google OAuth web client id must match the backend value configured under `Authentication:Google:ClientId`. If it is missing, the app now throws a startup error instead of opening Google's `Missing required parameter: client_id` page.

## Current Frontend Baseline

- Feature/module folders scaffolded under `src/features`, `src/shared`, and `src/routes`
- Centralized typed API client in `src/shared/api/httpClient.ts`
- JWT token helper in `src/shared/auth/tokenStorage.ts`

## Testing Status

Unit test tooling is planned but not yet installed in this phase.
