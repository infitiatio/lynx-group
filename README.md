# lynx-group
A simple web app for sharing links organized in groups. The app consists of a backend service providing an API, a frontend web app, and a PostgreSQL database.

## Current status

This repository is in active phased implementation.

- Core monorepo scaffolding is in place for backend and frontend.
- Architecture, requirements, and phased delivery are documented.
- Some routes and backend modules are placeholders while implementation continues.

## Repository structure

- `backend/`: .NET 10 solution and projects (`Api`, `Application`, `Domain`, `Infrastructure`, tests)
- `frontend/`: React 19 + TypeScript 6 + Vite 8 SPA
- `docs/`: requirements, architecture, reviews, and implementation plan

## Local auth setup

Google sign-in requires matching frontend and backend configuration before either app is started.

1. Create `frontend/.env.local` from `frontend/.env.example` and set:
	- `VITE_API_BASE_URL=http://localhost:5134`
	- `VITE_GOOGLE_CLIENT_ID=<your-google-oauth-web-client-id>.apps.googleusercontent.com`
2. Configure backend user secrets for the API project:
	- `dotnet user-secrets --project backend/src/LynxGroup.Api/LynxGroup.Api.csproj set "Authentication:Google:ClientId" "<your-google-oauth-web-client-id>.apps.googleusercontent.com"`
	- `dotnet user-secrets --project backend/src/LynxGroup.Api/LynxGroup.Api.csproj set "Jwt:SigningKey" "<a-long-random-secret-at-least-32-characters>"`
3. In Google Cloud Console, open the same OAuth web client and add `http://localhost:5173` under Authorized JavaScript origins.
4. Use the same Google OAuth web client id in both places.

The API now allows `http://localhost:5173` by default in development. If you run the frontend from a different origin, add that origin under `Cors:AllowedOrigins` for the API as well.

If `VITE_GOOGLE_CLIENT_ID` is missing, the frontend now fails immediately with a setup error instead of redirecting to Google's `Missing required parameter: client_id` page.

## Run locally

1. Backend API
	- `dotnet restore backend/LynxGroup.slnx`
	- `dotnet build backend/src/LynxGroup.Api/LynxGroup.Api.csproj`
	- `dotnet run --project backend/src/LynxGroup.Api/LynxGroup.Api.csproj`
2. Frontend SPA
	- `cd frontend`
	- `npm install`
	- `npm run dev`
3. Optional backend watch mode
	- `dotnet watch run --project backend/src/LynxGroup.Api/LynxGroup.Api.csproj`

## Project docs

- Product requirements: [docs/product/requirements.md](docs/product/requirements.md)
- Architecture: [docs/architecture/architecture.md](docs/architecture/architecture.md)
- Architecture reviews: [docs/architecture/reviews/](docs/architecture/reviews/)
- Implementation plan: [docs/planning/implementation-plan.md](docs/planning/implementation-plan.md)
