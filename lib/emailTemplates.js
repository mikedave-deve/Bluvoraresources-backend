// lib/emailTemplates.js — HTML email templates
'use strict'

// ─── Shared brand colours (mirrors frontend tailwind theme) ───
const BRAND = {
  primary:    '#1e40af',
  primaryBg:  '#eff6ff',
  inkDark:    '#0f172a',
  inkMuted:   '#64748b',
  surface:    '#f8fafc',
  border:     '#e2e8f0',
  accent:     '#3b82f6',
  success:    '#10b981',
  successBg:  '#ecfdf5',
}

// ─── Shared wrapper ────────────────────────────────────────────
function wrap(title, bodyHtml) {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;">

          <!-- ── Header Bar ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,${BRAND.primary} 60%,#2563eb 100%);
                        padding:36px 40px 32px;border-radius:12px 12px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <!-- Logo lockup -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <div style="width:8px;height:36px;background:rgba(255,255,255,0.35);
                                      border-radius:4px;display:inline-block;margin-right:14px;
                                      vertical-align:middle;"></div>
                        </td>
                        <td style="vertical-align:middle;padding-left:4px;">
                          <p style="margin:0;font-size:19px;font-weight:700;color:#ffffff;
                                     letter-spacing:-0.4px;line-height:1;">
                            Bluvora Resources
                          </p>
                          <p style="margin:5px 0 0;font-size:11px;font-weight:500;
                                     color:rgba(255,255,255,0.55);letter-spacing:0.12em;
                                     text-transform:uppercase;">
                            Recruitment &amp; Staffing
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin:0;font-size:11.5px;color:rgba(255,255,255,0.6);
                               line-height:1.5;text-align:right;">
                      ${now}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── White card body ── -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 36px;
                        border-left:1px solid ${BRAND.border};
                        border-right:1px solid ${BRAND.border};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#f1f5f9;padding:22px 40px;
                        border:1px solid ${BRAND.border};border-top:none;
                        border-radius:0 0 12px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.7;text-align:center;">
                      This is an automated notification from the Bluvora Resources website.
                      Please do not reply directly to this message.
                      <br/>
                      &copy; ${new Date().getFullYear()} Bluvora Resources &nbsp;&middot;&nbsp; All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Divider ───────────────────────────────────────────────────
function divider() {
  return `<tr><td colspan="2" style="padding:0;height:1px;background:${BRAND.border};"></td></tr>
          <tr><td colspan="2" style="height:2px;"></td></tr>`
}

// ─── Field row helper ──────────────────────────────────────────
function fieldRow(label, value) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding:13px 0 13px 0;border-bottom:1px solid ${BRAND.border};
                  width:34%;vertical-align:top;">
        <span style="font-size:11px;font-weight:600;color:#94a3b8;
                      text-transform:uppercase;letter-spacing:0.09em;">
          ${label}
        </span>
      </td>
      <td style="padding:13px 0 13px 20px;border-bottom:1px solid ${BRAND.border};
                  font-size:14px;color:${BRAND.inkDark};
                  line-height:1.6;word-break:break-word;vertical-align:top;font-weight:500;">
        ${escapeHtml(String(value))}
      </td>
    </tr>`
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />')
}

// ─── Badge pill ────────────────────────────────────────────────
function badge(text) {
  return `<span style="display:inline-block;background:${BRAND.primaryBg};
                        color:${BRAND.primary};font-size:11px;font-weight:600;
                        letter-spacing:0.07em;text-transform:uppercase;
                        padding:4px 10px;border-radius:20px;
                        border:1px solid #bfdbfe;">
    ${text}
  </span>`
}

// ─── Section title ─────────────────────────────────────────────
function sectionTitle(label, title) {
  return `
    <div style="margin-bottom:28px;">
      <p style="margin:0 0 10px;">${badge(label)}</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;
                  color:${BRAND.inkDark};letter-spacing:-0.5px;line-height:1.2;">
        ${title}
      </h1>
    </div>`
}

// ─── Info card wrapper ─────────────────────────────────────────
function infoCard(titleText, rows) {
  return `
    <div style="margin-bottom:28px;border:1px solid ${BRAND.border};
                border-radius:10px;overflow:hidden;">
      <div style="padding:12px 20px;background:${BRAND.surface};
                  border-bottom:1px solid ${BRAND.border};">
        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;
                   text-transform:uppercase;letter-spacing:0.1em;">
          ${titleText}
        </p>
      </div>
      <div style="padding:0 20px 4px;background:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${rows}
        </table>
      </div>
    </div>`
}

// ─── Message block ─────────────────────────────────────────────
function messageBlock(labelText, content) {
  return `
    <div style="margin-bottom:28px;border:1px solid ${BRAND.border};
                border-radius:10px;overflow:hidden;">
      <div style="padding:12px 20px;background:${BRAND.surface};
                  border-bottom:1px solid ${BRAND.border};">
        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;
                   text-transform:uppercase;letter-spacing:0.1em;">
          ${labelText}
        </p>
      </div>
      <div style="padding:20px;background:#ffffff;font-size:14px;
                  color:${BRAND.inkDark};line-height:1.8;white-space:pre-wrap;
                  word-break:break-word;">
        ${content}
      </div>
    </div>`
}

// ─── CTA button ────────────────────────────────────────────────
function ctaButton(href, text) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr>
        <td align="center">
          <a href="${href}"
             style="display:inline-block;background:${BRAND.primary};
                    color:#ffffff;font-size:14px;font-weight:600;
                    padding:14px 36px;border-radius:8px;
                    letter-spacing:0.01em;text-decoration:none;
                    box-shadow:0 2px 8px rgba(30,64,175,0.25);">
            ${text} &rarr;
          </a>
        </td>
      </tr>
    </table>`
}

// ══════════════════════════════════════════════════════════════
//  CONTACT FORM EMAIL
// ══════════════════════════════════════════════════════════════
function contactEmail({ name, email, subject, message }) {
  const body = `

    ${sectionTitle('Contact Form', 'New Message Received')}

    ${infoCard('Sender Details', `
      ${fieldRow('Full Name', name)}
      ${fieldRow('Email Address', email)}
      ${subject ? fieldRow('Subject', subject) : ''}
    `)}

    ${messageBlock('Message', escapeHtml(message))}

    <!-- Note -->
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.inkMuted};line-height:1.7;">
      Reply directly to this notification to respond to
      <strong style="color:${BRAND.inkDark};">${escapeHtml(name)}</strong>.
      Your reply will be sent to <strong style="color:${BRAND.inkDark};">${escapeHtml(email)}</strong>.
    </p>

    ${ctaButton(`mailto:${escapeHtml(email)}`, `Reply to ${escapeHtml(name)}`)}
  `

  return {
    html: wrap('New Contact Inquiry — Bluvora Resources', body),
    subject: subject
      ? `[Contact] ${subject}`
      : `[Contact] New message from ${name}`,
  }
}

// ══════════════════════════════════════════════════════════════
//  RESUME SUBMISSION EMAIL
// ══════════════════════════════════════════════════════════════
function resumeEmail({ firstName, lastName, email, phone, category, message, filename }) {
  const fullName = `${firstName} ${lastName}`

  const body = `

    ${sectionTitle('Resume Submission', 'New Candidate Application')}

    ${infoCard('Candidate Profile', `
      ${fieldRow('Full Name',      fullName)}
      ${fieldRow('Email Address',  email)}
      ${fieldRow('Phone Number',   phone    || 'Not provided')}
      ${fieldRow('Industry',       category || 'Not specified')}
      ${filename ? fieldRow('Resume File', filename) : ''}
    `)}

    ${message ? messageBlock('Cover Note', escapeHtml(message)) : ''}

    ${filename ? `
    <!-- Attachment pill -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:${BRAND.successBg};border:1px solid #a7f3d0;
                    border-radius:8px;padding:14px 20px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:12px;font-size:18px;">📎</td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#065f46;">
                  Resume Attached
                </p>
                <p style="margin:2px 0 0;font-size:12px;color:#047857;">
                  ${escapeHtml(filename)} — see attachment in this email
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>` : ''}

    <!-- Note -->
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.inkMuted};line-height:1.7;">
      Reply directly to this notification to reach out to
      <strong style="color:${BRAND.inkDark};">${escapeHtml(fullName)}</strong>.
      Your reply will be sent to <strong style="color:${BRAND.inkDark};">${escapeHtml(email)}</strong>.
    </p>

    ${ctaButton(`mailto:${escapeHtml(email)}`, `Contact ${escapeHtml(firstName)}`)}
  `

  return {
    html: wrap('New Resume Submission — Bluvora Resources', body),
    subject: `[Resume] ${fullName}${category ? ' — ' + category : ''}`,
  }
}

module.exports = { contactEmail, resumeEmail }