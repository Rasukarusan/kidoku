#!/usr/bin/env bash
# PreToolUse hook — 危険な操作を検出して警告・ブロックする
#
# Claude Code は hook の入力を stdin に JSON で渡す:
#   { "tool_name": "Bash", "tool_input": { "command": "..." }, ... }
# （$1/$2 の引数では渡されないため、必ず stdin から読み取ること）
#
# 終了コード:
#   0 - 許可（メッセージなし）
#   0 + stdout - 許可（stdoutの内容が警告として表示される）
#   2 - ブロック（stderrの内容がブロック理由として表示される）

INPUT=$(cat)

# tool_name を抽出
TOOL_NAME=$(printf '%s' "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try { console.log(JSON.parse(d).tool_name||'') } catch { console.log('') }
  })
" 2>/dev/null || echo "")

# Bash ツールのみチェック
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

# コマンドを抽出（tool_input.command）
COMMAND=$(printf '%s' "$INPUT" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try { const j=JSON.parse(d); console.log((j.tool_input&&j.tool_input.command)||'') } catch { console.log('') }
  })
" 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
  exit 0
fi

# === ブロック: mainブランチへの直接push ===
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*\b(main|master)\b'; then
  echo "main/master ブランチへの直接 push はブロックされました。feature ブランチを使用してください。" >&2
  exit 2
fi

# === ブロック: 破壊的git操作 ===
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "git reset --hard はブロックされました。変更を失う可能性があります。" >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+clean\s+-f'; then
  echo "git clean -f はブロックされました。追跡されていないファイルが削除されます。" >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force'; then
  echo "git push --force はブロックされました。リモートの履歴を破壊する可能性があります。" >&2
  exit 2
fi

# === 警告: コミット前のvalidate未実行チェック ===
if echo "$COMMAND" | grep -qE 'git\s+commit\b'; then
  # 直近のbash履歴で pnpm validate が実行されたかチェック
  # （完全なチェックは難しいので、注意喚起にとどめる）
  echo "コミット前に pnpm validate を実行しましたか？未実行の場合は先に実行を推奨します。"
  exit 0
fi

exit 0
