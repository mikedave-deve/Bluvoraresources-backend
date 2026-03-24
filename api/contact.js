// api/contact.js — POST /api/contact
'use strict'

const { body, validationResult } = require('express-validator')
const { getTransporter }         = require('../lib/mailer')
const { contactEmail }           = require('../lib/emailTemplates')

// ── Validation chain ───────────────────────────────────────────
const validate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Subject must be under 200 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5 000 characters'),
]

// ── Handler ────────────────────────────────────────────────────
async function handler(req, res) {
  // 1. Validate
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }

  const { name, email, subject, message } = req.body

  // 2. Build email
  const { html, subject: emailSubject } = contactEmail({ name, email, subject, message })

  // 3. Send
  try {
    await getTransporter().sendMail({
      from:    `"${process.env.SMTP_FROM_NAME || 'Bluvora Resources'}" <${process.env.SMTP_USER}>`,
      to:      process.env.RECEIVING_EMAIL,
      replyTo: email,
      subject: emailSubject,
      html,
      // Plain-text fallback
      text: [
        `New contact form submission from ${name}`,
        `Email: ${email}`,
        subject ? `Subject: ${subject}` : '',
        '',
        'Message:',
        message,
      ].filter(Boolean).join('\n'),
    })
  } catch (err) {
    console.error('[contact] sendMail error:', err)
    return res.status(502).json({
      success: false,
      message: 'We could not send your message right now. Please try again in a few minutes.',
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Message sent successfully! We will get back to you within one business day.',
  })
}

module.exports = { validate, handler }

