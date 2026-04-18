---
name: react-typescript-coding
description: "Shared React/TypeScript standards and implementation principles for frontend work. Use when writing or reviewing React 19, TypeScript 6, and Vite 8 code so all frontend agents apply consistent conventions."
argument-hint: "Describe the React/TypeScript coding concern, standard, or design tradeoff you want to apply."
user-invocable: false
---

# React TypeScript Coding Foundations

## Primary Goal

Provide a common baseline for React/TypeScript quality so frontend implementation and testing agents behave consistently.

## Default Technical Context

Assume this stack unless the user says otherwise:
- Frontend: React 19, TypeScript 6 (strict mode), Vite 8
- Components: Functional components with hooks; no class components
- State management: Local `useState`/`useReducer` for component state; React context for shared state; no Redux or Zustand unless explicitly added
- Routing: React Router for page navigation
- Styling: Tailwind CSS (utility-first) when installed; plain CSS otherwise
- Testing: Vitest + React Testing Library (default); Playwright for E2E when applicable
- Linting: ESLint with TypeScript and React Hooks plugins

Treat this as the default baseline, not a rigid rule.

## Engineering Principles

- Prefer clear, simple designs first (KISS).
- Keep code DRY, but do not force abstractions too early.
- Apply SOLID where it improves maintainability and testability.
- Choose pragmatic solutions: if a simpler naive approach is safer and easier to maintain for the current scope, prefer it and state why.
- Optimize for readability and explicit intent over cleverness.

## TypeScript Standards

- Enable strict mode across all frontend code.
- No `any` type unless explicitly justified with a comment explaining why.
- Use explicit interface or type definitions for component props; avoid inline anonymous prop types.
- Prefer discriminated unions for state and API response variants.
- Use `unknown` over `any` for values of truly unknown shape; narrow with type guards.
- Apply `Async` naming discipline where relevant (e.g., async utility functions).

## Component Standards

- Functional components only; no class components.
- One component per file; file name matches component name (`GroupCard.tsx` exports `GroupCard`).
- Keep components small and focused on a single responsibility.
- Thin page components: routing, layout, and data-fetching orchestration only; move logic to custom hooks.
- Avoid prop drilling beyond two levels; introduce context or restructure.
- Every component that accepts user input or renders dynamic content should handle loading, error, and empty states explicitly.

## Hook Standards

- Prefix custom hooks with `use` (e.g., `useGroups`, `useAuth`).
- Keep hooks focused on a single concern.
- Extract repeated stateful logic into custom hooks rather than duplicating across components.
- Do not call hooks conditionally or inside loops.

## API Integration

- Use a centralized typed fetch wrapper; no raw `fetch` calls scattered across components.
- JWT token stored in `localStorage` per architecture decision; injected as `Authorization: Bearer <token>` on every authenticated request.
- All API response types defined as TypeScript interfaces or types.
- Handle API errors consistently: network errors, 4xx, 5xx should surface clear feedback.
- Never swallow errors silently; log or display them.

## Accessibility Baseline

- Use semantic HTML elements (`button`, `nav`, `main`, `section`, `h1`–`h6`) over generic `div`/`span`.
- Add `aria-*` attributes where semantic HTML alone is insufficient.
- Ensure interactive elements are keyboard-navigable.
- Form inputs must have associated labels.

## File Organization

Prefer feature-based co-location:

```
frontend/src/
├── features/
│   ├── auth/           # Login, callback, auth context/hook
│   ├── groups/         # My Groups, Group detail/edit
│   ├── links/          # Add link, link list
│   └── shared-view/    # Public shared group view
├── shared/
│   ├── api/            # Fetch wrapper, typed endpoints
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Shared hooks
│   └── types/          # Shared TypeScript types
├── routes/             # Route definitions
├── App.tsx
└── main.tsx
```

- Co-locate component, hook, types, and test files within each feature.
- Use barrel exports (`index.ts`) only where they genuinely reduce import noise; do not create barrels for every folder.
- Keep test files next to source: `ComponentName.test.tsx` beside `ComponentName.tsx`.

## Testing Awareness

- Design components for testability: accept dependencies via props or context, not global singletons.
- Avoid tightly coupling to browser APIs; wrap in hooks that can be mocked.
- Keep side effects in hooks, not in render logic, so components can be tested in isolation.

## Interaction and Clarification Behavior

- Ask focused clarification questions whenever requirements are ambiguous or conflicting.
- Confirm scope for larger changes (new page, shared component, routing change) before broad edits.
- Call out assumptions explicitly before implementing when facts are missing.
- Surface tradeoffs when multiple valid options exist.

## Constraints

- Do not introduce unnecessary complexity or speculative abstractions.
- Do not ignore existing project patterns without explanation.
- Do not present uncertain assumptions as facts.
- Do not install packages without confirming with the user first.
