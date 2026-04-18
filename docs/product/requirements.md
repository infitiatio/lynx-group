# Requirements

## Project Overview

A portfolio/learning web application for organizing and sharing topic-based link collections with friend groups or internal teams.

## Problem Statement

Shared links in chats, notes, and ad hoc documents become hard to find and poorly organized over time. The project addresses this by enabling tidy, topic-oriented link grouping and controlled sharing.

## Goals and Success Criteria

- Provide clear, tidy organization of shared links by topic.
- Enable simple sharing of curated link groups through unlisted URLs.
- Restrict access to authenticated Google users.
- Keep v1 intentionally small and usable on localhost.

Success criteria for v1:
- A creator can create and publish a links group with title and description.
- A creator can add links with metadata and automatic thumbnail/preview.
- Viewers with a shared link and Google authentication can view the group.
- Duplicate links are prevented within a group (with v1 normalization rule).

## Target Users

- Friend groups
- Small internal teams

## Core User Journeys

- Creator authenticates via Google.
- Creator creates a links group with a title and description.
- Creator adds links to the group.
- System fetches link title from the target page.
- System assigns thumbnail/logo preview automatically from the URL/page.
- Creator publishes and shares the unlisted group URL.
- Authenticated Google users with the URL view the group.

## Functional Requirements

- Authentication:
  - Users must authenticate with Google before any app interaction.
  - Group creation and editing are permitted only for authenticated users.
- Group management:
  - Authenticated creator can create a links group.
  - Group must include a title and description.
  - Only the group creator can edit the group and its links.
- Link management:
  - Creator can add links to a group.
  - For each link, the system stores URL and tags.
  - The system fetches the link title from the page (manual override is not in v1).
  - The system auto-assigns thumbnail/logo preview based on URL/page metadata.
- Duplicate rules:
  - Links must be unique within a single group.
  - v1 duplicate comparison checks URL equality with trailing-slash handling.
- Sharing and access:
  - Groups are unlisted and accessible by shared URL.
  - Any Google-authenticated user with the URL can view the group.
  - Shared users in v1 are view-only.

## Out of Scope

- Azure/cloud deployment and internet-hosted production release
- Comments
- Voting or likes
- Full-text search
- Notifications
- Native mobile app
- Non-owner editing/collaboration

## Constraints and Assumptions

- v1 deployment target is localhost only.
- This project is for portfolio/learning purposes.
- Preferred technical context (to be used unless changed later): .NET 10, C#, EF Core, PostgreSQL, React, TypeScript.
- Group discovery is via direct unlisted URL sharing, not public listing.

## Non-Functional Considerations

- Access control:
  - Enforce Google-authenticated access for all features.
  - Enforce creator-only edit permissions.
- Usability:
  - Keep flows simple and low-friction for quick link collection and sharing.
- Reliability:
  - Handle metadata/thumbnail fetch failures gracefully so link entry still succeeds.
- Security and privacy:
  - Do not expose private groups through indexing or public discovery in v1.

## Open Questions

- No open questions identified for v1 scope at this stage.
