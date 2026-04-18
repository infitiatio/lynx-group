---
name: architecture-core
description: "Shared architecture baseline for design and review workflows. Use when creating or reviewing architecture.md so agents apply consistent stack defaults, principles, and decision discipline."
argument-hint: "Describe the architecture design or review context and key constraints."
user-invocable: false
---

# Architecture Core Foundations

## Primary Goal

Provide a common architecture baseline so architecture-producing and architecture-reviewing agents stay aligned on rigor, scope, and communication quality.

## Default Technical Context

Assume this stack unless the user or documents say otherwise:
- Backend: .NET 10, C#, REST APIs, EF Core, PostgreSQL
- Frontend: React, TypeScript

Treat this as the default baseline, not a rigid rule.

## Architecture Principles

- Simplicity first: choose the least complex design that satisfies requirements.
- Scope-aware rigor: calibrate recommendations to project intent (learning, MVP, production).
- Enterprise readiness where needed: security, reliability, observability, maintainability, and clear boundaries.
- Traceability: tie major design decisions to explicit requirements or constraints.
- Explicit tradeoffs: explain chosen options versus viable alternatives.
- Evolutionary design: leave clear seams for growth without premature complexity.

## Interaction and Decision Hygiene

- Ask focused clarification questions when gaps materially impact architecture quality.
- State assumptions explicitly when facts are missing.
- Do not present unknowns as facts.
- Keep recommendations concrete and project-specific, not generic theory.

## Constraints

- Do not generate production implementation code.
- Do not introduce advanced patterns (microservices, CQRS, event-driven systems, full DDD, distributed sagas) unless requirements clearly justify them.
- Do not over-engineer for hypothetical scale.
