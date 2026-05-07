# Database Package

Local development uses SQLite by default:

```bash
npm run db:migrate
npm run db:health
```

The default local database file is `packages/db/prisma/dev.db`, which is ignored by Git.

Production should use PostgreSQL. The PostgreSQL parity schema is kept in
`prisma/schema.postgresql.prisma` so deployment checks can validate provider
differences before release:

```bash
DATABASE_URL="postgresql://user:password@host:5432/learn_database" npm run db:push:postgres
```

Use placeholders in committed examples. Do not commit real credentials, database
dumps, Canvas launch payloads, or student data.
