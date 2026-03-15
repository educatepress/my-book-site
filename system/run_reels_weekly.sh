#!/bin/bash
# =========================================================
# Instagram Reels 自動生成バッチ (Phase 3)
# 実行元: Mac crontab (毎週設定)
# =========================================================

# ログファイルの保存先を定義
LOG_DIR="$HOME/Desktop/webpage.new/system/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/reels_auto_run.log"

# 開始時刻を記録
echo "=========================================================" >> "$LOG_FILE"
echo "[START] $(date) - Instagram Reels Auto-Generation" >> "$LOG_FILE"

# 作業ディレクトリへ移動
cd "$HOME/Desktop/webpage.new/system" || {
    echo "❌ エラー: ディレクトリが見つかりません ($HOME/Desktop/webpage.new/system)" >> "$LOG_FILE"
    exit 1
}

# .env ファイルがあれば読み込んで環境変数としてエクスポートする
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Pythonスクリプトを実行し、標準出力とエラーの両方をログに追記する
/usr/bin/env python3 auto_generate_reels.py >> "$LOG_FILE" 2>&1

# 実行ステータスのチェック
if [ $? -eq 0 ]; then
    echo "✅ [SUCCESS] リール自動生成プロセスが正常に完了しました。" >> "$LOG_FILE"
else
    echo "❌ [ERROR] リール自動生成プロセス中にエラーが発生しました。詳細は上のログを確認してください。" >> "$LOG_FILE"
fi

# 終了時刻を記録
echo "[END] $(date)" >> "$LOG_FILE"
echo "=========================================================" >> "$LOG_FILE"
