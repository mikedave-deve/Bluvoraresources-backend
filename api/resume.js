// api/resume.js — POST /api/resume
'use strict'

const { body, validationResult } = require('express-validator')
const { getTransporter }         = require('../lib/mailer')
const { resumeEmail }            = require('../lib/emailTemplates')

// ── Allowed categories (must match frontend select options) ────
const VALID_CATEGORIES = new Set([
  'Technology', 'Finance', 'Healthcare', 'Marketing',
  'Operations', 'Human Resources', 'Engineering', 'Sales', 'Other', '',
])

// ── Validation chain ───────────────────────────────────────────
const validate = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be under 100 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be under 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 }).withMessage('Phone number must be under 30 characters'),

  body('category')
    .optional({ checkFalsy: true })
    .trim()
    .custom(val => {
      if (!VALID_CATEGORIES.has(val)) throw new Error('Invalid industry/category selected')
      return true
    }),

  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Cover note must be under 5 000 characters'),
]

// ── Handler ────────────────────────────────────────────────────
async function handler(req, res) {
  // 1. Validate body fields
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }

  // 2. Ensure a file was uploaded (multer populates req.file)
  if (!req.file) {
    return res.status(422).json({
      success: false,
      message: 'A resume file is required.',
      errors:  [{ field: 'resume', message: 'Please upload your resume (PDF, DOC, or DOCX)' }],
    })
  }

  const { firstName, lastName, email, phone, category, message } = req.body
  const { originalname, buffer, mimetype }                        = req.file

  // 3. Build email
  const { html, subject } = resumeEmail({
    firstName,
    lastName,
    email,
    phone,
    category,
    message,
    filename: originalname,
  })

  // 4. Send with attachment
  try {
    await getTransporter().sendMail({
      from:    `"${process.env.SMTP_FROM_NAME || 'Bluvora Resources'}" <${process.env.SMTP_USER}>`,
      to:      process.env.RECEIVING_EMAIL,
      replyTo: email,
      subject,
      html,
      text: [
        `New resume submission`,
        `Name:     ${firstName} ${lastName}`,
        `Email:    ${email}`,
        phone    ? `Phone:    ${phone}`    : '',
        category ? `Industry: ${category}` : '',
        message  ? `\nCover Note:\n${message}` : '',
        `\nResume: ${originalname} (attached)`,
      ].filter(Boolean).join('\n'),
      attachments: [
        {
          filename:    originalname,
          content:     buffer,
          contentType: mimetype,
        },
      ],
    })
  } catch (err) {
    console.error('[resume] sendMail error:', err)
    return res.status(502).json({
      success: false,
      message: 'We could not process your submission right now. Please try again in a few minutes.',
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Resume submitted successfully! Our team will be in touch within 2–3 business days.',
  })
}

module.exports = { validate, handler }
