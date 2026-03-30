// api/apply.js — POST /api/apply
'use strict'

const { body, validationResult } = require('express-validator')
const { getTransporter }         = require('../lib/mailer')
const { applyEmail }             = require('../lib/emailTemplates')

// ── Allowed job positions (must match frontend JOB_POSITIONS list) ──
const VALID_POSITIONS = new Set([
  'General Application',
  'Administrative Assistant',
  'Customer Service Representative',
  'Data Entry Specialist',
  'Warehouse Associate',
  'Production Technician',
  'Forklift Operator',
  'Quality Control Inspector',
  'Human Resources Coordinator',
  'Accounting Clerk',
  'IT Support Specialist',
  'Marketing Coordinator',
  'Sales Representative',
  'Operations Manager',
  'Project Manager',
  'Other',
])

// ── Allowed availability values ────────────────────────────────
const VALID_AVAILABILITY = new Set(['Full-time', 'Part-time'])

// ── Allowed work duration values ───────────────────────────────
const VALID_WORK_DURATION = new Set(['temporary', 'seasonal', 'permanent', 'flexible', ''])

// ── Validation chain ───────────────────────────────────────────
const validate = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Full name must be between 2 and 200 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ max: 30 }).withMessage('Phone number must be under 30 characters'),

  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Please provide a valid date of birth'),

  body('address')
    .trim()
    .notEmpty().withMessage('Home address is required')
    .isLength({ max: 500 }).withMessage('Address must be under 500 characters'),

  body('position')
    .trim()
    .notEmpty().withMessage('Please select a job position')
    .custom(val => {
      if (!VALID_POSITIONS.has(val)) throw new Error('Invalid job position selected')
      return true
    }),

  body('availability')
    .trim()
    .notEmpty().withMessage('Please select your availability')
    .custom(val => {
      if (!VALID_AVAILABILITY.has(val)) throw new Error('Invalid availability option selected')
      return true
    }),

  body('workDuration')
    .optional({ checkFalsy: true })
    .trim()
    .custom(val => {
      if (!VALID_WORK_DURATION.has(val)) throw new Error('Invalid work duration selected')
      return true
    }),

  body('additionalInfo')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Additional information must be under 1,000 characters'),

  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Message must be under 5,000 characters'),
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

  const {
    fullName,
    email,
    phone,
    dob,
    address,
    position,
    availability,
    workDuration,
    additionalInfo,
    message,
  } = req.body

  // 2. Build email
  const { html, subject } = applyEmail({
    fullName,
    email,
    phone,
    dob,
    address,
    position,
    availability,
    workDuration,
    additionalInfo,
    message,
  })

  // 3. Send
  try {
    await getTransporter().sendMail({
      from:    `"${process.env.SMTP_FROM_NAME || 'Bluvora Resources'}" <${process.env.SMTP_USER}>`,
      to:      process.env.RECEIVING_EMAIL,
      replyTo: email,
      subject,
      html,
      // Plain-text fallback
      text: [
        `New job application from ${fullName}`,
        `Email:        ${email}`,
        `Phone:        ${phone}`,
        `Date of Birth: ${dob}`,
        `Home Address: ${address}`,
        `Position:     ${position}`,
        `Availability: ${availability}`,
        workDuration    ? `Work Duration: ${workDuration}`       : '',
        additionalInfo  ? `\nAdditional Info:\n${additionalInfo}` : '',
        message         ? `\nMessage:\n${message}`               : '',
      ].filter(Boolean).join('\n'),
    })
  } catch (err) {
    console.error('[apply] sendMail error:', err)
    return res.status(502).json({
      success: false,
      message: 'We could not process your application right now. Please try again in a few minutes.',
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Application submitted successfully! Our team will review it and be in touch within 2–3 business days.',
  })
}

module.exports = { validate, handler }
