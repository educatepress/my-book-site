import dotenv from 'dotenv';
// envを読み込む（.env.localを優先）
dotenv.config({ path: '.env.local' });
dotenv.config();

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// 設定値
const SITE_URL = 'https://www.ttcguide.co';
const QUEUE_PATH = path.join(process.cwd(), 'scripts/content-gen/content-queue.json');
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog/jp');
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID || '#ttcpreconception_co';

// 初期設定
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JST_DATE = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
const TODAY_STR = JST_DATE.toISOString().split('T')[0];

console.log(`=== 🕵️ TTC Guide AI Patrol Started (${TODAY_STR}) ===`);

interface PatrolReport {
    status: 'success' | 'warning' | 'error';
    siteHealth: string;
    xPosting: string;
    medicalReview: string;
    latestSlug?: string;
    sitemapPing?: string;
}

const report: PatrolReport = {
    status: 'success',
    siteHealth: '...チェック中',
    xPosting: '...チェック中',
    medicalReview: '...チェック中',
    sitemapPing: '...チェック中',
};

async function checkSiteHealth() {
    try {
        console.log('🌍 Checking site health...');
        const res = await fetch(`${SITE_URL}/blog`);
        if (res.ok) {
            report.siteHealth = '✅ 正常稼働 (200 OK)';
        } else {
            throw new Error(`HTTP Status ${res.status}`);
        }
    } catch (err: any) {
        report.siteHealth = `🚨 エラー: ブログ一覧画面の表示に失敗しました (${err.message})`;
        report.status = 'error';
    }
}

async function checkXPosting() {
    report.xPosting = '✅ X(Twitter)投稿監視は新サーバー（post-patrol）へ移行完了';
    report.status = report.status === 'error' ? 'error' : 'success';
}

async function checkMedicalContent() {
    try {
        console.log('🩺 Performing medical review of the latest post...');
        
        // 最も新しいブログ記事（MDX）を取得
        const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
        if (files.length === 0) {
            report.medicalReview = '⚠️ 記事が見つかりません。';
            return;
        }

        // 最新のファイルを更新日時で取得
        const sortedFiles = files.map(f => {
            const p = path.join(BLOG_DIR, f);
            return { path: p, stat: fs.statSync(p), slug: f.replace('.mdx', '') };
        }).sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
        
        const latestContent = fs.readFileSync(sortedFiles[0].path, 'utf8');
        const latestSlug = sortedFiles[0].slug;

        report.latestSlug = latestSlug;

        // MDXの記事がすでに生成された直後という前提
        // Gemini に送る
        const prompt = `
あなたはクリニックの最高医療責任者（CMO）であり、非常に厳格なコンプライアンス担当者です。
当サイト（プレコンセプションケア・不妊治療・妊娠に関するWebメディア）に新しく投稿された以下のブログ記事の内容に、
「医学的に怪しい点（過剰な効果の保証、エビデンスのない断言、患者に誤解を与える不適切な表現）」がないかを厳格にチェックしてください。

ルール：
1. 「必ず妊娠する」「これを飲めば100%治る」のような断定的な表現は完全にアウトです。
2. サプリメント（葉酸、CoQ10等）に関して、効能効果を過大に謳っている箇所があれば指摘してください。
3. もし問題が見つからなければ、「問題なし。コンプライアンス基準をクリアしています。」と短く結論を述べてください。
4. 問題がある場合は、「【要確認】」という見出しで、どの記述がなぜ問題なのかを簡潔にまとめてください。
5. 出力は短く（200文字以内）で、Slackへの報告用メッセージとしてそのまま使える日本語にしてください。

---記事内容ここから---
${latestContent}
---記事内容ここまで---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const reviewResult = response.text || 'レビュー結果を取得できませんでした。';
        report.medicalReview = reviewResult.replace(/\n+/g, ' '); // 改行をスペースに置換してスッキリさせる

        // もし「要確認」等の文字列があれば警告扱い
        if (reviewResult.includes('要確認') || reviewResult.includes('問題あり')) {
            report.status = report.status === 'error' ? 'error' : 'warning';
        }

    } catch (err: any) {
        report.medicalReview = `🚨 エラー: AIレビュー実行に失敗 (${err.message})`;
        report.status = 'error';
    }
}

async function pingSitemap() {
    report.sitemapPing = '✅ サイトマップ検索エンジン連携はNext.js側で自動処理済';
}

async function notifySlack() {
    console.log('📣 Sending Slack notification...');
    
    if (!SLACK_BOT_TOKEN) {
        console.error('⚠️ SLACK_BOT_TOKEN is not set. Skipping Slack notification.');
        return;
    }

    const icon = report.status === 'success' ? '✅' : report.status === 'warning' ? '⚠️' : '🚨';
    const headerTitle = report.status === 'success' 
        ? "稼働パトロール報告：異常なし" 
        : "異常検知：パトロールで問題が見つかりました";

    const message = {
        channel: SLACK_CHANNEL_ID,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `${icon} ${headerTitle} (${TODAY_STR})`,
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*1. サイト死活監視*\n${report.siteHealth}`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*2. X (Twitter) 投稿状況*\n${report.xPosting}`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*3. インデックス自動送信*\n${report.sitemapPing}`
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*4. AI医学・コンプライアンスレビュー* (対象: \`${report.latestSlug || 'Unknown'}\`)\n> ${report.medicalReview}`
                }
            }
        ]
    };

    if (report.status !== 'success') {
       message.blocks.push({
           type: "section",
           text: {
               // @channel で全体通知
               type: "mrkdwn",
               text: "<!channel> 🚨 問題が検知されました。至急確認してください！"
           }
       });
    }

    try {
        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            body: JSON.stringify(message),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            },
        });

        const data = await response.json();
        if (!data.ok) {
            console.error(`❌ Slack postMessage failed: ${data.error}`);
        } else {
            console.log(`✅ Slack notification sent successfully!`);
        }
    } catch (error) {
         console.error(`❌ Slack notification error:`, error);
    }
}

async function run() {
    await checkSiteHealth();
    await checkXPosting();
    await checkMedicalContent();
    await pingSitemap();
    
    console.log('Patrol Report:', report);
    await notifySlack();

    // Workflowを失敗させるか
    if (report.status === 'error') {
        process.exit(1);
    }
}

run();
