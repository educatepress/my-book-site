import os
import re
import json
import datetime
from google import genai
from google.genai import types # JSON確実出力のために追加

# Setup API Key
api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    print("❌ 致命的エラー: GEMINI_API_KEY が環境変数に設定されていません。(.envファイルを確認してください)")
    exit(1)
client = genai.Client(api_key=api_key)

# 対象ファイルのパス
DRIVE_DIR = "/Users/satoutakuma/Library/CloudStorage/GoogleDrive-gana.pati1201@gmail.com/マイドライブ/Instagram_Auto_Post"
CALENDAR_FILE = os.path.join(DRIVE_DIR, "Reels_Content_Calendar.md")
READY_TO_POST_DIR = os.path.join(DRIVE_DIR, "Ready_to_Post")

# カレンダーの読み込み
try:
    with open(CALENDAR_FILE, 'r', encoding='utf-8') as f:
        calendar_text = f.read()
except Exception as e:
    print(f"❌ カレンダファイルの読み込みに失敗しました: {e}")
    exit(1)

# 未完了のタスク（最初の `- [ ]`）を検索
match = re.search(r'- \[ \]\s*\*\*\d+\.\s*(\d{4}/\d{2}/\d{2})\s*投稿予定:\*\*\s*\n\s*-\s*\*\*テーマ\*\*:\s*「(.*?)」\s*\n\s*-\s*\*\*狙い\*\*:\s*(.*?)(?=\n\s*- \[ |\n\n|$)', calendar_text, re.DOTALL)

if not match:
    print("✅ 全てのテーマの処理が完了しているか、未着手のテーマが見つかりません。")
    exit(0)

# 該当テーマの抽出
date_str = match.group(1).strip()
theme = match.group(2).strip()
aim = match.group(3).strip()
original_text_block = match.group(0)

print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🎬 次のテーマを生成します: 【{date_str}】 {theme}")

system_prompt = """
あなたは、女性の健康、不妊予防、プレコンセプションケア、ライフプラン構築を専門とする医師（Medical Doctor）であり、著書『The Doctor's Guide to Women's Health & Preconception』の著者です。
自身のグローバル向け（英語圏）Instagramアカウントを運用するトップマーケター兼クリエイティブディレクターとして、洗練された「英語のInstagram Reels動画用プロンプト（Invideo AI向け）」と「英語のInstagram投稿用キャプション」を作成してください。

ターゲットは、将来の家族計画やライフプランに前向きに向き合いたい、または悩みを抱える20〜40代の英語圏の女性です。
トーン＆マナーは「専門医としての圧倒的な信頼感（Trustworthy & Authoritative）」「深い共感（Empathetic）」「エンパワーメント（Empowering）」です。決して不安を煽るのではなく、医学的根拠に基づき女性の人生を前向きに応援する姿勢を貫いてください。
"""

user_prompt = f"""
以下の日本のテーマと狙いを元に、Invideo AIへの英語の指示書（プロンプト）、Instagramの英語キャプション、およびフォルダ名用の英語スラッグを作成してください。

Theme (テーマ): {theme}
Aim (狙い): {aim}

【プロのクリエイター・医師視点：動画プロンプト（invideo_prompt）への必須指示】
Invideo AIが、ターゲットをエンパワーメントし、医師としての権威性と温かみを感じさせる最高品質の動画を生成できるよう、以下のディレクションを必ず英語で詳細に組み込んでください。
1. Hook & Pacing: "Empathetic and thought-provoking hook for the first 3 seconds to grab attention, followed by an educational and inspiring pace."
2. Visual Tone & B-Roll: "Cinematic, modern, and empowering women's wellness aesthetic. Show smart, confident women, healthy living, cozy reading moments, journaling, or warm medical consulting."
   ★超重要（ネガティブプロンプト）★ "CRITICAL: Strictly avoid cold, depressing, sad, or highly clinical hospital footage. Do not show crying women or needles. Focus on proactive health, hope, and life planning."（暗い病院や悲しむ女性の映像は厳禁。前向きな健康とライフプランに焦点を当てる）
3. Audio: "Confident, highly empathetic, and trustworthy female American voiceover (sounds like an expert doctor who is also a supportive mentor). Background music should be inspiring, uplifting yet elegant."
4. Captions (字幕): "Minimalist modern sans-serif subtitles. Keep all text strictly within Instagram Reel center safe zones (avoid edges and bottom)."
5. ★超重要 CTA & 書籍への誘導★: 動画の最後（ラスト3〜5秒）には必ず、著書を宣伝しManyChatを起動させるための明確な行動喚起を「音声」と「画面の文字」の両方で配置するよう強く指示すること。
   (Example: "Comment the word 'BOOK' below, and I'll DM you the direct link to my complete guide, 'The Doctor's Guide to Women's Health & Preconception'!")

【プロのマーケター視点：Instagramキャプション（instagram_caption）への必須指示】
1. Hook: 1行目は「続きを読む（...more）」を押したくなるような、キャリアやライフプランに関するハッとさせられる問いかけや共感のフレーズにすること。
2. Context (Authority & Warmth): 医師（Doctor）としての専門的知見と、女性を応援する温かいトーン。絵文字は上品なもの（📖, 💡, 🤍, 🌱, 🕊️など）に限定。改行を活用して読みやすくする。
3. Book Integration: キャプションの自然な流れで、あなたの著書『The Doctor's Guide to Women's Health & Preconception』が彼女たちの悩みに対する医学的・実践的な解決策であることを提示すること。
4. CTA: 自動返信ボットを起動するための「Comment the word **"BOOK"** below to get the direct Amazon link to my book sent straight to your DMs!」という指示を必ず含めること。
5. Retention: キャプションの最後に「Save this post for your future life planning」や「Share this with a friend navigating her 30s」などの保存・シェアを促す一言を追加すること。
6. SEO: グローバル向けにリーチを広げるため、#womenshealth #preconceptioncare #fertilityawareness #lifeplanning #careerwomen などの効果的なハッシュタグを5〜7個含めること。

【出力フォーマット（厳守）】
以下のキーを持つJSON形式のみを出力してください。Markdownの装飾（```json）や余計な解説は不要です。
{{
  "folder_slug": "テーマを表す短い英単語のケバブケース（例: preconception-life-plan）",
  "invideo_prompt": "Task: Create an inspiring, highly aesthetic vertical video... (上記1〜5を網羅した緻密なInvideo向け命令文)",
  "instagram_caption": "This is the hook... \\n\\n As a doctor, I often see... \\n\\n Comment \\"BOOK\\"... \\n\\n Save this post... \\n\\n #womenshealth #preconceptioncare"
}}
"""

full_prompt = system_prompt + "\n\n" + user_prompt

try:
    print("🤖 Gemini 2.5 Proで原稿を生成中...")
    
    # 【改善】JSONモードを利用して確実にJSONデータのみを取得
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
        )
    )
    
    data = json.loads(response.text.strip())
    
    # 【改善】出力用フォルダの作成 (YYYYMMDD_slug)
    # AIに短い英語スラッグを作らせることで、日本語テーマの文字化け・消失を防ぎます
    safe_date = date_str.replace('/', '')
    slug = data.get("folder_slug", "Reel").replace(" ", "-").lower()
    folder_name = f"{safe_date}_{slug}"
    output_dir = os.path.join(READY_TO_POST_DIR, folder_name)
    os.makedirs(output_dir, exist_ok=True)
    
    # ファイルの書き出し
    prompt_file = os.path.join(output_dir, f"{safe_date}_01_Invideo_Prompt.txt")
    with open(prompt_file, 'w', encoding='utf-8') as f:
        f.write(data["invideo_prompt"])
        
    caption_file = os.path.join(output_dir, f"{safe_date}_01_Caption.txt")
    with open(caption_file, 'w', encoding='utf-8') as f:
        f.write(data["instagram_caption"])
        
    # ==========================================
    # 【改善】Manus指示書の作成（PC版Instagramの9:16維持手順を追加）
    # ==========================================
    manus_instruction = f"""あなたは現在連携しているChromeブラウザを操作して、以下のタスクを実行してください。
あなた自身の内部ツール（動画作成など）は一切使用せず、「ブラウザ操作ロボット」としてのみ機能してください。

【タスク手順：Instagramへの投稿】
1. 新しいタブで「Instagram（ [https://www.instagram.com/](https://www.instagram.com/) ）」にアクセスしてください。
2. もしログイン後の「通知設定」などのポップアップが出たら、すべて「後で（Not Now）」を押して閉じてください。
3. 画面左側のメニューにある「作成（＋アイコン）」をクリックして、新規投稿の画面を開いてください。
4. 【重要】 ここで「コンピューターから選択」のボタンが表示されたら、それ以上は進めずに一旦作業をストップし、「ファイルを選択する準備ができました。動画（MP4）を手動で選択してください」と私（人間）に報告してください。
5. （※私（人間）が手動でGoogle Driveの「Ready_to_Post -> {folder_name}」内にある動画（MP4）を選択します）
6. 画面がプレビュー（動画が読み込まれた状態）に切り替わったら、あなたが作業を再開してください。
7. 【超重要】 画面の左下にある「比率アイコン（クロップボタン：＜＞のようなマーク）」をクリックし、必ず「元のサイズ」または「9:16」を選択してください。（※これを行わないと自動的に正方形に切り取られてしまいます）
8. 「次へ」を押し進め、「キャプションを入力...」の欄が表示されたら、以下の【 】内のテキストを、一切変更や翻訳を加えずにそのままペーストしてください。

【
{data["instagram_caption"]}
】

9. 最後に「シェア」ボタンを押して、投稿が完了したことを確認したらタスクを終了してください。
"""
    manus_file = os.path.join(output_dir, f"{safe_date}_01_Manus_Instruction.txt")
    with open(manus_file, 'w', encoding='utf-8') as f:
        f.write(manus_instruction)
        
    print(f"✅ 生成成功: {output_dir} に出力しました。")
    
    # カレンダーの [ ] を [x] に更新
    updated_text_block = original_text_block.replace("- [ ]", "- [x]", 1)
    calendar_text = calendar_text.replace(original_text_block, updated_text_block, 1)
    
    with open(CALENDAR_FILE, 'w', encoding='utf-8') as f:
        f.write(calendar_text)
        
    print(f"📝 カレンダー（Reels_Content_Calendar.md）を更新しました。")
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✨ すべての処理が正常に完了しました！")

except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
