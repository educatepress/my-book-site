/**
 * Shared retry utility for all cron endpoints.
 * Exponential backoff with jitter for Gemini 503 / Sheets quota / Slack rate limits.
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 5000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  onRetry: () => {},
};

/**
 * Execute an async function with exponential backoff retry.
 * Retries on: Gemini 503, Sheets 429, network errors, etc.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  opts?: RetryOptions
): Promise<T> {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === options.maxAttempts;
      const statusCode = error?.status || error?.statusCode || 0;
      const isRetryable =
        options.retryableStatuses.includes(statusCode) ||
        error?.message?.includes('503') ||
        error?.message?.includes('429') ||
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('high demand') ||
        error?.message?.includes('ECONNRESET') ||
        error?.message?.includes('ETIMEDOUT') ||
        error?.message?.includes('fetch failed');

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        options.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000,
        options.maxDelayMs
      );

      console.warn(
        `⚠️ [${label}] Attempt ${attempt}/${options.maxAttempts} failed (${error.message?.substring(0, 80)}). Retrying in ${Math.round(delay / 1000)}s...`
      );
      options.onRetry(attempt, error, delay);

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // TypeScript: unreachable but satisfies compiler
  throw new Error(`[${label}] All ${options.maxAttempts} attempts failed`);
}

/**
 * Send a Slack error alert when a cron job fails after all retries.
 */
export async function sendSlackErrorAlert(
  slackToken: string,
  channel: string,
  cronName: string,
  errorMessage: string
): Promise<void> {
  if (!slackToken || !channel) return;

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${slackToken}`,
      },
      body: JSON.stringify({
        channel,
        text: `🚨 *Cron障害: ${cronName}*\n\`\`\`${errorMessage.substring(0, 500)}\`\`\`\nVercel Logsを確認してください。`,
      }),
    });
  } catch {
    // Slack alert itself failing should not propagate
    console.error(`❌ Failed to send Slack error alert for ${cronName}`);
  }
}
