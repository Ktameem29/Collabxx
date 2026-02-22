#!/bin/bash
# Collabxx — One-command production deploy
# Usage: ./deploy.sh [branch]
# Requires: Docker, docker compose v2

set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Collabxx — Production Deploy      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Ensure .env.production exists
if [ ! -f "$APP_DIR/backend/.env.production" ]; then
  echo "❌  backend/.env.production not found!"
  echo "    Copy backend/.env.production.example and fill in real values."
  exit 1
fi

echo "📦  Pulling latest from $BRANCH..."
cd "$APP_DIR"
git pull origin "$BRANCH"

echo "🛑  Stopping old containers..."
docker compose down --remove-orphans

echo "🔨  Building images..."
docker compose build --no-cache

echo "🚀  Starting services..."
docker compose up -d

echo "⏳  Waiting for health checks..."
sleep 10
docker compose ps

echo ""
echo "✅  Deploy complete!"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🌐  App → http://${SERVER_IP}"
echo "📋  Logs → docker compose logs -f"
