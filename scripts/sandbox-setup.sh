#!/bin/bash
# Claude Code Web sandbox setup script
# This script sets up the development environment for sandbox sessions

set -e

echo "=== Kidoku Sandbox Setup ==="

# Change to project root
cd "$(dirname "$0")/.."

# Create sandbox environment file if not exists
if [ ! -f apps/web/.env.local ]; then
  echo "Creating sandbox environment file..."
  cat > apps/web/.env.local << 'EOF'
# Sandbox environment for Claude Code Web
DATABASE_URL="file:./dev.db"

# Auth (sandbox mode)
NEXTAUTH_SECRET=sandbox-secret-key-for-development-only
NEXTAUTH_URL=http://localhost:3000

# Enable backdoor login for sandbox
NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true
BACKDOOR_USER_EMAIL=sandbox@example.com

# GraphQL endpoint (mock or local)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
EOF
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Use SQLite schema for sandbox
echo "Setting up SQLite database..."
cp apps/web/prisma/schema.sqlite.prisma apps/web/prisma/schema.prisma.bak
cp apps/web/prisma/schema.sqlite.prisma apps/web/prisma/schema.prisma

# Generate Prisma client
echo "Generating Prisma client..."
pnpm --filter web prisma generate

# Push schema to database
echo "Pushing schema to SQLite database..."
pnpm --filter web prisma db push

# Seed sample data
echo "Seeding sample data..."
node scripts/sandbox-seed.js || echo "Seed script not found or failed, skipping..."

# Restore original schema (keep backup)
mv apps/web/prisma/schema.prisma.bak apps/web/prisma/schema.prisma

# Install Playwright browser for MCP
echo "Installing Playwright Chromium browser..."
npx playwright install chromium || echo "Playwright browser installation skipped"

echo "=== Sandbox setup complete ==="
echo "Run 'pnpm --filter web dev' to start the development server"
