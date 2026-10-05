// Promote an explicitly selected, email-verified account. No public bootstrap endpoint.
import { config } from 'dotenv';
import pg from 'pg';
config({ quiet: true });
const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error('使い方: npm run auth:admin -- user@example.com');
const db = new pg.Client({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USER,password:process.env.POSTGRES_PASSWORD,database:process.env.DB_NAME});
try {
  await db.connect();
  const result = await db.query('UPDATE "user" SET role = $1, updated_at = now() WHERE lower(email) = $2 AND email_verified = true RETURNING id', ['admin', email]);
  if (result.rowCount !== 1)
    throw new Error(
      "メール確認済みのアカウントが見つかりません。先に画面で登録・メール確認を行ってください。",
    );
  console.log('指定されたアカウントを管理者に変更しました。画面を再読み込みしてください。');
} finally { await db.end(); }
