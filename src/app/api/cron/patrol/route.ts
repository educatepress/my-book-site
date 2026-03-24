// =============================================================
// Site Patrol — AI品質巡回スクリプト（最終版）
// ファイルパス: app/api/cron/patrol/route.ts
// =============================================================
// npm install cheerio @anthropic-ai/sdk

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';

// ── 環境変数（Vercelダッシュボードで設定） ──────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

// ── 巡回対象サイト ──────────────────────────────────────────
const TARGETS = [
  {
    name: 'doctors-guide',
    sitemap: 'https://doctors-guide-womens-health.vercel.app/sitemap.xml',
    filter: (_url: string) => true, // 全ページ対象（LP含む）
  },
  {
    name: 'ttcguide',
    sitemap: 'https://ttcguide.co/sitemap.xml',
    filter: (url: string) => url.includes('/blog/'),
  },
];

// ── AIモデル設定 ────────────────────────────────────────────
const AI_MODEL = 'claude-3-5-sonnet-20241022';

// ── 校閲プロンプト（system） ────────────────────────────────
const SYSTEM_PROMPT = `あなたは医療情報サイトの厳格な校閲者です。
公開前の最終チェックとして記事を検証してください。

【サイトの方針】
- 著者: 生殖医療専門医・佐藤琢磨
- 読者: 20〜30代女性（妊娠・ライフプランに関心）
- トーン: 専門家が寄り添いながら冷静に解説する姿勢

【検証項目（7項目）】
1. 購入促進の違和感: 本文の解説トーンから急に書籍セールスに切り替わる箇所はないか。特に三人称で著者自身を推薦する表現に注意。
2. 口調のブレ: 「私が」「筆者は」など一人称の使い方が記事内で一貫しているか。
3. 過度な断定: 「科学的に証明されています」などエビデンス引用なしの断定表現はないか。
4. 「あなた」の多用: 1記事内で「あなた」が5回以上出現していないか（日本語では押し付けがましい）。
5. 結び文のテンプレ化: 「漠然とした不安→確かな知識→未来をデザイン」のパターンに該当するか。
6. 不自然な日本語: 機械翻訳調や直訳的な言い回しはないか。
7. 医療用語の過不足: 読者層に対して専門用語が説明なく使われていないか。

【出力形式】
- 問題ありの場合: 項目番号・該当箇所の引用・修正提案を簡潔に。最大5件まで。
- 全て問題なしの場合: 「異常なし」のみ出力。`;

// ── 型定義 ──────────────────────────────────────────────────
interface PageReport {
  url: string;
  site: string;
  structuralErrors: string[];
  aiFeedback: string | null;
}

// ── メインハンドラ ──────────────────────────────────────────
export async function GET(request: Request) {
  // 1. Cron認証
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const allIssues: PageReport[] = [];
  let totalCrawled = 0;

  try {
    // ── サイトごとに巡回 ──────────────────────────────────
    for (const target of TARGETS) {
      let targetUrls: string[] = [];

      // 2. サイトマップ取得
      try {
        const sitemapRes = await fetch(target.sitemap, {
          signal: AbortSignal.timeout(10000),
        });
        if (!sitemapRes.ok) {
          allIssues.push({
            url: target.sitemap,
            site: target.name,
            structuralErrors: [`🔴 サイトマップ取得失敗 (HTTP ${sitemapRes.status})`],
            aiFeedback: null,
          });
          continue;
        }
        const sitemapXml = await sitemapRes.text();
        const $xml = cheerio.load(sitemapXml, { xmlMode: true });
        $xml('loc').each((_, el) => {
          const url = $xml(el).text();
          if (target.filter(url)) targetUrls.push(url);
        });
      } catch (sitemapError) {
        allIssues.push({
          url: target.sitemap,
          site: target.name,
          structuralErrors: [
            `🔴 サイトマップ接続エラー: ${sitemapError instanceof Error ? sitemapError.message : 'Unknown'}`,
          ],
          aiFeedback: null,
        });
        continue;
      }

      // 3. 各ページの巡回
      for (const url of targetUrls) {
        try {
          console.log(`🔍 [${target.name}] 監査中: ${url}`);

          // タイムアウト付きfetch
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const pageRes = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          if (!pageRes.ok) {
            allIssues.push({
              url,
              site: target.name,
              structuralErrors: [`🔴 HTTP ${pageRes.status} — ページ取得失敗`],
              aiFeedback: null,
            });
            continue;
          }

          const html = await pageRes.text();
          const $ = cheerio.load(html);
          const structuralErrors: string[] = [];
          let aiFeedback: string | null = null;

          // ====================================================
          // 【A】構造チェック（プログラムで100%確実に検知）
          // ====================================================
          const headingTexts = $('h2, h3, h4')
            .map((_, el) => $(el).text().trim())
            .get();

          const bodyText = $('main, article, .prose').text().toLowerCase();

          // --- Markdown生レンダリング検知 ---
          const hasRawMarkdown =
            bodyText.includes('---\ntitle:') ||
            bodyText.includes('---\ndate:') ||
            $('code:contains("---"), pre:contains("title:")').length > 0;

          if (hasRawMarkdown) {
            structuralErrors.push('🔴 Markdownフロントマターが生テキストとして表示されています');
          }

          // --- H1タイトル空白検知 ---
          const h1Text = $('h1').first().text().trim();
          if ($('h1').length === 0 || h1Text.length === 0) {
            structuralErrors.push('🔴 H1タイトルが空白または存在しません');
          }

          // --- ブログ記事のみの追加チェック ---
          if (url.includes('/blog/') && !url.endsWith('/blog') && !url.endsWith('/blog/')) {
            // FAQ有無
            const hasFAQ =
              headingTexts.some((t) => /FAQ|よくある質問|Q&A|Q\d/.test(t)) ||
              bodyText.includes('よくある質問');

            if (!hasFAQ) {
              structuralErrors.push('❌ FAQセクションが見つかりません');
            }

            // References有無
            const hasReferences =
              headingTexts.some((t) => /参考|References|出典|引用/.test(t)) ||
              $('a[href*="doi.org"], a[href*="pubmed"], a[href*="asrm.org"]').length > 0;

            if (!hasReferences) {
              structuralErrors.push('❌ 参考文献(References)セクションがありません');
            }
          }

          // --- 著者名表記の統一チェック ---
          const fullText = $('body').text();
          const authorVariants = [
            { pattern: /佐藤\s+琢磨/, label: 'スペースあり' },
            { pattern: /佐藤琢磨（/, label: '括弧付き肩書' },
          ];
          const foundVariants = authorVariants.filter((v) => v.pattern.test(fullText));
          if (foundVariants.length > 0) {
            structuralErrors.push(
              `⚠️ 著者名の表記ブレ検知: ${foundVariants.map((v) => v.label).join(', ')}`
            );
          }

          // ====================================================
          // 【B】テキスト品質チェック（Claude API）
          // ====================================================
          $('nav, header, footer, script, style, aside, .author-bio').remove();
          const mainText = $('main, article, .prose, .blog-content')
            .text()
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 6000);

          if (mainText.length > 100) {
            try {
              const msg = await anthropic.messages.create({
                model: AI_MODEL,
                max_tokens: 500,
                temperature: 0,
                system: SYSTEM_PROMPT,
                messages: [
                  {
                    role: 'user',
                    content: `以下の記事を検証してください。\n\n【URL】${url}\n【テキスト】\n${mainText}`,
                  },
                ],
              });

              const resultText = msg.content[0].type === 'text' ? msg.content[0].text : '';
              if (!resultText.includes('異常なし')) {
                aiFeedback = resultText;
              }
            } catch (aiError) {
              console.error(`AI分析エラー (${url}):`, aiError);
              // AI失敗は構造チェック結果のみで続行
            }
          }

          // エラーがあればレポートに追加
          if (structuralErrors.length > 0 || aiFeedback) {
            allIssues.push({ url, site: target.name, structuralErrors, aiFeedback });
          }

          totalCrawled++;

          // APIレートリミット対策
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } catch (pageError) {
          allIssues.push({
            url,
            site: target.name,
            structuralErrors: [
              `🔴 巡回エラー: ${pageError instanceof Error ? pageError.message : 'Unknown'}`,
            ],
            aiFeedback: null,
          });
          totalCrawled++;
        }
      }
    }

    // ====================================================
    // 4. 差分判定（将来拡張ポイント）
    // ====================================================
    // TODO: Supabase/Vercel KVから前回レポートを取得し、
    //       新規エラーのみを抽出する差分ロジックを追加
    // const prevReport = await kv.get('patrol:latest');
    // const newIssues = diffReports(prevReport, allIssues);
    // await kv.set('patrol:latest', allIssues);
    const newIssues = allIssues;

    // ====================================================
    // 5. Slack通知（Block Kit形式）
    // ====================================================
    if (newIssues.length > 0 && SLACK_WEBHOOK_URL) {
      const blocks: any[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🛡️ Site Patrol — ${newIssues.length}件検知`,
          },
        },
        { type: 'divider' },
      ];

      for (const report of newIssues) {
        // 構造エラー
        if (report.structuralErrors.length > 0) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${report.url}*\n${report.structuralErrors.join('\n')}`,
            },
          });
        }

        // AI校閲
        if (report.aiFeedback) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `💬 *AI校閲:*\n${report.aiFeedback.slice(0, 2500)}`,
            },
          });
        }

        blocks.push({ type: 'divider' });
      }

      // サマリー行
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `巡回: ${totalCrawled}ページ ｜ 検知: ${newIssues.length}件 ｜ ${new Date().toLocaleDateString('ja-JP')}`,
          },
        ],
      });

      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
    }

    // ====================================================
    // 6. レスポンス
    // ====================================================
    return NextResponse.json({
      status: newIssues.length === 0 ? 'all_clear' : 'issues_found',
      crawledPages: totalCrawled,
      issuesFound: newIssues.length,
      issues: newIssues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Patrol Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', detail: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
