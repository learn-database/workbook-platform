# Learn Database Workbook Platform

This repository will contain the interactive workbook platform for Learn Database.

The platform is planned to support:

- standalone course website delivery
- Canvas-embedded LMS delivery through LTI 1.3, with lesson content rendered inside Canvas instead of sending students to a separate site by default
- student attempts and response storage
- automatic or self-guided scoring and Canvas grade passback
- content publishing from `learn-database/course-materials`

See [docs/workbook-platform-build-plan.md](docs/workbook-platform-build-plan.md) for the initial build plan, [docs/development-plan.md](docs/development-plan.md) for the implementation sequence, [docs/github-project-plan.md](docs/github-project-plan.md) for project/milestone/issue planning, [docs/content-development-import-contract.md](docs/content-development-import-contract.md) for the content authoring/import contract, and [docs/static-player-migration-inventory.md](docs/static-player-migration-inventory.md) for the legacy static player migration inventory.

## Local Development

Prerequisites:

- Node.js `22` or newer
- npm `11` or newer

Install dependencies:

```bash
npm install
```

Copy the placeholder environment file if you want local overrides:

```bash
cp .env.example .env
```

Local development uses SQLite by default. The generated database file is ignored
by Git.

```bash
npm run db:migrate
npm run db:health
npm run dev
```

Useful verification commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
```

Production should use PostgreSQL. Keep real connection strings and LTI secrets in
runtime environment variables or a managed secret store, never in this public
repository.

Design review docs:

- [Database Schema](docs/design/database-schema.md)
- [Sequence Diagrams](docs/design/sequence-diagrams.md)
- [Use Cases](docs/design/use-cases.md)
