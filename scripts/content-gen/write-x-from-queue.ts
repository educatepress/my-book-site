import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';
import { getNextPendingItem, markItemStatus } from './queue-manager';
import { verifyUrl, extractAndVerifySourceUrl } from './url-verifier';

// ============================================================================
// ⚙️ Configuration
// ============================================================================

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Twitter API Clients ---
const jpApiKey = process.env.TWITTER_API_KEY;
const jpApiSecret = process.env.TWITTER_API_SECRET;
const jpAccessToken = process.env.TWITTER_ACCESS_TOKEN;
const jpAccessSecret = process.env.TWITTER_ACCESS_SECRET;

const enApiKey = process.env.EN_TWITTER_API_KEY;
const enApiSecret = process.env.EN_TWITTER_API_SECRET;
const enAccessToken = process.env.EN_TWITTER_ACCESS_TOKEN;
const enAccessSecret = process.env.EN_TWITTER_ACCESS_SECRET;

let jpClient: TwitterApi | null = null;
if (jpApiKey && jpApiSecret && jpAccessToken && jpAccessSecret) {
    jpClient = new TwitterApi({
        appKey: jpApiKey,
        appSecret: jpApiSecret,
        accessToken: jpAccessToken,
        accessSecret: jpAccessSecret,
    });
} else {
    console.warn("⚠️ Warning: JP Twitter API credentials missing.");
}

let enClient: TwitterApi | null = null;
if (enApiKey && enApiSecret && enAccessToken && enAccessSecret) {
    enClient = new TwitterApi({
        appKey: enApiKey,
        appSecret: enApiSecret,
        accessToken: enAccessToken,
        accessSecret: enAccessSecret,
    });
} else {
    console.warn("⚠️ Warning: EN Twitter API credentials missing.");
}

// --- LP URLs ---
const LP_URL_JP = "https://doctors-guide-womens-health.vercel.app/";
const LP_URL_EN = "https://doctors-guide-womens-health.vercel.app/en";

// ============================================================================
// 🔄 無人稼働のための自己修復（Auto-Retry）型 AI生成関数
// ============================================================================
async function generateWithRetry(item: any, maxRetries = 2) {
    // 💡 毎日ランダムな切り口を注入し、AIの「マンネリ化」を防ぐ
    const hookAnglesJp = [
        "【外来での気づき】日々の診察室で、患者さんからよく受ける質問へのフラットな回答",
        "【最新エビデンス】最新の医学論文やニュースから得られた、専門医としての客観的な視点",
        "【誤解の訂正】ネット上の「よくある思い込み」に対する、医学的な現在地",
        "【専門医の独り言】生殖医療の限界と可能性について、冷静に語るトーン"
    ];
    const hookAnglesEn = [
        "Clinical Observation: Answering a common question I hear from patients.",
        "Latest Evidence: An objective perspective based on recent medical papers.",
        "Correcting Misconceptions: The medical reality versus common online myths.",
        "Specialist's Thoughts: A candid look at reproductive medicine."
    ];
    const angleIndex = Math.floor(Math.random() * hookAnglesJp.length);

    let prompt = `
あなたは、生殖医療専門医である佐藤琢磨医師の専属ゴーストライターです。
「完全自動・無人」で毎日投稿されるため、AIだと一切見抜かれない自然さと、LP（書籍）への効果的な送客が至上命題です。

【発信テーマ】
- JP: ${item.theme} / EN: ${item.themeEn}
- 目的 (JP/EN): ${item.direction} / ${item.directionEn}
- エビデンス元: ${item.sourceUrls.join('\n')}

【超重要: AI臭さの完全排除（ネガティブプロンプト）】
❌ 以下の「AI特有の薄っぺらい共感・定型文」は絶対に使用禁止：
「不安になりますよね」「寄り添います」「一緒に歩んでいきましょう」「結論から言うと」「重要なポイントは」「〜をご存知ですか？」
✅ 代わりに、本日の投稿は以下の「リアルな切り口」から書き出してください：
JP: 「${hookAnglesJp[angleIndex]}」
EN: 「${hookAnglesEn[angleIndex]}」
感情的にならず、淡々と最新の知見や事実を伝える「フラットで真摯な臨床医」として振る舞ってください。

【医療コンプライアンスの自己検閲（絶対厳守）】
いきなり文章を作るのではなく、必ず「thoughtProcess」の項目で、以下に違反がないか自己検閲してください。

■ 絶対禁止（レッドライン）:
  - 虚偽・誇大広告: 「必ず妊娠できる」「100%効果がある」「奇跡の」「画期的な」
  - 比較優良広告: 「他院より優れた」「最高の」「日本一の」
  - 体験談の捏造: 実在しない患者の声やストーリー
  - 恐怖を煽る表現: 「手遅れになる前に」「取り返しがつかない」「もう間に合わない」「危険です」
  - 特定の治療法の効果を断定: 「これをすれば治る」「唯一の方法」
  - 未承認治療・エビデンス不十分な民間療法の推奨
  - 患者の不安につけ込む煽動的表現

■ 注意が必要（イエローライン）:
  - 統計データの提示時: 必ず出典を明記し、「研究では〜という報告があります」と留保をつける
  - 年齢に関する言及: 数字は正確に、かつ「個人差があります」の一言を添える
  - 「知らないと損」系の表現: 煽りに見えやすいため、「知っておくと選択肢が広がります」に言い換える

【スレッド構成とLPへの送客（シャドウバン対策）】
Xのアルゴリズム上、1ツイート目にリンクがあると表示回数が激減します。
各言語3〜4ツイートで構成し、以下の配置を厳守してください。

■ ツイート1〜2（Hook & Fact / 🚨リンク絶対禁止）
  読者のスクロールを止める事実やデータの解説。挨拶不要。1ツイート目の末尾は「🧵👇」
  ❌ 絶対禁止のフック（恐怖煽り・断定・誇大）:
    NG:「【卵子凍結は無駄】知らないと後悔する衝撃の真実」
    NG:「【あなたの精子は危険】今すぐ検査を」
  ✅ 推奨するフック（意外性のある事実 + ポジティブな気づき）:
    OK:「【排卵日＝ベストタイミング？】実は最新研究では少し違います🧵👇」
    OK:「よく患者さんから聞かれる【◯◯】について、最新データをまとめました🧵👇」

■ 最終ツイート（CTA & Source / ✅ここにリンクを配置）
  熱量の高まった読者をLPへ誘導します。「体系的な知識のお守りとして」「より詳しい選択肢はこちらに」といった教育的な文脈でLPのURLを提示してください。
  ・JP誘導先: ${LP_URL_JP}
  ・EN誘導先: ${LP_URL_EN}
  最後に必ずソースURL（${item.sourceUrls[0]}）も併記し、ハッシュタグを1つ添えること。

【文化に合わせたトーンの制御】
■ 日本語: 「当院」「当クリニック」は使わないこと。トーンは「信頼できるかかりつけ医が淡々と語る」。
■ 英語: Empowermentベースの表現（"Knowledge is power", "You deserve informed decisions"）。

※文字数エラーによるシステム停止を防ぐため、JPは各ツイート【130文字以内】、ENは【270文字以内】を厳守してください。

【出力形式（厳守）】
必ず以下のJSON形式のみで回答してください。JSON以外の文字（説明文やmarkdown装飾）は一切出力しないでください。
\`\`\`
{
  "thoughtProcess": "検索した事実の整理と、医療広告ガイドライン違反チェックの結果をここに記載",
  "jpXPostThread": ["ツイート1", "ツイート2", "ツイート3"],
  "enXPostThread": ["Tweet 1", "Tweet 2", "Tweet 3"]
}
\`\`\`
`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🤖 AI Generation Attempt ${attempt}/${maxRetries}...`);

        // Google Searchで最新医学論文をファクトチェック + プロンプトベースJSON出力
        // (googleSearch と responseMimeType:"application/json" は併用不可のため、プロンプトでJSON指示)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const rawText = response.text || '';

        // JSON抽出: コードブロック内のJSONまたは生のJSONオブジェクトを検出
        let result: any;
        try {
            // まず全体がJSONかどうか試す
            result = JSON.parse(rawText);
        } catch {
            // コードブロック (```json ... ```) 内のJSONを抽出
            const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
            if (jsonMatch) {
                try {
                    result = JSON.parse(jsonMatch[1].trim());
                } catch (e2) {
                    console.warn(`⚠️ Attempt ${attempt}: JSON parse error in code block`);
                    if (attempt === maxRetries) throw new Error(`JSON parse failed after ${maxRetries} attempts: ${e2}`);
                    prompt += `\n\n【警告】前回の出力はJSONとしてパースできませんでした。必ず有効なJSONのみを出力してください。markdown装飾や説明文は不要です。`;
                    continue;
                }
            } else {
                // { ... } を直接抽出
                const braceMatch = rawText.match(/\{[\s\S]*\}/);
                if (braceMatch) {
                    try {
                        result = JSON.parse(braceMatch[0]);
                    } catch (e3) {
                        console.warn(`⚠️ Attempt ${attempt}: JSON parse error in brace extraction`);
                        if (attempt === maxRetries) throw new Error(`JSON parse failed after ${maxRetries} attempts: ${e3}`);
                        prompt += `\n\n【警告】前回の出力はJSONとしてパースできませんでした。必ず有効なJSONのみを出力してください。`;
                        continue;
                    }
                } else {
                    console.warn(`⚠️ Attempt ${attempt}: No JSON found in response`);
                    if (attempt === maxRetries) throw new Error(`No JSON found in AI response after ${maxRetries} attempts`);
                    prompt += `\n\n【警告】前回の出力にJSONが含まれていませんでした。必ず指定のJSON形式で出力してください。`;
                    continue;
                }
            }
        }

        // 必須フィールドチェック
        if (!result.jpXPostThread || !result.enXPostThread) {
            console.warn(`⚠️ Attempt ${attempt}: Missing required fields`);
            if (attempt === maxRetries) throw new Error(`Missing jpXPostThread or enXPostThread after ${maxRetries} attempts`);
            prompt += `\n\n【警告】出力に jpXPostThread または enXPostThread が含まれていません。JSON形式を厳守してください。`;
            continue;
        }

        console.log(`\n🧠 [AI自己検閲ログ]: ${result.thoughtProcess || '(なし)'}\n`);

        // 簡易文字数バリデーション（URLを除外して計算）
        let isValid = true;
        let errorMessage = "";
        const checkLen = (thread: string[], limit: number) => {
            for (const text of thread) {
                const textWithoutUrl = text.replace(/https?:\/\/[^\s]+/g, '');
                if (textWithoutUrl.length > limit) return false;
            }
            return true;
        };

        if (!checkLen(result.jpXPostThread || [], 138)) { isValid = false; errorMessage += "JP文字数超過。"; }
        if (!checkLen(result.enXPostThread || [], 275)) { isValid = false; errorMessage += "EN文字数超過。"; }

        if (isValid) return result;

        console.warn(`⚠️ Attempt ${attempt} failed: ${errorMessage}`);
        if (attempt === maxRetries) return result; // 最終リトライ時はそのまま返す

        // エラー時はAIに「短くしろ」と指示を追加して再生成（自己修復）
        prompt += `\n\n【警告】前回の出力はXの文字数制限を超過しました。リンクは削らず、テキスト部分をもっと短く簡潔に修正して再出力してください。`;
    }
}

// ============================================================================
// 🔍 URL検証ヘルパー（スレッド配列用）
// ============================================================================
async function verifyThreadUrls(thread: string[], label: string): Promise<string[]> {
    if (thread.length === 0) return thread;

    console.log(`\n  [Checking ${label} Thread]`);
    const fullText = thread.join(' ');
    try {
        await extractAndVerifySourceUrl(fullText);
        for (let i = 0; i < thread.length; i++) {
            const urls = thread[i].match(/https?:\/\/[^\s)\]"']+/g) || [];
            for (const url of urls) {
                // LP URLsは常に有効なのでスキップ
                if (url.startsWith(LP_URL_JP) || url.startsWith(LP_URL_EN)) continue;
                if (!(await verifyUrl(url))) {
                    thread[i] = thread[i].replace(url, '').replace(/\n\n+/g, '\n\n').trim();
                }
            }
        }
        return thread;
    } catch (e: any) {
        console.error(e.message);
        console.error(`  👉 Aborting ${label} thread formatting.`);
        return [];
    }
}

// ============================================================================
// 🚀 メイン処理
// ============================================================================
async function main() {
    console.log("🚀 Starting Fully Automated X Content Generation...");

    const item = await getNextPendingItem("x");
    if (!item) {
        console.log("🟢 The Queue is empty. No pending X posts to process today.");
        process.exit(0);
    }

    console.log(`\n📋 Processing Item [${item.id}]: ${item.theme}`);
    console.log(`🔗 Primary Source URL: ${item.sourceUrls[0]}`);

    try {
        const result = await generateWithRetry(item);
        if (!result) {
            console.error("❌ AI generation returned no result.");
            process.exit(1);
        }

        let jpThread: string[] = result.jpXPostThread || [];
        let enThread: string[] = result.enXPostThread || [];

        // --- URL Verification Phase ---
        console.log("\n🔍 Verifying URLs in generated output...");
        jpThread = await verifyThreadUrls(jpThread, "JP");
        enThread = await verifyThreadUrls(enThread, "EN");

        if (jpThread.length === 0 && enThread.length === 0) {
             console.error("❌ Both JP and EN outputs failed validation. Exiting.");
             process.exit(1);
        }

        // Save locally as backup
        const outDir = path.join(process.cwd(), 'scripts', 'content-gen', 'out-daily-x');
        await fs.mkdir(outDir, { recursive: true });
        const todayStr = new Date().toISOString().split('T')[0];
        if (jpThread.length > 0) await fs.writeFile(path.join(outDir, `${todayStr}-jp-thread.json`), JSON.stringify(jpThread, null, 2));
        if (enThread.length > 0) await fs.writeFile(path.join(outDir, `${todayStr}-en-thread.json`), JSON.stringify(enThread, null, 2));

        console.log("--- ✨ JP Thread Preview ✨ ---\n" + jpThread.join('\n\n---\n\n'));
        console.log("\n--- ✨ EN Thread Preview ✨ ---\n" + enThread.join('\n\n---\n\n'));

        // --- 自動投稿ロジック ---
        let postSuccess = false;

        if (jpClient && jpThread.length > 0) {
            console.log("\n🚀 Posting to JP Twitter Thread...");
            try {
                const jpRes = await jpClient.readWrite.v2.tweetThread(jpThread);
                console.log(`✅ Success JP Thread. First Tweet ID: ${jpRes[0].data.id}`);
                postSuccess = true;
            } catch (jpErr) {
                console.error("❌ Failed to post JP thread:", jpErr);
            }
        }

        if (enClient && enThread.length > 0) {
            console.log("\n🚀 Posting to EN Twitter Thread...");
            try {
                const enRes = await enClient.readWrite.v2.tweetThread(enThread);
                console.log(`✅ Success EN Thread. First Tweet ID: ${enRes[0].data.id}`);
                postSuccess = true;
            } catch (enErr) {
                console.error("❌ Failed to post EN thread:", enErr);
            }
        }

        if (postSuccess) {
            await markItemStatus(item.id, "posted");
        } else {
            await markItemStatus(item.id, "generated");
            console.log("✅ Marked as 'generated' locally due to Twitter API failure (or running locally).");
        }

        console.log("\n🎉 Fully Automated Posting complete!");

    } catch (err: any) {
        console.error("❌ Fatal Error processing X queue:", err);
        process.exit(1);
    }
}

main();
