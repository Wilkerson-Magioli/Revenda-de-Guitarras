// utils/mail.ts
import nodemailer = require("nodemailer"); // compatível sem esModuleInterop

const host = process.env.MAILTRAP_HOST || "smtp.mailtrap.io";
const port = Number(process.env.MAILTRAP_PORT || 2525);
const user = process.env.MAILTRAP_USER || process.env.MAILTRAP_EMAIL || "";
const pass = process.env.MAILTRAP_PASS || process.env.MAILTRAP_SENHA || "";

export const mailer = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
});

export async function sendMail(opts: {
  to: string; subject: string; html?: string; text?: string; from?: string;
}) {
  const from = opts.from || "Revenda de Guitarras <no-reply@revenda.local>";
  return mailer.sendMail({ from, ...opts });
}
