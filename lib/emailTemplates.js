// lib/emailTemplates.js — HTML email templates
'use strict'

// ─── Shared brand colours (mirrors frontend tailwind theme) ───
const BRAND = {
  primary:    '#1e40af',   // brand-700 blue
  primaryBg:  '#eff6ff',   // brand-50
  inkDark:    '#0f172a',   // slate-900
  inkMuted:   '#64748b',   // slate-500
  surface:    '#f8fafc',   // slate-50
  border:     '#e2e8f0',   // slate-200
  accent:     '#3b82f6',   // brand-500
  success:    '#10b981',   // emerald-500
  successBg:  '#ecfdf5',   // emerald-50
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
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   Helvetica, Arial, sans-serif;
      background: ${BRAND.surface};
      color: ${BRAND.inkDark};
      -webkit-font-smoothing: antialiased;
    }
    a { color: ${BRAND.accent}; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background:#fff;
                      border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary} 0%,#1e3a8a 100%);
                        padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:800;color:#fff;
                                letter-spacing:-0.5px;">
                      Bluvora Resources
                    </div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.6);
                                margin-top:4px;font-weight:500;">
                      Recruitment &amp; Staffing
                    </div>
                  </td>
                  <td align="right">
                    <div style="background:rgba(255,255,255,0.12);
                                border-radius:8px;padding:8px 14px;
                                font-size:12px;color:rgba(255,255,255,0.8);
                                white-space:nowrap;">
                      ${now}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:${BRAND.surface};
                        border-top:1px solid ${BRAND.border};">
              <p style="font-size:12px;color:${BRAND.inkMuted};
                          line-height:1.6;text-align:center;">
                This email was generated automatically by the Bluvora Resources website.
                Please do not reply directly to this message.
                <br />
                &copy; ${new Date().getFullYear()} Bluvora Resources. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Field row helper ──────────────────────────────────────────
function fieldRow(label, value) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding:10px 16px;background:${BRAND.surface};
                  border-radius:8px;margin-bottom:8px;
                  border-left:3px solid ${BRAND.accent};
                  font-size:13px;font-weight:600;
                  color:${BRAND.inkMuted};width:140px;
                  vertical-align:top;">
        ${label}
      </td>
      <td style="padding:10px 16px;font-size:14px;
                  color:${BRAND.inkDark};line-height:1.6;
                  vertical-align:top;word-break:break-word;">
        ${escapeHtml(String(value))}
      </td>
    </tr>
    <tr><td colspan="2" style="height:8px;"></td></tr>`
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

// ─── Section header helper ────────────────────────────────────
function sectionHeader(emoji, title) {
  return `
    <div style="display:flex;align-items:center;margin-bottom:20px;">
      <div style="width:40px;height:40px;border-radius:10px;
                  background:${BRAND.primaryBg};
                  display:flex;align-items:center;justify-content:center;
                  font-size:18px;margin-right:12px;flex-shrink:0;">
        ${emoji}
      </div>
      <div>
        <h2 style="font-size:18px;font-weight:700;color:${BRAND.inkDark};
                    letter-spacing:-0.3px;">
          ${title}
        </h2>
      </div>
    </div>`
}

// ══════════════════════════════════════════════════════════════
//  CONTACT FORM EMAIL
// ══════════════════════════════════════════════════════════════
function contactEmail({ name, email, subject, message }) {
  const body = `
    ${sectionHeader('✉️', 'New Contact Form Submission')}

    <p style="font-size:14px;color:${BRAND.inkMuted};margin-bottom:24px;line-height:1.6;">
      Someone reached out via the <strong>contact form</strong> on the Bluvora Resources website.
    </p>

    <!-- Details card -->
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};
                border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <div style="padding:16px 20px;background:${BRAND.primaryBg};
                  border-bottom:1px solid ${BRAND.border};">
        <span style="font-size:12px;font-weight:700;
                      text-transform:uppercase;letter-spacing:0.08em;
                      color:${BRAND.primary};">
          Sender Details
        </span>
      </div>
      <div style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${fieldRow('Full Name', name)}
          ${fieldRow('Email', email)}
          ${subject ? fieldRow('Subject', subject) : ''}
        </table>
      </div>
    </div>

    <!-- Message card -->
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};
                border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <div style="padding:16px 20px;background:${BRAND.primaryBg};
                  border-bottom:1px solid ${BRAND.border};">
        <span style="font-size:12px;font-weight:700;
                      text-transform:uppercase;letter-spacing:0.08em;
                      color:${BRAND.primary};">
          Message
        </span>
      </div>
      <div style="padding:20px;font-size:14px;color:${BRAND.inkDark};
                  line-height:1.7;white-space:pre-wrap;word-break:break-word;">
        ${escapeHtml(message)}
      </div>
    </div>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="mailto:${escapeHtml(email)}"
             style="display:inline-block;background:${BRAND.primary};
                    color:#fff;font-size:14px;font-weight:700;
                    padding:14px 32px;border-radius:10px;
                    letter-spacing:0.02em;text-decoration:none;">
            Reply to ${escapeHtml(name)} &rarr;
          </a>
        </td>
      </tr>
    </table>`

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
    ${sectionHeader('📄', 'New Resume Submission')}

    <p style="font-size:14px;color:${BRAND.inkMuted};margin-bottom:24px;line-height:1.6;">
      A candidate has submitted their resume through the
      <strong>Submit Resume</strong> page on the Bluvora Resources website.
      ${filename ? `The file <strong>${escapeHtml(filename)}</strong> is attached below.` : ''}
    </p>

    <!-- Candidate info -->
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};
                border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <div style="padding:16px 20px;background:${BRAND.primaryBg};
                  border-bottom:1px solid ${BRAND.border};">
        <span style="font-size:12px;font-weight:700;
                      text-transform:uppercase;letter-spacing:0.08em;
                      color:${BRAND.primary};">
          Candidate Information
        </span>
      </div>
      <div style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${fieldRow('Full Name',  fullName)}
          ${fieldRow('Email',      email)}
          ${fieldRow('Phone',      phone || 'Not provided')}
          ${fieldRow('Industry',   category || 'Not specified')}
          ${filename ? fieldRow('Resume File', filename) : ''}
        </table>
      </div>
    </div>

    ${message ? `
    <!-- Cover note -->
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};
                border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <div style="padding:16px 20px;background:${BRAND.primaryBg};
                  border-bottom:1px solid ${BRAND.border};">
        <span style="font-size:12px;font-weight:700;
                      text-transform:uppercase;letter-spacing:0.08em;
                      color:${BRAND.primary};">
          Cover Note
        </span>
      </div>
      <div style="padding:20px;font-size:14px;color:${BRAND.inkDark};
                  line-height:1.7;white-space:pre-wrap;word-break:break-word;">
        ${escapeHtml(message)}
      </div>
    </div>` : ''}

    <!-- Attachment notice -->
    ${filename ? `
    <div style="background:${BRAND.successBg};border:1px solid #a7f3d0;
                border-radius:10px;padding:16px 20px;margin-bottom:28px;
                display:flex;align-items:center;gap:12px;">
      <span style="font-size:20px;">📎</span>
      <div>
        <div style="font-size:13px;font-weight:700;color:#065f46;">
          Resume Attached
        </div>
        <div style="font-size:12px;color:#047857;margin-top:2px;">
          ${escapeHtml(filename)} — see email attachment
        </div>
      </div>
    </div>` : ''}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="mailto:${escapeHtml(email)}"
             style="display:inline-block;background:${BRAND.primary};
                    color:#fff;font-size:14px;font-weight:700;
                    padding:14px 32px;border-radius:10px;
                    letter-spacing:0.02em;text-decoration:none;">
            Contact ${escapeHtml(firstName)} &rarr;
          </a>
        </td>
      </tr>
    </table>`

  return {
    html: wrap('New Resume Submission — Bluvora Resources', body),
    subject: `[Resume] ${fullName}${category ? ' — ' + category : ''}`,
  }
}

module.exports = { contactEmail, resumeEmail }
