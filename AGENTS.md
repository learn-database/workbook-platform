# Agent Instructions

This is a public repository. Treat every committed file as visible to students, the public internet, and future contributors.

## Public Repository Safety

Never commit sensitive information, including:

- API keys, database URLs with credentials, access tokens, OAuth secrets, LTI client secrets, private keys, certificates, passwords, or session cookies
- `.env` files or machine-specific configuration files
- real Canvas platform registrations that expose secrets or private deployment values
- real student names, emails, IDs, grades, submissions, accommodations, analytics exports, or grade passback logs
- production database dumps, logs with request headers, LTI launch JWTs, Canvas access tokens, or SQL execution service credentials
- cloud provider credentials, deployment tokens, SSH keys, or vendor account details

Use placeholders and templates instead:

```text
DATABASE_URL=postgresql://user:password@localhost:5432/learn_database
CANVAS_ISSUER=https://canvas.instructure.com
LTI_CLIENT_ID=<replace-with-client-id>
LTI_PRIVATE_KEY=<store-outside-repo>
OPENAI_API_KEY=<set-in-runtime-environment>
```

If a task requires real credentials, student data, LMS launch payloads, or production logs, keep that material outside this repository and document only the public-safe setup steps.

## Before Committing

Before staging or committing, inspect the diff for secrets and private data:

```text
git status --short
git diff
git diff --cached
```

If sensitive content appears in the diff, stop and remove it before committing. Do not assume that `.gitignore` is enough; inspect the actual staged changes.

## Platform Implementation Rules

- Keep secrets in runtime environment variables or a managed secret store, never in source files.
- Commit `.env.example` files only when every value is a placeholder.
- Do not commit database dumps, local SQLite files, generated grade exports, or Canvas launch/debug payloads.
- Use fictional users and synthetic attempts in tests, fixtures, screenshots, and docs.
- Keep LTI private keys, Canvas developer keys, and production deployment settings outside the repo.

## AI Agent Handoff

When asking another AI agent to work in this repo, include this instruction:

```text
This is a public repository. Do not write or commit secrets, credentials, real student data, LTI launch payloads, production logs, or institution-private information. Use placeholders and synthetic examples only.
```
