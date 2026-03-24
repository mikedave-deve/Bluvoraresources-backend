// index.js — Bluvora Resources Backend Entry Point
'use strict'

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')

const { verifyConnection }     = require('./lib/mailer')
const { sanitizeBody }         = require('./middleware/sanitize')
const { handleUpload }         = require('./middleware/upload')
const contactRoute             = require('./api/contact')
const resumeRoute              = require('./api/resume')

const app = express()

// ── Trust Vercel proxy ─────────────────────────────────────────
app.set('trust proxy', 1)

// ══════════════════════════════════════════════════════════════
//  CORS
// ══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',   // Vite dev server
  'http://localhost:3000',
  'https://bluvoraresources.com'
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser tools (Postman, curl) and server-side calls
    if (!origin) return cb(null, true)
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true)
    cb(new Error(`CORS: Origin ${origin} is not allowed`))
  },
  methods:          ['GET', 'POST', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization'],
  credentials:      true,
  optionsSuccessStatus: 200,
}))

app.options('*', cors()) // pre-flight

// ══════════════════════════════════════════════════════════════
//  Body parsing (JSON for contact, multipart handled by multer)
// ══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ══════════════════════════════════════════════════════════════
//  Rate limiting
// ══════════════════════════════════════════════════════════════
// Global: 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes and try again.',
  },
})

// Form-specific: 5 submissions / 15 min per IP (anti-spam)
const formLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: 'You have submitted too many forms recently. Please wait 15 minutes before trying again.',
  },
})

app.use(globalLimiter)

// ══════════════════════════════════════════════════════════════
//  Health check
// ══════════════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ══════════════════════════════════════════════════════════════
//  POST /api/contact
// ══════════════════════════════════════════════════════════════
app.post(
  '/api/contact',
  formLimiter,
  sanitizeBody,
  contactRoute.validate,
  contactRoute.handler
)

// ══════════════════════════════════════════════════════════════
//  POST /api/resume
//  multer runs first (parses multipart + validates file),
//  then sanitize + express-validator, then the handler.
// ══════════════════════════════════════════════════════════════
app.post(
  '/api/resume',
  formLimiter,
  handleUpload('resume'),   // populates req.file and req.body
  sanitizeBody,
  resumeRoute.validate,
  resumeRoute.handler
)

// ══════════════════════════════════════════════════════════════
//  404
// ══════════════════════════════════════════════════════════════
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ══════════════════════════════════════════════════════════════
//  Global error handler
// ══════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[global error]', err)

  // CORS errors
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message })
  }

  // Generic 500
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
  })
})

// ══════════════════════════════════════════════════════════════
//  Bootstrap
// ══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 4000

app.listen(PORT, async () => {
  console.log(`🚀  Bluvora Resources API running on port ${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   SMTP host   : ${process.env.SMTP_HOST}`)
  await verifyConnection()
})

// Export for Vercel serverless
module.exports = app
