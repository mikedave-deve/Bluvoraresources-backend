// lib/mailer.js — Nodemailer transporter (singleton)
'use strict'

const nodemailer = require('nodemailer')

let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  // secure = true when port 465 (SSL), false when port 587 (STARTTLS)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Hostinger sometimes needs this
    tls: {
      rejectUnauthorized: true,
    },
  })

  return _transporter
}

/**
 * Verify the transporter connection.
 * Called once on startup so we catch misconfigurations early.
 */
async function verifyConnection() {
  try {
    await getTransporter().verify()
    console.log('✅  SMTP connection verified')
  } catch (err) {
    console.error('❌  SMTP connection failed:', err.message)
    // Don't crash the server — log and continue
  }
}

module.exports = { getTransporter, verifyConnection }
