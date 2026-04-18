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
