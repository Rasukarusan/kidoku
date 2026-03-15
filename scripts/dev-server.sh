#!/usr/bin/env bash
# 開発サーバーの起動・停止・再起動・ステータス管理スクリプト
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/kidoku"
mkdir -p "$LOG_DIR"

API_PID_FILE="$LOG_DIR/api.pid"
WEB_PID_FILE="$LOG_DIR/web.pid"
API_LOG="$LOG_DIR/api.log"
WEB_LOG="$LOG_DIR/web.log"

green() { echo -e "\033[32m✓ $*\033[0m"; }
yellow() { echo -e "\033[33m⏳ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }

is_running() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

start_api() {
  if is_running "$API_PID_FILE"; then
    green "API サーバーは既に起動中 (PID: $(cat "$API_PID_FILE"))"
    return 0
  fi
  yellow "API サーバーを起動中..."
  cd "$PROJECT_ROOT"
  pnpm --filter api dev > "$API_LOG" 2>&1 &
  echo $! > "$API_PID_FILE"
  # 起動待ち（最大60秒）
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w '' http://localhost:4000/graphql 2>/dev/null; then
      green "API サーバー起動完了 (PID: $(cat "$API_PID_FILE"), ログ: $API_LOG)"
      return 0
    fi
    sleep 1
  done
  yellow "API サーバーはまだ起動中かもしれません (PID: $(cat "$API_PID_FILE"), ログ: $API_LOG)"
}

start_web() {
  if is_running "$WEB_PID_FILE"; then
    green "Web サーバーは既に起動中 (PID: $(cat "$WEB_PID_FILE"))"
    return 0
  fi
  yellow "Web サーバーを起動中..."
  cd "$PROJECT_ROOT"
  pnpm --filter web dev > "$WEB_LOG" 2>&1 &
  echo $! > "$WEB_PID_FILE"
  # 起動待ち（最大90秒）
  for i in $(seq 1 90); do
    if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
      green "Web サーバー起動完了 (PID: $(cat "$WEB_PID_FILE"), ログ: $WEB_LOG)"
      return 0
    fi
    sleep 1
  done
  yellow "Web サーバーはまだ起動中かもしれません (PID: $(cat "$WEB_PID_FILE"), ログ: $WEB_LOG)"
}

stop_api() {
  if is_running "$API_PID_FILE"; then
    local pid
    pid=$(cat "$API_PID_FILE")
    kill "$pid" 2>/dev/null || true
    # 子プロセスも終了
    pkill -P "$pid" 2>/dev/null || true
    rm -f "$API_PID_FILE"
    green "API サーバーを停止しました"
  else
    rm -f "$API_PID_FILE"
    green "API サーバーは起動していません"
  fi
}

stop_web() {
  if is_running "$WEB_PID_FILE"; then
    local pid
    pid=$(cat "$WEB_PID_FILE")
    kill "$pid" 2>/dev/null || true
    pkill -P "$pid" 2>/dev/null || true
    rm -f "$WEB_PID_FILE"
    green "Web サーバーを停止しました"
  else
    rm -f "$WEB_PID_FILE"
    green "Web サーバーは起動していません"
  fi
}

status() {
  echo "=== 開発サーバーステータス ==="
  if is_running "$API_PID_FILE"; then
    green "API: 起動中 (PID: $(cat "$API_PID_FILE"))"
  else
    red "API: 停止中"
  fi
  if is_running "$WEB_PID_FILE"; then
    green "Web: 起動中 (PID: $(cat "$WEB_PID_FILE"))"
  else
    red "Web: 停止中"
  fi
}

logs() {
  local target="${1:-all}"
  case "$target" in
    api) tail -50 "$API_LOG" 2>/dev/null || red "API ログなし" ;;
    web) tail -50 "$WEB_LOG" 2>/dev/null || red "Web ログなし" ;;
    all)
      echo "=== API ログ (最新20行) ==="
      tail -20 "$API_LOG" 2>/dev/null || red "API ログなし"
      echo ""
      echo "=== Web ログ (最新20行) ==="
      tail -20 "$WEB_LOG" 2>/dev/null || red "Web ログなし"
      ;;
  esac
}

case "${1:-help}" in
  start)
    start_api
    start_web
    ;;
  stop)
    stop_web
    stop_api
    ;;
  restart)
    stop_web
    stop_api
    sleep 2
    start_api
    start_web
    ;;
  status)
    status
    ;;
  logs)
    logs "${2:-all}"
    ;;
  help)
    echo "Usage: $0 {start|stop|restart|status|logs [api|web|all]}"
    echo ""
    echo "  start    - API と Web の開発サーバーを起動"
    echo "  stop     - 開発サーバーを停止"
    echo "  restart  - 開発サーバーを再起動"
    echo "  status   - 起動状態を確認"
    echo "  logs     - ログを表示 (api/web/all)"
    ;;
  *)
    red "不明なコマンド: $1"
    echo "Usage: $0 {start|stop|restart|status|logs [api|web|all]}"
    exit 1
    ;;
esac
