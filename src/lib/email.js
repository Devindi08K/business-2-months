import { Resend } from "resend";
import siteConfig from "../../site.config";

let resendClient = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function fromAddress() {
  return (
    process.env.EMAIL_FROM ||
    `${siteConfig.businessName} <onboarding@resend.dev>`
  );
}

export async function sendEmail({ to, subject, html, text }) {
  const resend = getResend();
  if (!resend) {
    console.info("[email:dev]", { to, subject, text: text || html?.slice(0, 200) });
    return { id: "dev-mode", skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: fromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error("[email] Resend error", result.error);
      throw new Error("Failed to send email");
    }
    return result.data;
  } catch (err) {
    console.error("[email] send failed", err);
    throw new Error("Failed to send email");
  }
}

export function contactNotificationHtml({ name, email, phone, subject, message }) {
  return `
    <h2>New contact message</h2>
    <p><strong>From:</strong> ${escape(name)} &lt;${escape(email)}&gt;</p>
    <p><strong>Phone:</strong> ${escape(phone || "—")}</p>
    <p><strong>Subject:</strong> ${escape(subject)}</p>
    <p>${escape(message).replace(/\n/g, "<br/>")}</p>
  `;
}

export function bookingNotificationHtml(booking) {
  return `
    <h2>New booking request</h2>
    <p><strong>Name:</strong> ${escape(booking.name)}</p>
    <p><strong>Email:</strong> ${escape(booking.email)}</p>
    <p><strong>Phone:</strong> ${escape(booking.phone)}</p>
    <p><strong>Date:</strong> ${escape(booking.date)} at ${escape(booking.time)}</p>
    <p><strong>Party size:</strong> ${booking.partySize}</p>
    <p><strong>Service:</strong> ${escape(booking.service || "—")}</p>
    <p><strong>Notes:</strong> ${escape(booking.notes || "—")}</p>
  `;
}

export function bookingStatusHtml({ name, status, date, time, businessName }) {
  const label =
    status === "confirmed"
      ? "confirmed"
      : status === "cancelled"
        ? "cancelled"
        : "updated";
  return `
    <p>Hi ${escape(name)},</p>
    <p>Your booking at <strong>${escape(businessName)}</strong> for ${escape(date)} at ${escape(time)} has been <strong>${label}</strong>.</p>
    <p>If you have questions, reply to this email.</p>
  `;
}

export function messageReplyHtml({ body, businessName }) {
  return `
    <p>${escape(body).replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p>${escape(businessName)}</p>
  `;
}

function escape(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
