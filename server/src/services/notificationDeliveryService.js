import { getPrismaClient } from '../config/database.js';

/**
 * BLOODBRIDGE Notification Delivery Service
 * Manages Multi-channel Notification Dispatch:
 * - Persistent In-App Database Notifications
 * - Transactional Email (Resend)
 * - Transactional SMS (Sparrow SMS / Nepal SMS Gateways)
 */
export const notificationDeliveryService = {
  /**
   * Dispatches an in-app notification with optional transactional email/SMS escalation
   */
  async notify({
    userId,
    title,
    message,
    category = 'SYSTEM',
    actionPath = null,
    recipientEmail = null,
    recipientPhone = null,
    emailSubject = null,
  }) {
    const results = {
      inApp: false,
      email: { sent: false, provider: 'none', reason: null },
      sms: { sent: false, provider: 'none', reason: null },
    };

    try {
      const prisma = await getPrismaClient();

      // 1. In-App Notification (Authoritative database record)
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title,
            message,
            category,
            actionPath,
            read: false,
          },
        });
        results.inApp = true;
      }

      // 2. Transactional Email via Resend
      if (recipientEmail) {
        results.email = await this.sendEmail({
          to: recipientEmail,
          subject: emailSubject || title,
          body: message,
          actionPath,
        });
      }

      // 3. Transactional SMS for Nepal (+977)
      if (recipientPhone) {
        results.sms = await this.sendSms({
          phone: recipientPhone,
          text: `[BLOODBRIDGE Nepal] ${title}: ${message}`,
        });
      }

      return results;
    } catch (err) {
      console.error('[NotificationDeliveryService Error]', err);
      return results;
    }
  },

  /**
   * Resend Transactional Email Gateway
   */
  async sendEmail({ to, subject, body, actionPath }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || 'notifications@bloodbridge.np';

    if (!apiKey) {
      return {
        sent: false,
        provider: 'resend',
        reason: 'RESEND_API_KEY not configured in environment (logged to audit)',
      };
    }

    try {
      const payload = {
        from,
        to: [to],
        subject: `BLOODBRIDGE Nepal · ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="color: #dc2626; font-size: 18px; font-weight: bold; margin-bottom: 12px;">BLOODBRIDGE Nepal</div>
            <h2 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${subject}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">${body}</p>
            ${
              actionPath
                ? `<div style="margin-top: 20px;"><a href="${process.env.APP_URL || 'http://localhost:3000'}${actionPath}" style="background-color: #dc2626; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Open Workspace</a></div>`
                : ''
            }
            <div style="margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Voluntary Blood Donor Network · Connecting Lives, One Donation at a Time.
            </div>
          </div>
        `,
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { sent: true, provider: 'resend', messageId: data.id };
      } else {
        const errText = await response.text();
        return { sent: false, provider: 'resend', reason: `API HTTP ${response.status}: ${errText}` };
      }
    } catch (err) {
      return { sent: false, provider: 'resend', reason: err.message };
    }
  },

  /**
   * Nepal SMS Gateway (Sparrow SMS / Telco Webhook)
   */
  async sendSms({ phone, text }) {
    const token = process.env.SPARROW_SMS_TOKEN;
    const from = process.env.SPARROW_SMS_FROM || 'BloodBridge';

    if (!token) {
      return {
        sent: false,
        provider: 'sparrow_sms',
        reason: 'SPARROW_SMS_TOKEN not configured in environment (logged to audit)',
      };
    }

    try {
      // Clean phone number to 10-digit mobile for Nepal (e.g., 98xxxxxxxx)
      const sanitizedPhone = phone.replace(/[^\d]/g, '').slice(-10);

      const params = new URLSearchParams({
        token,
        from,
        to: sanitizedPhone,
        text,
      });

      const response = await fetch(`http://api.sparrowsms.com/v2/sms/?${params.toString()}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        return { sent: true, provider: 'sparrow_sms', response: data };
      } else {
        return { sent: false, provider: 'sparrow_sms', reason: `SMS gateway returned HTTP ${response.status}` };
      }
    } catch (err) {
      return { sent: false, provider: 'sparrow_sms', reason: err.message };
    }
  },
};
