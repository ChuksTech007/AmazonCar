import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { DATA_DIR } from './store.js'

function summary(enquiry) {
  const about = enquiry.carTitle || enquiry.cruiseTitle || 'General request'
  return [
    `New Amason enquiry ${enquiry.id}`,
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || '—'}`,
    `City: ${enquiry.city}`,
    `About: ${about}`,
    '',
    enquiry.message,
  ].join('\n')
}

function logNotify(enquiry, result) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.appendFileSync(
    path.join(DATA_DIR, 'notify.log'),
    `${new Date().toISOString()} ${enquiry.id} ${result}\n`,
  )
}

export async function notifyEnquiry(site, enquiry) {
  const text = summary(enquiry)
  const sent = []

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === '1',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_TO || site.email,
        subject: `Amason enquiry — ${enquiry.name} — ${enquiry.carTitle || enquiry.cruiseTitle || 'desk'}`,
        text,
      })
      sent.push('email')
    } catch (err) {
      logNotify(enquiry, `email-failed ${err.message}`)
    }
  }

  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    try {
      await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: String(site.whatsapp || '').replace(/\D/g, ''),
          type: 'text',
          text: { body: text.slice(0, 3500) },
        }),
      })
      sent.push('whatsapp')
    } catch (err) {
      logNotify(enquiry, `whatsapp-failed ${err.message}`)
    }
  }

  if (process.env.NOTIFY_WEBHOOK_URL) {
    try {
      await fetch(process.env.NOTIFY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry),
      })
      sent.push('webhook')
    } catch (err) {
      logNotify(enquiry, `webhook-failed ${err.message}`)
    }
  }

  logNotify(enquiry, sent.length ? sent.join(',') : 'inbox-only')
  return sent
}
