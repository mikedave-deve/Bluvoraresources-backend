// middleware/upload.js — Multer configuration
'use strict'

const multer = require('multer')
const path   = require('path')

// ── Constants ──────────────────────────────────────────────────
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',                                                    // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
])

// Allowed extensions (belt-and-suspenders check)
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx'])

// ── File filter ────────────────────────────────────────────────
function fileFilter(_req, file, cb) {
  const ext  = path.extname(file.originalname).toLowerCase()
  const mime = file.mimetype.toLowerCase()

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true)
  } else {
    const err = new Error(
      `Invalid file type. Only PDF, DOC, and DOCX files are accepted. ` +
      `Received: ${file.originalname}`
    )
    err.code = 'INVALID_FILE_TYPE'
    cb(err, false)
  }
}

// ── Storage — memory (works in Vercel serverless) ─────────────
const storage = multer.memoryStorage()

// ── Multer instance ────────────────────────────────────────────
const upload = multer({
  storage,
  limits: {
    fileSize:  MAX_FILE_SIZE,
    files:     1,       // single file per request
    fields:    10,      // text fields cap
  },
  fileFilter,
})

// ── Error handler wrapper ──────────────────────────────────────
/**
 * Wraps multer's single-file handler and converts multer errors
 * into structured API errors that our global handler can process.
 */
function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (!err) return next()

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
          errors:  [{ field: 'resume', message: 'File exceeds 20 MB limit' }],
        })
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          message: err.message,
          errors:  [{ field: 'resume', message: err.message }],
        })
      }

      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          errors:  [{ field: 'resume', message: err.message }],
        })
      }

      next(err) // Unknown error → global handler
    })
  }
}

module.exports = { handleUpload }
