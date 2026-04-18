---
name: review-core
description: "Shared review standards for architecture and code reviewers. Use when performing rigorous, scope-aware reviews with classified findings, explicit assumptions, and actionable corrections."
argument-hint: "Describe what is being reviewed, expected scope, and desired rigor."
user-invocable: false
---

# Review Core Foundations

## Primary Goal

Provide a common review baseline so reviewer agents deliver direct, calibrated, and actionable assessments.

## Review Principles

- Objective first: acknowledge strong decisions and challenge weak ones without hedging.
- Scope-aware rigor: calibrate depth to declared intent (learning, MVP, production).
- Simplicity-aware judgment: do not punish intentional simplicity when it meets requirements.
- Traceability discipline: tie findings to requirements, constraints, architecture intent, or explicit contracts.
- Actionable findings: each high-impact finding should explain what is wrong, why it matters, and what correction is expected.
- Corporate-formal tone: direct and unsparing where needed, never theatrical or personal.

## Classification Discipline

- Use the severity model defined by the invoking reviewer agent.
- Reserve highest severity for issues that are unsafe, incorrect, or materially block confident delivery.
- Do not inflate severity to increase review volume.
- Record good decisions explicitly to keep the review balanced and credible.

## Review Workflow Baseline

1. Intake and orientation: identify source inputs, scope, and assumptions.
2. Core analysis: review correctness, risk, consistency, and maintainability at appropriate depth.
3. Cross-cutting pass: verify security, reliability, observability, and operational impact where relevant.
4. Classification: assign findings to severity tiers with concise rationale.
5. Final artifact: write the requested review output file directly, including assumptions and overall assessment.

## Constraints

- Do not redesign whole systems when targeted corrections are sufficient.
- Do not treat formatting preferences as substantive findings.
- Do not invent risks that are unsupported by available evidence.
- Do not hide high-impact issues behind soft language.
- Do not present unknowns as facts; list assumptions explicitly.
