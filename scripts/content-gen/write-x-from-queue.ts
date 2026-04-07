import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';
import { getThemeSchedule, updateThemeScheduleStatus } from '../../src/lib/sheets';
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
const LP_URL_JP = "https://ttcguide.co/";
const LP_URL_EN = "https://ttcguide.co/en";

// ============================================================================
// 🔄 無人稼働のための自己修復（Auto-Retry）型 AI生成関数
// ============================================================================
async function generateWithRetry(item: any, maxRetries = 3) {
    // 💡 毎日ランダムな「執筆の状況設定」を注入（マンネリ化防止）
    // ⚠️ これは「書き出しのラベル」ではなく「トーンの方向性」として使う
    const writingContextsJp = [
        "午後の外来が一段落した後、ふと今日の診察を振り返って書くメモのような文体",
        "学会の最新レポートに目を通した直後、同僚に口頭で伝えるようなカジュアルさ",
        "患者さんから受けた質問を起点に、自分の考えを整理するような内省的な文体",
        "論文の査読を終えた後、Twitterの下書きに殴り書きするような簡潔さ",
        "後輩ドクターに教えるとき、堅苦しくならないように意識して話す感じ",
        "週末の朝、コーヒーを飲みながらふと考えたことをメモするような穏やかさ"
    ];
    const writingContextsEn = [
        "Writing as if explaining to a colleague over coffee after rounds",
        "Reflecting on a patient question, sharing insights casually",
        "Reviewing recent literature and distilling one key takeaway",
        "Jotting down thoughts after a conference session in an informal tone",
        "Explaining a nuance to a medical resident in a mentoring tone"
    ];
    const ctxIndex = Math.floor(Math.random() * writingContextsJp.length);
    const ctxIndexEn = Math.floor(Math.random() * writingContextsEn.length);

let prompt = `
あなたは生殖医療専門医・佐藤琢磨のゴーストライターです。

🎯 最も重要な指示:
投稿は「医師がスマホで気軽に呟いた」ように見えなければなりません。
AIが書いた教科書的な文章は絶対にNGです。

【発信テーマ】
- JP: ${item.theme || '未定'} / EN: ${item.theme || 'N/A'}
- 関連キーワード（参考）: ${item.searchKeywords || 'なし'}
- エビデンス元: ${item.referenceUrl || 'なし'}

【本日の文体設定（ラベルとして挿入しないこと）】
JP: ${writingContextsJp[ctxIndex]}
EN: ${writingContextsEn[ctxIndexEn]}
上記はあくまで「書くときの気分」です。【】で囲んだラベルやカテゴリ名を書き出しに使わないでください。

━━━━━━━━━━━━━━━━━━━
🚫 AI臭さ排除ルール（最重要）
━━━━━━━━━━━━━━━━━━━

以下は過去に実際に生成されたNGパターンです。これらと同じ構造の文を絶対に書かないでください。

■ NG例 → OK例（日本語）

NG:「【誤解の訂正】「生理痛は我慢するもの」という思い込みは、医学的には適切ではありません。」
→ なぜNG: 【】のラベル付き書き出し＋「医学的には適切ではありません」は教科書の文体。
OK:「生理痛は我慢するもの、と思っている人がまだ多い。でも最近の研究データを見ると、その認識はちょっと違う。🧵👇」

NG:「自身の痛みと向き合い、適切な医療を受ける選択肢を知ることが大切です。」
→ なぜNG: 「大切です」「適切な」はAI頻出ワード。説教調。
OK:「気になる症状があれば、婦人科で一度聞いてみるだけでも見える景色が変わります。」

NG:「〜という側面がある」「〜は適切ではありません」「〜という報告があります」の連発
→ なぜNG: 同じ語尾パターンの繰り返し。人間は文末を毎回変える。
OK: 文末を「〜らしい。」「〜だった。」「〜かもしれない。」「〜なんですよね。」と混ぜる。

■ 追加の禁止表現リスト:
「重要」「大切」「必見」「応援」「寄り添い」「〜を知ることが大切」
「適切な」「不安になりますよね」「〜をご存知ですか？」
「結論から言うと」「重要なポイントは」「一緒に歩んでいきましょう」
「【◯◯の訂正】」「【◯◯のポイント】」のようなラベル付き書き出し

■ 推奨する自然な書き出しの実例:
・「排卵日がベストタイミング、と思っている方が多いけど、実はちょっとズレてる。🧵👇」
・「AMHの数値だけで卵巣の未来が決まるわけではない。そのあたりを整理してみた。🧵👇」
・「外来で『卵子凍結っていつまでにすればいいですか』と聞かれることが増えた。データをまとめます。🧵👇」
・「よく誤解されるんだけど、基礎体温だけでは排卵の有無はわからない。🧵👇」

━━━━━━━━━━━━━━━━━━━
⚖️ 医療コンプライアンス自己検閲
━━━━━━━━━━━━━━━━━━━
必ず「thoughtProcess」で以下をチェック:

■ レッドライン（絶対禁止）:
  - 虚偽・誇大:「必ず妊娠できる」「100%」「奇跡の」「画期的な」
  - 比較広告:「他院より」「最高の」「日本一」
  - 恐怖を煽る:「手遅れ」「取り返しがつかない」「危険です」
  - 体験談の捏造、効果の断定、未承認治療の推奨

■ イエローライン（注意）:
  - 統計→出典を添える　- 年齢→「個人差あり」を添える

━━━━━━━━━━━━━━━━━━━
📱 スレッド構成
━━━━━━━━━━━━━━━━━━━

各言語3ツイート構成。

■ ツイート1（Hook / リンク禁止）
  いきなり事実か問いかけから入る。挨拶や名乗り不要。末尾「🧵👇」
  ※ 1ツイート目にURLを入れるとXのアルゴリズムで表示激減するため厳禁。

■ ツイート2（Fact / リンク禁止）
  データや具体的な数字で深掘りする。

■ ツイート3（CTA + Source / リンクはここだけ）
  控えめにLPへ誘導。
  ・JPの場合:「このあたり、もう少し詳しくまとめています→ ${LP_URL_JP}」のような自然な文で。
  ・ENの場合: ${LP_URL_EN}
  ・ソースURLは「Ref: https://〜」の形式で簡潔に。
  ・ハッシュタグは1つだけ。

━━━━━━━━━━━━━━━━━━━
⚕️ 医療コンテンツ品質ガイドライン（厳守）
━━━━━━━━━━━━━━━━━━━

1. 感情的フックの禁止（CRITICAL）:
   「後悔する前に」「手遅れ」「知らないと怖い」などの恐怖喚起ワードは即座に削除。
   代わりに「知っておくと選択肢が増える事実」というポジティブな文脈で書くこと。
   NG: 「知らないと後悔する卵子のこと」
   OK: 「卵子について、外来でよく聞かれる質問をまとめてみた🧵」

2. 慎重な語尾の使い分け:
   - 確立された医学的事実 → 「〜です」「〜とされています」
   - 研究途上・個人差あり → 「〜という報告もあります」「〜の可能性があります」
   - 医師の個人的見解 → 「〜と感じています」「外来ではよく〜と伝えています」

3. 主語の最適化:
   「あなたは〜すべき」は使わない。
   OK: 「臨床現場では〜が推奨されている」「データでは〜が示唆されている」

4. エビデンス表記:
   統計・数字を使う場合は出典を文中に添えること（「ACOGの指針では」etc.）

【文字数】JP: 各130文字以内 / EN: 各270文字以内

【出力形式（厳守・JSON以外の文字を一切出力しない）】
\`\`\`
{
  "thoughtProcess": "コンプライアンスチェック結果と文体の工夫メモ",
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
                    prompt += `\n\n【警告】前回の出力はJSONとしてパースできませんでした。必ず有効なJSONのみを出力してください。markdown装飾や説明文は不要です。必ず jpXPostThread と enXPostThread の両方とも含めてください。`;
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
                        prompt += `\n\n【警告】前回の出力はJSONとしてパースできませんでした。必ず有効なJSONのみを出力してください。必ず jpXPostThread と enXPostThread の両方とも含めてください。`;
                        continue;
                    }
                } else {
                    console.warn(`⚠️ Attempt ${attempt}: No JSON found in response`);
                    if (attempt === maxRetries) throw new Error(`No JSON found in AI response after ${maxRetries} attempts`);
                    prompt += `\n\n【警告】前回の出力にJSONが含まれていませんでした。必ず指定のJSON形式(jpXPostThreadとenXPostThread)で出力してください。`;
                    continue;
                }
            }
        }

        // 必須フィールドチェック
        if (!result.jpXPostThread || !result.enXPostThread) {
            console.warn(`⚠️ Attempt ${attempt}: Missing required fields`);
            if (attempt === maxRetries) throw new Error(`Missing jpXPostThread or enXPostThread after ${maxRetries} attempts`);
            prompt += `\n\n【警告】出力に jpXPostThread または enXPostThread が含まれていません。JSON形式を厳守し、必ず両方の配列を再出力してください。`;
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
        prompt += `\n\n【警告】前回の出力はXの文字数制限を超過しました(原因: ${errorMessage})。リンクは削らず、テキスト部分をもっと短く簡潔に修正し、必ず jpXPostThread と enXPostThread の両方を含む完全なJSON形式で再出力してください。`;
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

    const dt = new Date(new Date().getTime() + 9 * 3600 * 1000);
    const todayStr = process.env.TARGET_DATE || dt.toISOString().split('T')[0];
    const brand = process.env.BRAND || 'book';

    console.log(`📅 Target Date: ${todayStr} | Brand: ${brand}`);

    const item = await getThemeSchedule(todayStr, brand);
    if (!item) {
        console.log(`🟢 The ThemeSchedule has no data for Date: ${todayStr} / Brand: ${brand}.`);
        process.exit(0);
    }

    if (item.status === 'done' || item.status === 'posted') {
        console.log(`🟢 The ThemeSchedule for ${todayStr} is already processed (${item.status}).`);
        process.exit(0);
    }

    console.log(`\n📋 Processing Date [${todayStr}]: ${item.theme}`);
    console.log(`🔗 Primary Source URL: ${item.referenceUrl || 'なし'}`);

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
            await updateThemeScheduleStatus(item.rowNumber, "posted");
        } else {
            // ローカルで成功したというマーク
            await updateThemeScheduleStatus(item.rowNumber, "generated");
            console.log("✅ Marked as 'generated' locally due to Twitter API failure (or running locally).");
        }

        console.log("\n🎉 Fully Automated Posting complete!");

    } catch (err: any) {
        console.error("❌ Fatal Error processing X generation:", err);
        process.exit(1);
    }
}

main();
