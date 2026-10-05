// Local integration check. Creates temporary users and removes only its own fixtures.
import { config } from 'dotenv';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
config({ quiet: true });
const base = process.env.BETTER_AUTH_URL;
const mailBase = process.env.MAILPIT_URL ?? 'http://localhost:8025';
for (const url of [base, mailBase]) assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname), 'Local servers only');
assert.ok(['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST), 'Local database only');
const db = new pg.Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.DB_NAME });
const run = randomUUID();
const emails = [`auth-test-${run}@example.test`, `admin-test-${run}@example.test`];
const password = `Test-${randomUUID()}!`;
const mailIds = new Set();
const authorIds = [];
const verificationIdentifiers = new Set();
let adminCookie = '', userCookie = '';
async function request(path, { body, cookie, method = body ? 'POST' : 'GET', origin = base } = {}) {
  const response = await fetch(`${base}${path}`, { method, redirect: 'manual', headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { response, data, status: response.status };
}
function expect(result, status, label) { assert.equal(result.status, status, `${label}: expected ${status}, got ${result.status}${result.data?.code ? ` (${result.data.code})` : ''}`); }
function cookies(result) { return result.response.headers.getSetCookie().map(c => c.split(';')[0]).join('; '); }
async function mailLink(email, subject) {
  for (let n = 0; n < 30; n++) {
    const inbox = await (await fetch(`${mailBase}/api/v1/messages`)).json();
    const message = inbox.messages.find(m => m.To?.some(t => t.Address === email) && m.Subject === subject && !mailIds.has(m.ID));
    if (message) {
      mailIds.add(message.ID);
      const detail = await (await fetch(`${mailBase}/api/v1/message/${message.ID}`)).json();
      const link = detail.Text.match(/https?:\/\/[^\s]+/)?.[0];
      assert.ok(link, 'Mail contains link');
      return new URL(link);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Mail did not arrive: ${subject}`);
}
try {
  await db.connect();
  for (const [path, method, body] of [['/api/authors', 'GET'], ['/api/authors','POST',{name:'blocked'}], ['/api/authors/'+randomUUID(),'PUT',{name:'blocked'}], ['/api/authors/'+randomUUID(),'DELETE']]) expect(await request(path, {method, body}),401,'Unauthenticated API');
  expect(await request('/api/auth/sign-up/email', {body:{name:'Role injection',email:emails[0],password,role:'admin'}}),400,'Signup rejects role injection');
  for (const [i,email] of emails.entries()) {
    const signup = await request('/api/auth/sign-up/email', { body: { name: 'Auth smoke test', email, password, callbackURL: '/login?verified=1' } });
    expect(signup,200,'Signup');
    assert.equal(signup.data.user.role, 'user', 'Signup cannot self-promote');
    if (i === 0) expect(await request('/api/auth/sign-in/email', {body:{email,password}}),403,'Unverified login');
    const link = await mailLink(email,'メールアドレスの確認');
    expect(await request(link.pathname+link.search),302,'Email verification');
    // Prevent endpoint-specific login throttling from obscuring this functional check.
    if (i === 1) await new Promise(r => setTimeout(r, 11_000));
    const login = await request('/api/auth/sign-in/email', {body:{email,password}});
    expect(login,200,'Verified login');
    if (i === 0) userCookie = cookies(login); else adminCookie = cookies(login);
  }
  expect(await request('/api/auth/admin/list-users', {cookie:userCookie}),403,'User cannot list users');
  const who = await request('/api/auth/get-session', {cookie:userCookie}); expect(who,200,'Session'); assert.equal(who.data.user.email,emails[0]);
  expect(await request('/api/authors', {cookie:userCookie}),200,'Authenticated list');
  expect(await request('/api/authors', {cookie:userCookie,body:{name:'Blocked origin'},origin:'https://invalid.example'}),403,'Cross-origin write');
  const created = await request('/api/authors', {cookie:userCookie,body:{name:'Auth smoke fixture'}}); expect(created,201,'Create shared author'); authorIds.push(created.data.id);
  expect(await request('/api/authors/'+created.data.id, {cookie:adminCookie}),200,'Other user can read shared author');
  expect(await request('/api/authors/'+created.data.id, {cookie:adminCookie,method:'PUT',body:{name:'Edited shared fixture'}}),200,'Other user can edit shared author');
  expect(await request('/api/authors/'+created.data.id, {cookie:adminCookie,method:'DELETE'}),204,'Other user can delete shared author');
  expect(await request('/api/auth/update-user', {cookie:userCookie,body:{name:'Updated test user'}}),200,'Profile update');
  execFileSync(process.execPath, ['scripts/promote-admin.mjs', emails[1]], { stdio: 'pipe' });
  expect(await request('/api/auth/admin/list-users', {cookie:adminCookie}),200,'Admin can list users');
  expect(await request('/api/auth/admin/ban-user', {cookie:adminCookie,body:{userId:who.data.user.id,banReason:'Smoke test'}}),200,'Ban');
  expect(await request('/api/authors', {cookie:userCookie}),401,'Ban revokes session');
  expect(await request('/api/auth/admin/unban-user', {cookie:adminCookie,body:{userId:who.data.user.id}}),200,'Unban');
  const beforeReset = await request('/api/auth/sign-in/email', {body:{email:emails[0],password}});
  expect(beforeReset,200,'Login after unban');
  userCookie = cookies(beforeReset);
  expect(await request('/api/auth/request-password-reset', {body:{email:emails[0],redirectTo:'/reset-password'}}),200,'Request password reset');
  const resetLink = await mailLink(emails[0],'パスワードの再設定');
  const resetRedirect = await request(resetLink.pathname+resetLink.search); expect(resetRedirect,302,'Reset link');
  const token = new URL(resetRedirect.response.headers.get('location'),base).searchParams.get('token');
  verificationIdentifiers.add(`reset-password:${token}`);
  const newPassword = `Reset-${randomUUID()}!`;
  expect(await request('/api/auth/reset-password', {body:{token,newPassword}}),200,'Reset password');
  expect(await request('/api/authors', {cookie:userCookie}),401,'Reset revokes previous session');
  const replay = await request('/api/auth/reset-password', {body:{token,newPassword}}); assert.ok(replay.status >= 400, 'Reset token cannot be reused');
  await new Promise(r => setTimeout(r, 11_000));
  expect(await request('/api/auth/sign-in/email', {body:{email:emails[0],password}}),401,'Old password rejected');
  const login = await request('/api/auth/sign-in/email', {body:{email:emails[0],password:newPassword}}); expect(login,200,'New password accepted'); userCookie=cookies(login);
  expect(await request('/api/auth/change-password', {cookie:userCookie,body:{currentPassword:newPassword,newPassword:password,revokeOtherSessions:true}}),200,'Change password');
  expect(await request('/api/auth/sign-out', {cookie:userCookie,body:{}}),200,'Logout');
  expect(await request('/api/authors', {cookie:userCookie}),401,'Logout revokes session');
  console.log('PASS: registration, email delivery/verification, login, session, API protection, shared CRUD, profile/password change, reset token replay, admin authorization, ban/unban and logout');
} finally {
  for(const id of authorIds) await db.query('DELETE FROM authors WHERE id = $1', [id]);
  await db.query('DELETE FROM "user" WHERE email = ANY($1::text[])', [emails]);
  for(const id of verificationIdentifiers) await db.query('DELETE FROM verification WHERE identifier = $1', [id]);
  // Only test-address messages are removed, including resend messages.
  const inbox = await (await fetch(`${mailBase}/api/v1/messages`)).json();
  for(const m of inbox.messages) if(m.To?.some(t => emails.includes(t.Address))) mailIds.add(m.ID);
  for(const id of mailIds) await fetch(`${mailBase}/api/v1/messages`, {method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({IDs:[id]})});
  await db.end();
}
