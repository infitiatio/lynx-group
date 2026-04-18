---
name: csharp-coding
description: "Shared C#/.NET standards and implementation principles for .NET 10 work. Use when writing or reviewing ASP.NET Core, EF Core, and test-related code so all C# agents apply consistent conventions."
argument-hint: "Describe the C# coding concern, standard, or design tradeoff you want to apply."
user-invocable: false
---

# CSharp Coding Foundations

## Primary Goal

Provide a common baseline for C#/.NET quality so implementation and testing agents behave consistently.

## Default Technical Context

Assume this stack unless the user says otherwise:
- Backend: .NET 10, C#, ASP.NET Core REST APIs, EF Core, PostgreSQL
- Testing: xUnit + FakeItEasy (default), SpecFlow for behavior-centric scenarios
- Configuration: appsettings.json and ASP.NET configuration pipeline

Treat this as the default baseline, not a rigid rule.

## Engineering Principles

- Prefer clear, simple designs first (KISS).
- Keep code DRY, but do not force abstractions too early.
- Apply SOLID where it improves maintainability and testability.
- Choose pragmatic solutions: if a simpler naive approach is safer and easier to maintain for the current scope, prefer it and state why.
- Optimize for readability and explicit intent over cleverness.

## C# and .NET Coding Standards

Follow Microsoft-recommended C# coding conventions and idiomatic .NET patterns, including:
- Clear naming and consistent casing conventions.
- Nullable reference types awareness and null-safety.
- Proper async/await usage with `Async` suffix for asynchronous methods.
- Small, cohesive classes and methods with clear responsibilities.
- Guard clauses and validation at boundaries.
- Meaningful exception handling and clear error paths.

When deviating from a convention, briefly justify the reason in the response.

## Implementation Preferences

- Create interfaces for services and reusable class boundaries where abstraction is meaningful.
- Use records where applicable, especially for DTOs, request/response models, and configuration/value models.
- Keep domain and API contracts explicit and stable.
- Avoid speculative abstractions, unnecessary inheritance, and over-engineering.

## ASP.NET Core and EF Core Baselines

- Prefer standard REST conventions for routes, status codes, and resource modeling.
- Use built-in dependency injection and clear service lifetimes.
- Keep controllers/endpoints thin; place business logic in services.
- Apply request validation and return structured, consistent error responses.
- Use EF Core as the default persistence approach with explicit, readable modeling and queries.
- Avoid hidden data-access side effects and N+1 pitfalls.

## Interaction and Clarification Behavior

- Ask focused clarification questions whenever requirements are ambiguous or conflicting.
- Confirm scope for larger changes (feature, bugfix, refactor) before broad edits.
- Call out assumptions explicitly before implementing when facts are missing.
- Surface tradeoffs when multiple valid options exist.

## Constraints

- Do not introduce unnecessary complexity.
- Do not ignore existing project patterns without explanation.
- Do not present uncertain assumptions as facts.
