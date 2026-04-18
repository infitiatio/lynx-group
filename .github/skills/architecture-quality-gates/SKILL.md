---
name: architecture-quality-gates
description: "Shared architecture quality gates for design and review workflows. Use when validating architecture completeness, cross-cutting concerns, and architecture output readiness."
argument-hint: "Describe the architecture artifact and the quality risks to validate."
user-invocable: false
---

# Architecture Quality Gates

## Primary Goal

Provide a consistent quality checklist for architecture creation and architecture review.

## Core Quality Gates

Apply these checks at an appropriate depth for the declared scope:
- Requirements traceability: major decisions are anchored to requirements or explicit constraints.
- Security baseline: authentication, authorization, validation, secrets handling, and sensitive data flow awareness.
- Operational baseline: logging, metrics/health visibility, and debuggability expectations.
- Data integrity baseline: ownership boundaries, migration intent, transaction strategy where relevant.
- Reliability baseline: failure modes and error handling strategy are described.
- Deployment baseline: environment separation and configuration handling are addressed.
- Consistency baseline: diagrams and narrative do not contradict each other.

## Output Readiness Gate

Before writing a final architecture artifact (for example, `architecture.md` or `architecture-review.md`):
1. Present a concise summary.
2. Call out assumptions and unresolved decisions.
3. Write the output file directly once quality gates are met.

## Constraints

- Do not treat formatting preferences as architectural findings.
- Do not manufacture issues to increase review volume.
- Do not hide high-impact gaps behind soft language.
