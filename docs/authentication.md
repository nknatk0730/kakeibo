# 認証とユーザー管理

Better Auth 1.7.5 / Drizzle Relations v2 / PostgreSQL を使用します。

- 自由登録（名前・メールアドレス・パスワード）とメール確認必須。
- ログイン済みユーザー全員が共通の著者データを取得・追加・編集・削除できます。
- `/api/auth/*` は Better Auth に委譲します。`wrangler.json` の `assets.run_worker_first: ["/api/*"]` で、メールリンクからの画面遷移も Worker に渡します。
- `/api/authors` とその配下ではサーバーがセッションを検証します。書き込みは同一 Origin に限定します。
- 一般ユーザーは他ユーザーを管理できません。管理者は `/admin/users` で一覧と利用停止・再開を操作できます。
- パスワード再設定では既存セッションを失効させ、ログアウト時には画面側のクエリキャッシュを破棄します。
- 認証のレート制限は PostgreSQL の `rate_limit` テーブルに保存します。Workers 本番では `CF-Connecting-IP` を使用します。

## ローカルの準備

既存 `.env` は上書きせず、`.env.example` の項目を追加してください。

```sh
# 認証用シークレットの生成（出力を .env の BETTER_AUTH_SECRET に保存）
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
npm install
npm run db:migrate
npm run dev
```

`BETTER_AUTH_URL=http://localhost:5173` とブラウザーのアクセス先を一致させます。`localhost` と `127.0.0.1` は別の Cookie 保存先です。ポートを変えた場合は設定も変更してください。

Mailpit の SMTP 接続先を `SMTP_HOST` / `SMTP_PORT` に、送信元を `SMTP_FROM` に設定します。ローカルで TLS を使わない Mailpit では `SMTP_SECURE=false`、SMTP 認証情報は不要です。受信箱の既定 URL は http://localhost:8025 です。

1. `/signup` で登録します。
2. Mailpit の確認メールのリンクを開きます。
3. `/login` でログインします。
4. `/settings/account` で名前・パスワードを変更できます。
5. `/forgot-password` から再設定メールを送信できます。

メール送信は `waitUntil` で継続します。送信失敗時は Worker のログを確認し、設定を修正して再送してください。パスワードや確認 URL をログへ出力しません。

## 最初の管理者

上記で登録・メール確認したアカウントを、明示的に指定して昇格させます。

```sh
npm run auth:admin -- your-email@example.com
```

ログイン画面または既存の画面を再読み込みすると、管理者メニューが表示されます。最初の登録者を自動で管理者にする処理はありません。管理画面からのロール変更・ユーザー削除は現時点では提供しません。

## スキーマ変更

```sh
npm run auth:schema
npm run db:generate
# 生成 SQL を確認してから適用
npm run db:migrate
```

`auth.config.ts` は CLI 用です。実行時の認証インスタンスは `src/worker/lib/auth.ts` の `createAuth()` で作成し、DB 接続はリクエストごとに開閉します。`src/db/schemas/auth.ts` は公式 CLI による生成ファイルです。

## 検証

ローカルの PostgreSQL・Mailpit・開発サーバーを起動した状態で実行します。

```sh
npm run test:auth
npm run build
npm run lint
npm run check
```

`test:auth` はローカル URL / DB に限定した統合テストです。一時ユーザー、共有著者、Mailpit メールを作成し、最後にテスト自身のデータだけ削除します。`MAILPIT_URL` で受信箱 API の URL を変更できます。

## 本番設定

本番の HTTPS URL と独立した `BETTER_AUTH_SECRET`、DB・メールの接続情報を Workers に設定します。`VITE_` の接頭辞を付けず、ブラウザーに公開しないでください。ローカル Mailpit は本番のメール配信先には使えません。`SMTP_SECURE=true` は暗黙 TLS 用（通常 465）で、STARTTLS の SMTP サーバーでは `false` を使います。必要に応じて `SMTP_USER` / `SMTP_PASSWORD` を設定します。

SMTP の Node.js 互換性はローカル Workers で動作確認済みです。本番の DB とメールサービスへの接続はデプロイ環境で別途確認してください。本番デプロイはこの実装作業では実施しません。
