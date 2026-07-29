---
name: agency-platform
description: Governs architectural design and decision making regarding what goes into agency-platform-core versus client-specific repositories.
---

# Agency Platform

## Rules

- Decide whether a feature belongs in `agency-platform-core` or only in the client project.
- Never hardcode client branding into reusable code.
- Prefer configuration over duplication.
- Protect the client's budget by avoiding unnecessary complexity.
- Build reusable systems that can serve future clients.
