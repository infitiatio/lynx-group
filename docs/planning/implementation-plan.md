# Implementation Plan

> **Source documents:** [architecture.md](../architecture/architecture.md) (reviewed clean, no open v1 blockers) · [requirements.md](../product/requirements.md) · [.github/agents-guide.md](../../.github/agents-guide.md)
>
> **Coding standards:** [.github/skills/csharp-coding/SKILL.md](../../.github/skills/csharp-coding/SKILL.md) — applied by all C# agents.
> **Frontend coding standards:** [.github/skills/react-typescript-coding/SKILL.md](../../.github/skills/react-typescript-coding/SKILL.md) — applied by all React/TypeScript agents.
>
> **Agents:** [CSharp Developing Code](../../.github/agents/csharp-developing-code.agent.md) · [CSharp Testing (Unit)](../../.github/agents/csharp-testing-unit.agent.md) · [CSharp Testing (BDD)](../../.github/agents/csharp-testing-bdd.agent.md) · [React Developing Code](../../.github/agents/react-developing-code.agent.md) · [React Testing (Unit)](../../.github/agents/react-testing-unit.agent.md).

---

## Monorepo Structure

```
/
├── backend/
│   ├── LynxGroup.sln
│   ├── src/
│   │   ├── LynxGroup.Api/            # ASP.NET Core host, controllers, middleware, DI wiring
│   │   ├── LynxGroup.Application/    # Use-case services, interfaces, DTOs
│   │   ├── LynxGroup.Domain/         # Entities, value rules, domain policy
│   │   └── LynxGroup.Infrastructure/ # EF Core, Google OAuth, HTTP metadata client
│   └── tests/
│       ├── LynxGroup.UnitTests/      # xUnit + FakeItEasy
│       └── LynxGroup.BddTests/       # SpecFlow acceptance scenarios
└── frontend/                         # React + TypeScript SPA
```

Frontend implementation and unit testing are owned by the React agents listed above.

**Dependency direction:** `Api → Application → Domain`; `Infrastructure → Application`; tests reference implementation projects only.

---

## Phases Overview

| Phase | Scope | Detail Level |
|-------|-------|--------------|
| 0 | Monorepo scaffolding, solution, EF Core baseline | Task-level |
| 1 | Auth module: Google OAuth + JWT | Task-level |
| 2 | Group module: CRUD + ownership | Feature-level |
| 3 | Link module: add/list/delete + duplicate enforcement | Task-level |
| 4 | Metadata module: fetch + retry/timeout policy | Task-level |
| 5 | Publishing + unlisted sharing | Feature-level |
| 6 | Hardening: observability, integration tests, e2e checklist | Feature-level |

Tests are written **inline** with each phase (unit tests + BDD where noted).

---

## Phase 0 — Monorepo Scaffolding

**Responsible agent(s):** CSharp Developing Code · React Developing Code

### Tasks

- [x] Create `backend/` and `frontend/` folders
- [x] Scaffold `LynxGroup.sln` under `backend/`
- [x] Create four source projects under `backend/src/`:
  - `LynxGroup.Api` — `webapi` host
  - `LynxGroup.Application` — `classlib`
  - `LynxGroup.Domain` — `classlib`
  - `LynxGroup.Infrastructure` — `classlib`
- [x] Add `LynxGroup.Application` and `LynxGroup.Domain` project references to `LynxGroup.Infrastructure`
- [x] Add `LynxGroup.Application`, `LynxGroup.Domain`, `LynxGroup.Infrastructure` references to `LynxGroup.Api`
- [x] Create test projects under `backend/tests/`:
  - `LynxGroup.UnitTests` — `xunit`; add FakeItEasy NuGet package; reference `Application`, `Domain`, `Infrastructure`
  - `LynxGroup.BddTests` — `xunit`; add SpecFlow.xUnit and SpecFlow.Microsoft.DependencyInjection NuGet packages
- [x] Configure PostgreSQL connection string via `.NET User Secrets` on `LynxGroup.Api`
- [x] Add EF Core packages to `LynxGroup.Infrastructure`: `Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`
- [x] Add `Microsoft.EntityFrameworkCore.Tools` to `LynxGroup.Api`
- [x] Create `AppDbContext` in `LynxGroup.Infrastructure` with no entity sets yet (placeholder)
- [x] Add an initial empty migration; confirm `dotnet ef database update` succeeds

### Frontend Tasks (React + TypeScript baseline)

- [x] Define frontend feature layout under `frontend/src/`: `features/`, `shared/`, `routes/`
- [x] Add `react-router-dom` and configure initial route tree: `/login`, `/groups`, `/groups/:groupId`, `/shared/:shareToken`
- [x] Implement centralized typed API client wrapper in `frontend/src/shared/api/` (no raw `fetch` in components)
- [x] Add frontend environment contract documentation (`VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`) and load strategy
- [x] Add frontend unit-test stack: Vitest + React Testing Library + `@testing-library/user-event`
- [x] Add `npm run test` script and initial test setup file for deterministic component/hook tests

### Acceptance

- `dotnet build` succeeds across all projects
- `dotnet ef database update` applies initial migration without errors
- `dotnet test` runs (zero tests pass — expected at this stage)
- Frontend `npm run dev`, `npm run build`, `npm run lint`, and `npm run test` are wired and executable

---

## Phase 1 — Auth Module

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit) · CSharp Testing (BDD)

**Architecture reference:** section 4 (Auth Module), section 5 (Authorization Model), section 8 (Security and Access Control)

### Tasks

#### Infrastructure / Configuration
- [x] Add `Google.Apis.Auth` NuGet package to `LynxGroup.Infrastructure` *(pre-installed in Phase 0)*
- [x] Add `Microsoft.AspNetCore.Authentication.JwtBearer` NuGet package to `LynxGroup.Infrastructure` *(pre-installed in Phase 0)*
- [x] Configure Google OAuth client settings in `appsettings.json` + User Secrets (`Authentication:Google:ClientId`, `Authentication:Google:ClientSecret`) *(placeholder keys already scaffolded — confirm values via User Secrets before running)*
- [x] Configure JWT settings in `appsettings.json` + User Secrets (`Jwt:Issuer`, `Jwt:Audience`, `Jwt:SigningKey`) *(placeholder keys already scaffolded — confirm values via User Secrets before running)*

#### Domain
- [x] `User` entity: `Id (Guid)`, `GoogleSubject (string)`, `Email (string)`, `DisplayName (string)`, `CreatedAt`, `UpdatedAt`

#### Infrastructure
- [x] `UserConfiguration` — EF type configuration for `User`
- [x] Add `Users` DbSet to `AppDbContext`; add EF migration `AddUserTable`
- [x] `IGoogleTokenValidator` interface in `Application`; `GoogleTokenValidator` implementation in `Infrastructure` using `GoogleJsonWebSignature.ValidateAsync` — validates `credential` (idToken) from frontend; `ClientId` must match `Authentication:Google:ClientId` config value
- [x] `IJwtService` interface in `Application`; `JwtService` implementation in `Infrastructure` (issues HS256 signed JWT with `sub`, `email`, `name` claims; expiry from `Jwt:` config)
- [x] `IUserRepository` interface in `Application`; EF implementation in `Infrastructure` (upsert by `GoogleSubject`: find existing user and update email/name, or insert new)

#### Application
- [x] `AuthenticateUserCommand` record: `{ string IdToken }`; `AuthenticateUserResult` record: `{ string Token, Guid UserId, string Email, string DisplayName }`
- [x] `AuthenticateUserHandler`: validate Google token via `IGoogleTokenValidator` → upsert user via `IUserRepository` → issue JWT via `IJwtService` → return `AuthenticateUserResult`

#### API
- [x] `AuthController` with `POST /api/auth/google-callback` (accepts `{ idToken: string }`, returns `{ token: string, user: { id, email, displayName } }`); apply `[AllowAnonymous]`
- [x] Register JWT bearer middleware in `Program.cs`; apply `[Authorize]` globally via convention; exempt `/api/auth/google-callback`
- [x] Register all auth services in DI (`GoogleTokenValidator`, `JwtService`, `UserRepository`, `AuthenticateUserHandler`)

#### Tests
- [x] Unit: `JwtService` — valid claims round-trip, expiry set correctly
- [x] Unit: `AuthenticateUserHandler` — new user created, existing user email updated, invalid token rejected
- [x] BDD scenario: *"Unauthenticated request to any protected endpoint returns 401"*

#### Frontend
- [x] Install `@react-oauth/google` npm package; wrap app root in `GoogleOAuthProvider` using `VITE_GOOGLE_CLIENT_ID` env var
- [x] Implement `LoginRoutePage` with `GoogleLogin` component (credential/idToken popup flow — **not** `useGoogleLogin` which returns `access_token`); on success POST `credential` to `POST /api/auth/google-callback`, store returned JWT via `tokenStorage.setToken()`, navigate to `/groups`
- [x] Create `useAuth` hook (`frontend/src/shared/auth/useAuth.ts`): exposes `{ isAuthenticated, currentUser, login(idToken), logout() }`; restores session from `localStorage` on mount; clears token and navigates to `/login` on logout
- [x] Add `ProtectedRoute` wrapper component; apply to `/groups`, `/groups/:groupId`, `/shared/:shareToken` in `appRouter.tsx`
- [x] Handle auth error states on `LoginRoutePage`: backend 401/500 and invalid Google response show clear user-facing error with retry path; handle 401 responses in `httpClient` by clearing token and redirecting to `/login`

#### Frontend Unit Tests
- [x] `useAuth` hook: stores token on login, restores session from localStorage on mount, clears session on logout
- [x] `LoginRoutePage`: success path persists token and navigates to `/groups`
- [x] `LoginRoutePage`: failure path (backend error) shows user-facing error and keeps app in unauthenticated state

### Acceptance

- `dotnet build` succeeds across all projects
- `dotnet ef database update` applies `AddUserTable` migration without errors
- `POST /api/auth/google-callback` with a valid Google idToken returns `{ token, user }` (manual `.http` test)
- Any protected endpoint without a bearer token returns 401
- `dotnet test` — unit and BDD tests pass
- `npm run test` — `useAuth` and `LoginRoutePage` tests pass
- Manual: Google sign-in → JWT stored in localStorage → protected routes accessible → logout → redirect to `/login`

---

## Phase 2 — Group Module

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit)

**Architecture reference:** section 4 (Group Module), section 5 (Authorization Model)

### Tasks

#### Domain
- [ ] `Group` entity: `Id (Guid)`, `OwnerUserId (Guid)`, `Title (string)`, `Description (string)`, `IsPublished (bool)`, `ShareToken (string?)`, `CreatedAt`, `UpdatedAt`

#### Infrastructure
- [ ] `GroupConfiguration` — EF type configuration; index on `ShareToken`
- [ ] Add `Groups` DbSet to `AppDbContext`; add EF migration
- [ ] `IGroupRepository` interface in `Application`; EF implementation

#### Application
- [ ] `CreateGroupCommand` + handler: validate title + description required; return created `GroupDto`
- [ ] `GetGroupQuery` + handler: fetch by id; verify caller is owner (ownership returned in DTO)
- [ ] `GetMyGroupsQuery` + handler: return caller's groups
- [ ] `UpdateGroupCommand` + handler: owner-only; update title/description
- [ ] `GroupDto` record

#### API
- [ ] `IsGroupOwner` authorization policy handler: reads `groupId` from route; compares `owner_user_id` with `sub` claim; returns 403 on mismatch
- [ ] `GroupsController`:
  - `POST /api/groups` → 201
  - `GET /api/groups` → 200 (caller's groups)
  - `GET /api/groups/{groupId}` → 200 or 404
  - `PUT /api/groups/{groupId}` → 200 (owner only, `[Authorize(Policy = "IsGroupOwner")]`)
- [ ] Register group services in DI

#### Tests
- [ ] Unit: `CreateGroupCommand` — missing title returns validation error, missing description returns validation error, valid input returns created group
- [ ] Unit: `IsGroupOwner` policy — owner passes, non-owner returns 403, unauthenticated returns 401

#### Frontend
- [ ] Build `MyGroupsPage`: list caller groups from `GET /api/groups`, include loading/empty/error states
- [ ] Build create-group flow using `POST /api/groups` with required title/description validation
- [ ] Build `GroupDetailPage` using `GET /api/groups/{groupId}` and update flow with `PUT /api/groups/{groupId}`
- [ ] Enforce owner-only edit actions in UI while preserving read-only rendering for non-owners

#### Frontend Unit Tests
- [ ] `MyGroupsPage`: renders loading, empty, success, and API error states
- [ ] Group create/edit form: required field validation and submit behavior
- [ ] `GroupDetailPage`: owner sees edit controls; non-owner receives read-only UI state

---

## Phase 3 — Link Module

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit)

**Architecture reference:** section 4 (Link Module), section 7 (Data Architecture — canonicalization + duplicate rules)

### Tasks

#### Domain
- [ ] `Link` entity: `Id (Guid)`, `GroupId (Guid)`, `Url (string)`, `CanonicalUrl (string)`, `Title (string?)`, `ThumbnailUrl (string?)`, `MetadataStatus (string)`, `CreatedAt`, `UpdatedAt`
- [ ] `LinkTag` entity: `Id (Guid)`, `LinkId (Guid)`, `Tag (string)`
- [ ] `CanonicalUrlService` (pure domain service, no dependencies): apply v1 canonicalization rules:
  1. Preserve scheme (`http`/`https` distinct)
  2. Lowercase host
  3. Remove **only** a trailing slash from the path (no other path changes)
  4. Preserve query string, fragment, port, `www` prefix as-is

#### Infrastructure
- [ ] `LinkConfiguration`:
  - Unique index on `(GroupId, CanonicalUrl)` — source-of-truth duplicate guard
  - Relationship: `Group` has many `Links`, `Link` has many `LinkTags`
- [ ] `LinkTagConfiguration`: unique index on `(LinkId, Tag)` — unique per link, case-insensitive (store normalized lowercase)
- [ ] Add `Links`, `LinkTags` DbSets; add EF migration
- [ ] `ILinkRepository` interface in `Application`; EF implementation

#### Application
- [ ] `AddLinkCommand` record: `GroupId`, `Url`, `Tags`
- [ ] `AddLinkHandler`:
  1. Verify caller is group owner
  2. Canonicalize URL via `CanonicalUrlService`
  3. Call `IMetadataFetchService` (injected; implementation added in Phase 4)
  4. Insert `Link` + `LinkTags`
  5. Handle DB unique constraint violation → `DuplicateLinkException`
- [ ] `GetLinksQuery` + handler: return links with tags for a group (caller is authenticated)
- [ ] `RemoveLinkCommand` + handler: owner-only delete
- [ ] `LinkDto` and `LinkTagDto` records

#### API
- [ ] `LinksController`:
  - `POST /api/groups/{groupId}/links` → 201 or 409 (duplicate)
  - `GET /api/groups/{groupId}/links` → 200
  - `DELETE /api/groups/{groupId}/links/{linkId}` → 204 (owner only)
- [ ] Map `DuplicateLinkException` to 409 in exception middleware / problem details

#### Tests
- [ ] Unit: `CanonicalUrlService` — trailing slash removed, no trailing slash unchanged, uppercase host lowercased, scheme preserved (`http` ≠ `https`), query string preserved, fragment preserved, port preserved, `www` preserved
- [ ] Unit: `AddLinkHandler` — valid link inserted, duplicate URL returns `DuplicateLinkException`, duplicate tag (case-insensitive) normalized
- [ ] Unit: metadata fetch failure does not block link creation (MetadataStatus = "unavailable")

#### Frontend
- [ ] Build add-link form for `POST /api/groups/{groupId}/links` with URL + tag entry and client-side URL validation
- [ ] Handle duplicate conflict (`409`) with clear "already exists" feedback
- [ ] Build link list for `GET /api/groups/{groupId}/links` with title, thumbnail/placeholder, tags, metadata status badge
- [ ] Build owner-only delete action using `DELETE /api/groups/{groupId}/links/{linkId}`

#### Frontend Unit Tests
- [ ] Link form validation: invalid URL rejected, valid payload submitted
- [ ] Duplicate link conflict path: `409` renders conflict message and keeps form editable
- [ ] Link list rendering: metadata status values (`ok`, `unavailable`) map to expected UI indicators

#### Phase Dependency Note
- [ ] Frontend Link UI must consume final metadata behavior from Phase 4 (`MetadataStatus`, title/thumbnail fallbacks) before phase acceptance is complete

---

## Phase 4 — Metadata Module

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit)

**Architecture reference:** section 4 (Metadata Module), section 5 (Reliability Strategy), section 12 (Risks — metadata fetch)

### Tasks

#### Application
- [ ] `IMetadataFetchService` interface:
  ```csharp
  Task<MetadataResult> FetchAsync(string url, CancellationToken ct);
  ```
- [ ] `MetadataResult` record: `string? Title`, `string? ThumbnailUrl`, `string Status` (`"ok"` | `"unavailable"`)

#### Infrastructure
- [ ] `MetadataFetchService` implementation:
  - Named `HttpClient` registered with **4-second timeout** per attempt
  - **Polly** retry policy: 1 retry on transient HTTP/network errors; 250 ms base; exponential backoff; total request budget capped at **8 seconds**
  - Extraction logic:
    - Title: `og:title` meta tag → `<title>` tag → `null`
    - Thumbnail: `og:image` meta tag → `{scheme}://{host}/favicon.ico` → `null`
  - On any failure/timeout: return `MetadataResult { Status = "unavailable", Title = null, ThumbnailUrl = null }`
- [ ] Register `MetadataFetchService` in DI with named `HttpClient` and Polly policy (`Microsoft.Extensions.Http.Polly`)

#### Integration with Phase 3
- [ ] `AddLinkHandler` already injects `IMetadataFetchService`; this phase provides the real implementation
- [ ] Confirm link creation succeeds when metadata returns `"unavailable"`

#### Tests
- [ ] Unit: success path — HTML with `og:title` and `og:image` returns extracted values
- [ ] Unit: fallback to `<title>` when `og:title` absent
- [ ] Unit: fallback to favicon URL when `og:image` absent
- [ ] Unit: 4-second timeout causes fallback (mock `HttpMessageHandler`)
- [ ] Unit: network error causes single retry then fallback
- [ ] Unit: both retries fail → `MetadataStatus = "unavailable"`, link still creatable

#### Frontend Dependency Validation
- [ ] Confirm frontend Link list correctly shows fallback rendering when backend returns `MetadataStatus = "unavailable"`

---

## Phase 5 — Publishing and Sharing

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit) · CSharp Testing (BDD)

**Architecture reference:** section 4 (Group Module — share token), section 5 (API shape — `/api/shared/{shareToken}`), section 8 (Share token strategy)

### Tasks

#### Domain
- [ ] `ShareToken` value: 64-character URL-safe string; generated via `System.Security.Cryptography.RandomNumberGenerator`

#### Application
- [ ] `PublishGroupCommand` + handler: owner-only; generate share token if not already set; set `IsPublished = true`; persist; return share URL token
- [ ] `GetSharedGroupQuery` + handler: look up group by `shareToken`; require `IsPublished = true`; caller is authenticated (no owner check); return read-only `SharedGroupDto` with links

#### API
- [ ] `POST /api/groups/{groupId}/publish` → 200 with `{ shareToken, shareUrl }` (owner only)
- [ ] `GET /api/shared/{shareToken}` → 200 read-only or 404 (any authenticated user)
- [ ] Confirm no `GET /api/groups` or similar endpoint exposes all groups or published listing to arbitrary callers

#### Tests
- [ ] Unit: `PublishGroupCommand` — token is 64-char URL-safe, idempotent (re-publish does not rotate token in v1), non-owner rejected (403)
- [ ] Unit: `GetSharedGroupQuery` — valid token for published group returns data, unpublished group returns 404, unknown token returns 404
- [ ] BDD scenario: *"An authenticated viewer with a valid share URL can view the group and its links"*
- [ ] BDD scenario: *"An unauthenticated user accessing a shared URL is redirected to login"*

#### Frontend
- [ ] Add owner-only publish action to group detail page using `POST /api/groups/{groupId}/publish`
- [ ] Display returned share URL with copy-to-clipboard UX and success/failure feedback
- [ ] Build shared view page for `GET /api/shared/{shareToken}` with read-only group + links rendering
- [ ] Ensure unauthenticated access to shared route redirects to login

#### Frontend Unit Tests
- [ ] Publish action: successful response exposes copyable share URL
- [ ] Shared page: renders read-only data for authenticated viewer with valid token
- [ ] Shared page: invalid token and unauthenticated paths show correct error/redirect handling

---

## Phase 6 — Hardening and Observability

**Responsible agent(s):** CSharp Developing Code · CSharp Testing (Unit) · CSharp Testing (BDD) · React Developing Code · React Testing (Unit)

**Architecture reference:** section 9 (Observability), section 12 (Risks — auth bugs, URL canonicalization, share token leakage)

### Tasks

#### Structured Logging
- [ ] Correlation ID middleware: generate `X-Correlation-Id` per request; include in response header
- [ ] Log fields on every request: `correlation_id`, `user_id_hash` (SHA-256 of user id — never log raw user id), `group_id` (when route contains it), `route`, `status_code`, `error_code`, `duration_ms`
- [ ] Confirm `ShareToken` is never logged

#### Health Checks
- [ ] Add `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore`
- [ ] Expose `GET /health` (API liveness) and `GET /health/db` (PostgreSQL connectivity)

#### Basic Metrics
- [ ] Request count and latency per route (use `.NET` built-in metrics or `OpenTelemetry.Instrumentation.AspNetCore`)
- [ ] Metadata fetch success/failure counter

#### Integration Tests
- [ ] Unauthenticated request to any protected endpoint → 401
- [ ] Authenticated non-owner `PUT /api/groups/{groupId}` → 403
- [ ] Authenticated non-owner `POST /api/groups/{groupId}/links` → 403
- [ ] Duplicate link submission → 409 with problem details body
- [ ] Metadata timeout → link POST returns 201 with `metadataStatus = "unavailable"`

#### BDD Scenarios
- [ ] *"A creator who adds a duplicate link within a group receives a clear duplicate error"*
- [ ] *"Creator-only endpoints reject authenticated non-owner callers"*

#### Manual End-to-End Checklist (localhost)
- [ ] Full add-link flow: authenticate → create group → add link → verify title/thumbnail shown
- [ ] Share URL flow: publish group → share URL with second Google account → verify read-only view
- [ ] Metadata failure: add a link to a non-accessible URL → verify link saved with "unavailable" status
- [ ] Duplicate link: add same URL twice → verify second attempt returns 409 with clear message

#### Frontend Unit Hardening
- [ ] Add deterministic unit tests for critical pages/components: auth flow, group create/edit, link create/list, shared view
- [ ] Ensure tests use user-centric queries (`getByRole`, `getByLabelText`, `findBy*`) and `user-event`
- [ ] Cover frontend failure paths for 401, 403, 404, 409, and generic API/network errors
- [ ] Verify loading, empty, success, and error states for each dynamic page

#### Frontend Scope Guard
- [ ] Frontend automated testing in this plan is unit-level only; E2E automation is intentionally deferred

---

## Cross-Cutting Conventions (all phases)

These apply to every task in every phase, enforced by the `csharp-coding` skill:

- Controllers are thin: request validation and response shaping only; no domain logic
- Use records for DTOs, commands, queries, and value models
- Use `async`/`await` throughout with `Async` suffix on async method names
- Nullable reference types enabled across all projects
- Secrets: never hard-coded; always via User Secrets (local) or environment variables
- Error responses: structured `ProblemDetails` (RFC 7807) format for all API errors
- Migrations: one migration per schema change, descriptive name, no data-destructive changes without explicit justification

Frontend conventions (enforced by `react-typescript-coding`):

- Functional components and hooks only (no class components)
- Page components remain thin; non-trivial stateful logic moves to custom hooks
- Typed API integration through centralized client wrapper; no scattered raw `fetch` calls
- JWT token stored in `localStorage` in v1 and attached as bearer token for authenticated API calls
- Dynamic views must implement loading, empty, success, and error states
- Frontend test scope is unit testing with Vitest + React Testing Library; no E2E automation in current plan scope

---

## Dependency and NuGet Reference

| Project | Key packages |
|---------|-------------|
| `LynxGroup.Infrastructure` | `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`, `Google.Apis.Auth`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Polly`, `Microsoft.Extensions.Http.Polly` |
| `LynxGroup.Api` | `Microsoft.EntityFrameworkCore.Tools`, `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` |
| `LynxGroup.UnitTests` | `xunit`, `xunit.runner.visualstudio`, `FakeItEasy`, `Microsoft.NET.Test.Sdk` |
| `LynxGroup.BddTests` | `SpecFlow.xUnit`, `SpecFlow.Microsoft.DependencyInjection`, `Microsoft.NET.Test.Sdk` |
