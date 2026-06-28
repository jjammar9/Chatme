import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

let transporter: Transporter | null = null

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter
  const testAccount = await nodemailer.createTestAccount()
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })
  console.log("Ethereal account created:", testAccount.user)
  return transporter
}

export async function sendMeetingEmail(params: {
  to: string
  toName: string
  fromName: string
  title: string
  date: string
  time: string
  duration: number
}) {
  const tr = await getTransporter()
  const info = await tr.sendMail({
    from: `"${params.fromName} via Chatme" <meetings@chatme.app>`,
    to: params.to,
    subject: `Meeting Invitation: ${params.title}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background:#1b0036; padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color:#fff; margin:0; font-size: 18px;">📅 Meeting Invitation</h1>
        </div>
        <div style="background:#f8f7f9; padding: 24px; border-radius: 0 0 12px 12px;">
          <div style="background:#fff; border-radius: 8px; padding: 12px; margin-bottom: 16px; display:flex; align-items:center; gap:12px;">
            <span style="display:inline-block; background:#1b0036; color:#fff; font-size:12px; padding:2px 8px; border-radius:4px;">From</span>
            <strong style="color:#1b0036;">${params.fromName}</strong>
            <span style="color:#d2d2d2;">→</span>
            <span style="display:inline-block; background:#058630; color:#fff; font-size:12px; padding:2px 8px; border-radius:4px;">To</span>
            <strong style="color:#1b0036;">${params.toName}</strong>
          </div>
          <p style="color:#1b0036; font-size: 14px;">You have a meeting scheduled:</p>
          <div style="background:#fff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h2 style="color:#1b0036; margin:0 0 8px; font-size: 16px;">${params.title}</h2>
            <p style="color:#1b0036; margin:4px 0;">📅 ${params.date}</p>
            <p style="color:#1b0036; margin:4px 0;">⏰ ${params.time} · ${params.duration} min</p>
          </div>
          <p style="color:#1b0036/60; font-size: 12px;">You can view this in your Chatme calendar.</p>
        </div>
      </div>
    `,
  })
  console.log("Meeting email sent:", info.messageId, "to:", params.to)
  const previewUrl = nodemailer.getTestMessageUrl(info)
  console.log("Preview URL:", previewUrl)
  return previewUrl ? String(previewUrl) : null
}