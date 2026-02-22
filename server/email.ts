import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SportConnect <noreply@sportconnect.app>';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

export async function sendNotificationEmail(opts: {
  to: string;
  subject: string;
  body: string;
  userName?: string;
}): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.log('[Email] Resend not configured — skipping email to', opts.to);
    return false;
  }

  try {
    const greeting = opts.userName ? `Hi ${opts.userName},` : 'Hi,';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #e8a849; margin: 0; font-size: 20px;">SportConnect</h1>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">${greeting}</p>
          <p style="color: #374151; font-size: 16px;">${opts.body}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">You're receiving this because you have email notifications enabled on SportConnect. You can change this in your account settings.</p>
        </div>
      </div>
    `;

    await client.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}
