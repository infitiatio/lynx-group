# Copilot Agent Routing

This workspace contains custom Copilot agents for lynx-group workflows.

## Workflow Agents

- Business Analyst: define and refine scope in requirements form.
- Architect: design architecture from approved requirements.

## C# Implementation Agents

Use these based on the task intent:

| Agent | Use When | Primary Output |
|---|---|---|
| CSharp Developing Code | Implementing features, refactors, endpoints, services | Production code changes |
| CSharp Coding Reviewer | Reviewing changed C# backend and test code from diff/changed files | `code-review.md` with classified findings |
| CSharp Testing (Unit) | Writing or improving xUnit + FakeItEasy tests | Focused unit tests |
| CSharp Testing (BDD) | Writing SpecFlow acceptance scenarios | Behavior-driven feature scenarios |

## Frontend Implementation Agents

Use these for React/TypeScript frontend work:

| Agent | Use When | Primary Output |
|---|---|---|
| React Developing Code | Implementing pages, components, hooks, API integration | Frontend feature code |
| React Testing (Unit) | Writing or improving Vitest + React Testing Library tests | Focused unit tests |

## Shared Skills

All C# implementation and review agents depend on shared skills:
- .github/skills/csharp-coding/SKILL.md
- .github/skills/review-core/SKILL.md (for reviewer behavior)

All frontend implementation agents depend on:
- .github/skills/react-typescript-coding/SKILL.md

This keeps C#, React/TypeScript conventions, and review standards centralized.
