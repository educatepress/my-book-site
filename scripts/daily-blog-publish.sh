#!/bin/bash
# ================================================================
#  daily-blog-publish.sh — Daily Automated Blog Pipeline
#
#  Called by macOS launchd every day at 09:00 JST.
#  1. Generates blog + Note article from Queue
#  2. git add → commit → push (triggers Vercel auto-deploy)
#
#  Logs output to scripts/logs/blog-YYYY-MM-DD.log
# ================================================================

set -euo pipefail

# ── Config ──
PROJECT_DIR="$HOME/Desktop/webpage.new"
LOG_DIR="$PROJECT_DIR/scripts/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/blog-$TODAY.log"

# Ensure log directory
mkdir -p "$LOG_DIR"

# Navigate to project
cd "$PROJECT_DIR"

# ── Load Node.js (nvm / Homebrew) ──
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"

echo "════════════════════════════════════════" >> "$LOG_FILE"
echo "📝 Daily Blog Publish — $TODAY $(date +%H:%M:%S)" >> "$LOG_FILE"
echo "════════════════════════════════════════" >> "$LOG_FILE"

# ── Step 1: Generate Blog + Note from Queue ──
echo "" >> "$LOG_FILE"
echo "🚀 Step 1: Generating blog from Queue..." >> "$LOG_FILE"

if npx tsx scripts/content-gen/write-blog-from-queue.ts >> "$LOG_FILE" 2>&1; then
    echo "✅ Blog generation succeeded." >> "$LOG_FILE"
else
    echo "⚠️ Blog generation failed or Queue is empty. Skipping git push." >> "$LOG_FILE"
    echo "完了: $(date +%H:%M:%S)" >> "$LOG_FILE"
    osascript -e "display notification \"Queueが空か、生成に失敗しました\" with title \"Blog Publisher\" subtitle \"スキップ\"" 2>/dev/null || true
    exit 0
fi

# ── Step 2: Check if there are new files to commit ──
echo "" >> "$LOG_FILE"
echo "📦 Step 2: Checking for new/modified files..." >> "$LOG_FILE"

CHANGED_FILES=$(git status --porcelain -- 'src/content/blog/' 'content-approval-queue.json' 'scripts/content-gen/content-queue.json' 'public/infographics/' 2>/dev/null | wc -l | tr -d ' ')

if [ "$CHANGED_FILES" -eq "0" ]; then
    echo "⚠️ No blog files changed. Skipping git push." >> "$LOG_FILE"
    echo "完了: $(date +%H:%M:%S)" >> "$LOG_FILE"
    exit 0
fi

echo "  → $CHANGED_FILES files changed." >> "$LOG_FILE"

# ── Step 3: Git add, commit, push ──
echo "" >> "$LOG_FILE"
echo "🚢 Step 3: Committing and pushing to GitHub..." >> "$LOG_FILE"

git add src/content/blog/ content-approval-queue.json scripts/content-gen/content-queue.json public/infographics/ 2>/dev/null || true
git add scripts/content-gen/out-daily-x/ 2>/dev/null || true

COMMIT_MSG="feat(content): auto-publish daily blog — $TODAY"
git commit -m "$COMMIT_MSG" >> "$LOG_FILE" 2>&1 || {
    echo "⚠️ Nothing to commit." >> "$LOG_FILE"
    exit 0
}

git push origin main >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "✅ Pushed to GitHub! Vercel auto-deploy triggered." >> "$LOG_FILE"
echo "完了: $(date +%H:%M:%S)" >> "$LOG_FILE"

# ── macOS notification ──
osascript -e "display notification \"新しいブログ記事がデプロイされました\" with title \"Blog Publisher\" subtitle \"$TODAY\"" 2>/dev/null || true
