import nodemailer from "nodemailer";
import type { AuthEnv } from "./auth-env";

export async function sendMail(env: AuthEnv, message: { to: string; subject: string; text: string }) {
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true",
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    await transport.sendMail({ from: env.SMTP_FROM, ...message });
  } finally {
    transport.close();
  }
}
