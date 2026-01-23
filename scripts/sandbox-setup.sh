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

# Copy .env.example to .env if not exists
if [ ! -f apps/web/.env ]; then
  echo "Copying apps/web/.env.example to apps/web/.env..."
  cp apps/web/.env.example apps/web/.env
fi

if [ ! -f apps/api/.env ]; then
  echo "Copying apps/api/.env.example to apps/api/.env..."
  cp apps/api/.env.example apps/api/.env
fi

# Override with environment variables if set
echo "Updating .env files with environment variables..."

update_env() {
  local file=$1
  local key=$2
  local value=$3
  if [ -n "$value" ]; then
    if grep -q "^${key}=" "$file"; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
      echo "${key}=${value}" >> "$file"
    fi
  fi
}

# Web (.env)
update_env "apps/web/.env" "DATABASE_URL" "$DATABASE_URL"

# API (.env)
update_env "apps/api/.env" "DB_HOST" "$DB_HOST"
update_env "apps/api/.env" "DB_PORT" "$DB_PORT"
update_env "apps/api/.env" "DB_USER" "$DB_USER"
update_env "apps/api/.env" "DB_PASS" "$DB_PASS"
update_env "apps/api/.env" "DB_NAME" "$DB_NAME"
update_env "apps/api/.env" "MEILI_HOST" "$MEILI_HOST"
update_env "apps/api/.env" "MEILI_MASTER_KEY" "$MEILI_MASTER_KEY"

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
# Note: PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING is needed due to network restrictions in sandbox
echo "Generating Prisma client..."
cd apps/web
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || echo "WARNING: Prisma client generation failed"
cd ../..

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
