import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export type PreAuditResult = {
  status: 'pass' | 'ng';
  reason?: string; 
};

// 医療広告ガイドライン＆トンマナ監査プロンプト
const PRE_AUDIT_PROMPT = `You are an elite compliance officer and medical editor specializing in Japanese Medical Advertising Guidelines (医療広告ガイドライン) and YMYL (Your Money or Your Life) content.
Your job is to strictly audit a drafted social media post or video script for a fertility clinic.

【CHECKLIST / RULES】
1. 絶対的な効果の保証の禁止 (No Guaranteed Results)
   - Do NOT allow words like "絶対" (absolutely), "確実" (guaranteed), "必ず" (without fail), "100%", "治る" (cure).
   - Must use hedging language like "可能性が高まる" (may increase the likelihood), "期待できる" (can be expected), "データが示している" (data suggests).
2. ビフォーアフターの表現規制 (Before/After Claims)
   - Do NOT allow sensational before/after claims without explicit scientific grounding or conditions.
3. 誇大広告や不安を煽る表現の禁止 (No Fear-Mongering or Exaggeration)
   - Do NOT allow words like "手遅れになる" (it will be too late), "後悔する" (you will regret), "危険" (dangerous - used loosely).
4. トンマナ (Brand Voice & Tone)
   - The tone must be "Warm, objective, authoritative, and empowering".
   - It should NOT be preachy or condescending.

【EVALUATION】
Evaluate the provided text.
If the text violates ANY of the rules above, you must return "ng" and provide a concise, sharp explanation in Japanese of what specifically violated the rules and how to fix it.
If the text passes all rules and is safe to publish, return "pass".

【OUTPUT FORMAT】
You must return a valid JSON object EXCLUSIVELY. No markdown bounds or extra text.
{
  "status": "pass" | "ng",
  "reason": "If ng, explain why in Japanese. If pass, leave empty or null."
}
`;

/**
 * 事前パトロール（コンプライアンス監査）を実行する
 * @param content 監査対象のテキスト（台本、キャプション、ブログ本文など）
 * @returns 監査結果 { status: 'pass' | 'ng', reason?: string }
 */
export async function runPrePostAudit(content: string): Promise<PreAuditResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY is not set. Skipping pre-audit and forcing pass.');
    return { status: 'pass', reason: 'Audit skipped (No API key)' };
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 500,
    temperature: 0,
    system: PRE_AUDIT_PROMPT,
    messages: [
      {
        role: "user",
        content: `Please audit the following content:\n\n${content}`
      }
    ]
  });

  const replyText = response.content[0].type === 'text' ? response.content[0].text : '';
  
  try {
    const jsonStr = replyText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    const result = JSON.parse(jsonStr) as PreAuditResult;
    return result;
  } catch (error) {
    console.error('Failed to parse Claude audit result:', replyText);
    return { status: 'ng', reason: 'AI監査システムが不正なフォーマットを返しました。' };
  }
}
