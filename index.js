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
//  Fix double-slash URLs (e.g. //api/resume → /api/resume)
//  Root cause: VITE_API_URL set with a trailing slash, which
//  when joined with /api/resume produces //api/resume.
//  A 308 redirect loses CORS headers — we fix it with 307
//  (preserves POST method) before CORS even runs.
// ══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  if (req.path.startsWith('//')) {
    const clean = req.path.replace(/^\/+/, '/')
    const qs    = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : ''
    return res.redirect(307, clean + qs)
  }
  next()
})

// ══════════════════════════════════════════════════════════════
//  CORS — reflect all origins so Vercel preview deploys work.
//  Security is enforced via SMTP credentials + rate limiting.
// ══════════════════════════════════════════════════════════════
const corsOptions = {
  origin:               true,   // reflect request origin back
  methods:              ['GET', 'POST', 'OPTIONS'],
  allowedHeaders:       ['Content-Type', 'Authorization'],
  credentials:          true,
  optionsSuccessStatus: 200,
}

// Pre-flight must be registered BEFORE any other middleware
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

// ══════════════════════════════════════════════════════════════
//  Body parsing (JSON for contact, multipart handled by multer)
// ══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ══════════════════════════════════════════════════════════════
//  Rate limiting
// ══════════════════════════════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { success: false, message: 'Too many requests. Please wait a few minutes and try again.' },
})

const formLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { success: false, message: 'Too many submissions. Please wait 15 minutes before trying again.' },
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
app.post('/api/contact', formLimiter, sanitizeBody, contactRoute.validate, contactRoute.handler)

// ══════════════════════════════════════════════════════════════
//  POST /api/resume
// ══════════════════════════════════════════════════════════════
app.post('/api/resume', formLimiter, handleUpload('resume'), sanitizeBody, resumeRoute.validate, resumeRoute.handler)

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
  res.status(500).json({ success: false, message: 'An unexpected server error occurred. Please try again.' })
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

module.exports = app