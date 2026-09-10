import axios from 'axios';
import { prisma } from '../prisma';

export interface ReactionWebhookData {
  postId: string;
  userId: string;
  reactionType: string | null;
  totalReactions: number;
}

export interface CommentWebhookData {
  postId: string;
  commentId: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  totalComments: number;
}

class ThirdPartySyncService {
  private getTargetUrl(): string | undefined {
    return process.env.THIRD_PARTY_API_URL;
  }

  private getAuthHeader(): Record<string, string> {
    const key = process.env.THIRD_PARTY_API_KEY;
    if (key && key.trim() !== '') {
      return {
        Authorization: `Bearer ${key.trim()}`,
      };
    }
    return {};
  }

  /**
   * Dispatches an outbound webhook event asynchronously in a non-blocking manner.
   * Catches all network/remote errors and records delivery diagnostics in WebhookLog.
   */
  public async dispatchEvent(event: string, data: Record<string, unknown>): Promise<void> {
    const targetUrl = this.getTargetUrl();
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);

    // If no target URL configured, record log as skipped
    if (!targetUrl || targetUrl.trim() === '') {
      console.log(`[Webhook Engine] Skipping "${event}": No THIRD_PARTY_API_URL configured.`);
      try {
        await prisma.webhookLog.create({
          data: {
            eventType: event,
            payload: payloadString,
            responseStatus: null,
            error: 'THIRD_PARTY_API_URL not configured',
          },
        });
      } catch (dbErr) {
        console.error('[Webhook Engine] Failed to record skipped webhook log:', dbErr);
      }
      return;
    }

    // Fire non-blocking request
    setImmediate(async () => {
      let status: number | null = null;
      let errorMessage: string | null = null;

      try {
        console.log(`[Webhook Engine] Dispatching "${event}" to ${targetUrl}...`);
        const response = await axios.post(targetUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MockFacebook-WebhookEngine/1.0',
            ...this.getAuthHeader(),
          },
          timeout: 5000, // 5s timeout
        });
        status = response.status;
        console.log(`[Webhook Engine] Successfully delivered "${event}" (HTTP ${status})`);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          status = error.response?.status || null;
          errorMessage = error.message;
          console.warn(`[Webhook Engine] Failed dispatching "${event}" to ${targetUrl}: HTTP ${status || 'No Response'} - ${error.message}`);
        } else if (error instanceof Error) {
          errorMessage = error.message;
          console.warn(`[Webhook Engine] Error dispatching "${event}":`, error.message);
        } else {
          errorMessage = 'Unknown webhook dispatch error';
        }
      } finally {
        // Record into WebhookLog table
        try {
          await prisma.webhookLog.create({
            data: {
              eventType: event,
              payload: payloadString,
              responseStatus: status,
              error: errorMessage,
            },
          });
        } catch (logErr) {
          console.error('[Webhook Engine] Could not write to WebhookLog:', logErr);
        }
      }
    });
  }

  public dispatchReactionUpdated(data: ReactionWebhookData): void {
    this.dispatchEvent('post.reaction_updated', data as unknown as Record<string, unknown>);
  }

  public dispatchCommentCreated(data: CommentWebhookData): void {
    this.dispatchEvent('post.comment_created', data as unknown as Record<string, unknown>);
  }
}

export const thirdPartySync = new ThirdPartySyncService();
