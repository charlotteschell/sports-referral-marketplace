import { Resend } from "resend";

// Lazy-init Resend client only when API key is available
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SportConnect <notifications@sportconnect.app>";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string; // Plain text body
  html?: string; // Optional HTML body
};

/**
 * Send an email notification via Resend.
 * Returns true if sent successfully, false if email service is not configured or fails.
 * Never throws — callers should treat email as best-effort.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.info("[Email] Resend API key not configured — skipping email delivery");
    return false;
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      html: payload.html || formatHtmlEmail(payload.subject, payload.body),
    });

    if (error) {
      console.warn("[Email] Resend API error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[Email] Failed to send email:", err);
    return false;
  }
}

/**
 * Format a simple HTML email from plain text content.
 */
function formatHtmlEmail(subject: string, body: string): string {
  const escapedBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#3d2e1e;padding:24px 32px;">
              <h1 style="margin:0;color:#f5a623;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                ⚡ SPORTCONNECT
              </h1>
              <p style="margin:4px 0 0;color:#c4a882;font-size:12px;">
                The referral network for endurance sports businesses
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#3d2e1e;font-size:20px;">${subject}</h2>
              <div style="color:#5a4a3a;font-size:15px;line-height:1.6;">
                ${escapedBody}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f5f0;padding:20px 32px;border-top:1px solid #e8ddd0;">
              <p style="margin:0;color:#8a7a6a;font-size:12px;text-align:center;">
                You're receiving this because of your notification preferences on SportConnect.
                <br>Update your preferences in your Account Settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
