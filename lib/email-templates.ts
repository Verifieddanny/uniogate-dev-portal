// Mirror of Backend/src/services/emailTemplates.ts for previewing.
// The backend embeds the logo as a CID attachment; here it's a normal
// image URL. Keep the markup in sync when the backend templates change.

const BRAND = {
  navy: '#1E3A8A',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#EEF0F7',
  white: '#FFFFFF',
};

const SUPPORT_EMAIL = 'support@uniogate.com';
const WEBSITE_URL = 'https://www.uniogate.com';

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function baseLayout({ preheader, bodyHtml, logoUrl }: { preheader: string; bodyHtml: string; logoUrl: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>UnioGate</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.bg}; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%;">
          <tr>
            <td style="padding:8px 8px 24px 8px;">
              <a href="${WEBSITE_URL}" style="text-decoration:none;">
                <img src="${logoUrl}" alt="UnioGate" height="32" style="height:32px; width:auto; border:0; display:inline-block;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.white}; border:1px solid ${BRAND.border}; border-radius:16px; padding:40px 40px 36px 40px; font-family:Arial,Helvetica,sans-serif;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 8px 8px; font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px 0; font-size:12px; line-height:18px; color:${BRAND.muted};">
                Need help? Reach us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.navy}; text-decoration:none;">${SUPPORT_EMAIL}</a>.
              </p>
              <p style="margin:0; font-size:12px; line-height:18px; color:${BRAND.muted};">
                &copy; ${new Date().getFullYear()} UnioGate &middot; The stablecoin app for merchants.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const codeBox = (code: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td align="center" style="background-color:${BRAND.bg}; border:1px solid ${BRAND.border}; border-radius:12px; padding:22px 16px;">
          <span style="font-size:36px; font-weight:700; letter-spacing:10px; color:${BRAND.navy}; font-family:Arial,Helvetica,sans-serif;">${escapeHtml(code)}</span>
        </td>
      </tr>
    </table>`;

export function otpEmail(code: string, logoUrl: string): RenderedEmail {
  const preheader = `Your UnioGate verification code is ${code}`;
  const bodyHtml = `
    <h1 style="margin:0 0 12px 0; font-size:22px; line-height:28px; font-weight:700; color:${BRAND.text};">Verify your account</h1>
    <p style="margin:0 0 28px 0; font-size:15px; line-height:22px; color:${BRAND.muted};">
      Use the code below to continue. It keeps your UnioGate account secure.
    </p>
    ${codeBox(code)}
    <p style="margin:24px 0 0 0; font-size:14px; line-height:21px; color:${BRAND.muted};">
      This code expires in <strong style="color:${BRAND.text};">10 minutes</strong>. If you didn't request it, you can safely ignore this email &mdash; don't share the code with anyone.
    </p>`;
  return { subject: 'UnioGate - Your verification code', preheader, html: baseLayout({ preheader: escapeHtml(preheader), bodyHtml, logoUrl }) };
}

export function inviteEmail(opts: { businessName: string; code: string }, logoUrl: string): RenderedEmail {
  const name = escapeHtml(opts.businessName || 'a business');
  const preheader = `Join ${opts.businessName || 'a business'} on UnioGate as a sales representative`;
  const bodyHtml = `
    <h1 style="margin:0 0 12px 0; font-size:22px; line-height:28px; font-weight:700; color:${BRAND.text};">You're invited to join ${name}</h1>
    <p style="margin:0 0 28px 0; font-size:15px; line-height:22px; color:${BRAND.muted};">
      ${name} has invited you to join their team on UnioGate as a
      <strong style="color:${BRAND.text};">sales representative</strong>. Enter the invite code below in the app to accept.
    </p>
    ${codeBox(opts.code)}
    <p style="margin:24px 0 0 0; font-size:14px; line-height:21px; color:${BRAND.muted};">
      This invite expires in <strong style="color:${BRAND.text};">10 minutes</strong>. If you weren't expecting it, you can safely ignore this email.
    </p>`;
  return {
    subject: `You've been invited to join ${opts.businessName || 'a business'} on UnioGate`,
    preheader,
    html: baseLayout({ preheader: escapeHtml(preheader), bodyHtml, logoUrl }),
  };
}
