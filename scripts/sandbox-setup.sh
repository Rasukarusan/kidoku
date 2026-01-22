#!/bin/bash
# Claude Code Web sandbox setup script
# This script sets up the development environment for sandbox sessions

set -e

# 例：リモート環境でのみ実行
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

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

# Setup Playwright browser for MCP
# Note: CDN access is restricted in sandbox, so we use pre-installed chromium
echo "Setting up Playwright browser for MCP..."

PLAYWRIGHT_CACHE="$HOME/.cache/ms-playwright"

# Find pre-installed chromium directory (type d for directory, exclude symlinks)
CHROMIUM_DIR=$(find "$PLAYWRIGHT_CACHE" -maxdepth 1 -type d -name "chromium-*" ! -type l 2>/dev/null | head -1)

if [ -n "$CHROMIUM_DIR" ] && [ -d "$CHROMIUM_DIR/chrome-linux" ]; then
  echo "Found pre-installed Chromium: $CHROMIUM_DIR"
  CHROMIUM_VERSION=$(basename "$CHROMIUM_DIR" | sed 's/chromium-//')
  echo "Chromium version: $CHROMIUM_VERSION"

  # Create symlinks for other versions that MCP might expect
  # MCP 0.0.40 uses playwright 1.56.0 (chromium-1194)
  # MCP latest uses playwright 1.58.0 (chromium-1207)
  for VERSION in 1194 1207; do
    TARGET_DIR="$PLAYWRIGHT_CACHE/chromium-$VERSION"
    if [ ! -e "$TARGET_DIR" ]; then
      echo "Creating symlink: chromium-$VERSION -> $CHROMIUM_DIR"
      ln -sf "$CHROMIUM_DIR" "$TARGET_DIR"
    fi
  done

  # Handle MCP-specific chromium directories (mcp-chromium-*)
  for MCP_DIR in "$PLAYWRIGHT_CACHE"/mcp-chromium-*; do
    if [ -d "$MCP_DIR" ] || [ -L "$MCP_DIR" ]; then
      # Check if it's empty, broken, or needs updating
      if [ ! -d "$MCP_DIR/chrome-linux" ]; then
        echo "Fixing MCP chromium directory: $MCP_DIR"
        rm -rf "$MCP_DIR"
        ln -sf "$CHROMIUM_DIR" "$MCP_DIR"
      fi
    fi
  done

  echo "Playwright browser setup complete"
else
  echo "No pre-installed Chromium found in $PLAYWRIGHT_CACHE"
  echo "Attempting to install Playwright Chromium..."
  npx playwright install chromium || echo "WARNING: Playwright installation failed (CDN may be restricted)"
fi

echo "=== Sandbox setup complete ==="
echo "Run 'pnpm --filter web dev' to start the development server"
echo ""
echo "Note: When using Playwright in sandbox, use these Chromium flags:"
echo "  --no-sandbox --disable-setuid-sandbox --disable-gpu"
echo "  --disable-dev-shm-usage --single-process --no-zygote"
