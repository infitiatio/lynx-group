# GitHub Copilot Repository Instructions

These instructions apply to all Copilot chat prompts and coding agents in this repository.

## Source of Truth and Scope

- Use [docs/product/requirements.md](../docs/product/requirements.md), [docs/architecture/architecture.md](../docs/architecture/architecture.md), and [docs/planning/implementation-plan.md](../docs/planning/implementation-plan.md) as primary sources of truth.
- Treat [docs/planning/implementation-plan.md](../docs/planning/implementation-plan.md) as the execution tracker for phased delivery.
- If documents conflict, apply precedence: requirements -> architecture -> implementation plan, and call out any unresolved conflict explicitly.
- Preserve architecture boundaries:
  - Backend dependency direction: `Api -> Application -> Domain`; `Infrastructure -> Application`
  - Frontend uses centralized typed API client and avoids scattered raw `fetch` calls.

## Agent and Skill Alignment

- Route work to repository agents defined under `.github/agents/` when task-specific behavior is needed.
- Follow shared skill baselines:
  - C#: `.github/skills/csharp-coding/SKILL.md`
  - React/TypeScript: `.github/skills/react-typescript-coding/SKILL.md`
  - Reviews: `.github/skills/review-core/SKILL.md`
- For C# implementation/review tasks, apply `.github/skills/csharp-coding/SKILL.md` as mandatory baseline behavior.
- For React/TypeScript implementation/review tasks, apply `.github/skills/react-typescript-coding/SKILL.md` as mandatory baseline behavior.

## Clarification and Uncertainty Handling

- Ask focused clarifying questions when requirements are ambiguous, conflicting, or underspecified.
- Ask questions when there is uncertainty, confusion, or logical collisions with prior session context or current project state.
- State assumptions explicitly before implementing if a decision cannot be inferred from source documents.
- Do not proceed with speculative implementation when a small clarification would materially reduce rework risk.

## Search and Workspace Navigation

- `rg` is available on this Windows 11 device and should be preferred for fast text and file discovery when suitable.
- Prefer reading existing code and docs before introducing new patterns.

## Progress Tracking and Plan Hygiene

- Keep track of progress against [docs/planning/implementation-plan.md](../docs/planning/implementation-plan.md).
- When completing scoped work that maps to existing plan tasks, update the relevant checklist items in the implementation plan in the same change.
- If scope changes, add a brief note in the plan to keep sequence and ownership explicit.
- If a requested change is intentionally outside current phase scope, call it out explicitly before implementation.

## Change Quality Baseline

- Keep changes minimal, scoped, and consistent with existing style.
- Do not invent APIs, endpoints, entities, or flows that conflict with requirements/architecture.
- Keep controllers/pages thin and place core logic in services/hooks as defined by project conventions.
- For frontend TypeScript changes, preserve strict typing and avoid `any` unless explicitly justified in code comments.
- Add or update focused tests for behavior changes whenever practical.
- Preserve backward compatibility for existing contracts unless a breaking change is explicitly requested and documented.

## Validation and Safety

- Run relevant build/test commands after non-trivial changes when possible.
- Do not hard-code secrets; use user secrets or environment variables.
- Preserve structured error handling and status code semantics already defined by the architecture.
- If validation cannot be executed locally, explicitly state what was not run and why.
