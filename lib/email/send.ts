/**
 * Transactional email sending. Uses Resend when RESEND_API_KEY is set.
 * Sends asynchronously so the main request is not blocked.
 */

import { Resend } from "resend";

const FROM_EMAIL = process.env.EMAIL_FROM ?? "GE Auto Import <noreply@example.com>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): void {
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Email] Would send to", options.to, "subject:", options.subject);
    }
    return;
  }

  setImmediate(() => {
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      })
      .then((r) => {
        if (r.error) console.error("[Email] Send error:", r.error);
      })
      .catch((err) => console.error("[Email] Send failed:", err));
  });
}
