// middleware/sanitize.js — Input sanitisation utilities
'use strict'

/**
 * Strip control characters, trim whitespace, and truncate to maxLen.
 * Safe to call on any value — non-strings are returned as-is.
 */
function sanitizeString(value, maxLen = 1000) {
  if (typeof value !== 'string') return value
  // Remove control chars except normal whitespace
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen)
}

/**
 * Express middleware that sanitizes every string field in req.body.
 * Limits per-field lengths to sane defaults.
 */
function sanitizeBody(req, _res, next) {
  if (!req.body || typeof req.body !== 'object') return next()

  const LIMITS = {
    firstName: 100,
    lastName:  100,
    name:      200,
    email:     254,    // RFC 5321 max
    phone:     30,
    subject:   200,
    category:  100,
    message:   5000,
  }

  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string') {
      req.body[key] = sanitizeString(value, LIMITS[key] ?? 1000)
    }
  }

  next()
}

module.exports = { sanitizeBody, sanitizeString }
