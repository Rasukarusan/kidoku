<div align="center">

# Kidoku

**Your Personal Reading Tracker & Analytics**

AI-powered reading habit analysis with barcode scanning, full-text search, and beautiful statistics.

[Demo](https://kidoku.net/) | [Contributing](./CONTRIBUTING.md) | [Documentation](./docs/)

[![CI](https://github.com/Rasukarusan/kidoku/actions/workflows/ci.yml/badge.svg)](https://github.com/Rasukarusan/kidoku/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

<img width="1247" alt="Kidoku - Reading record management" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="Kidoku - Reading statistics" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

---

## Why People Star Kidoku

- **Fast to feel value**: barcode scan + search lets users register books in seconds
- **Visually satisfying**: yearly cards and monthly stats make progress obvious
- **Practical AI**: summarizes reading tendencies instead of generic chatbot output
- **Clean architecture**: DDD + tests + CI make it easy to learn from and contribute to

## One-Minute Product Tour

1. Add a book by title search or barcode scan
2. Organize books into yearly sheets
3. Check monthly/category analytics
4. Generate AI-powered reading insights

## Features

- **Book Registration** - Search by title or scan a barcode to add books instantly
- **Yearly Reading Sheets** - Organize your reading history by year with visual cards
- **AI Reading Analysis** - Discover your reading tendencies with Cohere-powered insights
- **Reading Statistics** - Monthly reading counts, category breakdowns, and trends
- **Full-Text Search** - Lightning-fast Japanese full-text search powered by MeiliSearch

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS 11, GraphQL, DDD architecture |
| Database | MySQL 9.3 + Prisma ORM |
| Auth | NextAuth.js (Google OAuth) |
| Search | MeiliSearch (Japanese-optimized build) |
| AI | Cohere |
| Payments | Stripe |

## Project Structure

```
kidoku/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS GraphQL API (DDD)
├── packages/
│   └── eslint-config # Shared ESLint configuration
├── docker/           # MeiliSearch & MySQL containers
├── docs/             # Architecture & deployment docs
└── scripts/          # Development automation scripts
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10.5.2
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# Start Docker services (MySQL, MeiliSearch)
docker-compose up -d

# Set up database
pnpm --filter web db:push
pnpm --filter web prisma generate
pnpm --filter api db:push

# Start all dev servers
pnpm dev
```

### Access URLs

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| GraphQL API | http://localhost:4000/graphql |
| MeiliSearch | http://localhost:7700 |

### Search Setup (MeiliSearch)

```bash
docker-compose up --build

# Register documents in MeiliSearch
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" \
  http://localhost:3000/api/batch/meilisearch
```

## Development

```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm lint             # Run linter
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Format code with Prettier
pnpm check-types      # Type checking
pnpm validate         # Run lint + type check + tests (all-in-one)
```

### Testing

```bash
# Frontend
pnpm --filter web test          # Unit tests
pnpm --filter web test:c        # With coverage

# Backend
pnpm --filter api test          # Unit tests
pnpm --filter api test:e2e      # E2E tests
```

## Architecture

The backend API follows **Domain-Driven Design (DDD)** with a layered architecture:

```
apps/api/src/
├── domain/           # Core business logic (entities, repository interfaces)
├── application/      # Use cases
├── infrastructure/   # External integrations (DB, auth)
├── presentation/     # GraphQL resolvers, DTOs, modules
└── shared/           # Cross-cutting concerns
```

**Dependency rules**: `domain` has no dependencies. `application` depends only on `domain`. `infrastructure` implements `domain` interfaces. `presentation` orchestrates via `application`.

For detailed architecture documentation, see:
- [Security & Authentication](./docs/SECURITY.md)
- [Admin API & Batch Processing](./docs/ADMIN_API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

If you want to help Kidoku grow on GitHub, see [GitHub Star Growth Playbook](./docs/GITHUB_STAR_GROWTH_PLAYBOOK.md).

## License

[MIT](./LICENSE) - Naoto Tanaka
