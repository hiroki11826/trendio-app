# Server / Login API

## Setup

1. Install server dependencies:
   ```bash
   npm install
   ```
2. Run database setup if you haven't already applied the migrations:
   ```bash
   npx prisma migrate dev --name add_auth
   npx prisma generate
   ```
3. Seed the demo operator account that matches the login UI:
   ```bash
   npm run seed
   ```

## Environment variables

| Name | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | `postgresql://appuser:apppass@localhost:5432/appdb` |
| `PORT` | Port that Express listens on | `3001` |
| `JWT_SECRET` | Secret used to sign session tokens (must be strong) | `change-me-to-a-long-random-secret` |
| `JWT_EXPIRES_IN` | Default token lifetime when `remember` is `false` | `2h` |
| `JWT_REMEMBER_EXPIRES_IN` | Token lifetime when the user asks to be remembered | `30d` |
| `META_APP_ID` | Meta App ID that backs the config-based login | `695158557015973` |
| `META_APP_SECRET` | Meta app secret used only on the server | _keep secret / load from `.env.local`_ |
| `META_REDIRECT_URI` | Redirect URI registered in the Meta app | `http://localhost:3000/auth/meta/callback` |
| `META_CONFIG_ID` | config_id that scopes the Meta Business Login flow | `824461726720947` |
| `META_GRAPH_API_VERSION` | Optional override for the Graph/OAuth API version | `v21.0` |

The `.env` file in this repository already contains sensible defaults for local dev; make sure to update `JWT_SECRET` before deploying.

> このサーバーはランタイムで `pg`（node-postgres）を使って Postgres とやり取りしています。Prisma はマイグレーションと schema 定義のために残してあり、API 自体は直接 SQL で認証ロジックを実行します。

## Auth / user endpoints

### `POST /auth/login`

- Request body:
  ```json
  {
    "email": "owner@nekocafe.com",
    "password": "NekoCafe123!",
    "remember": true
  }
  ```
- Response:
  ```json
  {
    "token": "<JWT>",
    "user": {
      "id": 1,
      "email": "owner@nekocafe.com",
      "name": "ねこカフェオーナー",
      "isActive": true,
      "createdAt": "2026-02-13T00:00:00Z",
      "updatedAt": "2026-02-13T00:00:00Z",
      "lastLogin": "2026-02-14T06:00:00Z"
    }
  }
  ```
  - `remember` controls whether the JWT uses the longer `JWT_REMEMBER_EXPIRES_IN` expiry; the field accepts booleans or the string `"true"`.

### `GET /auth/me`

- Requires `Authorization: Bearer <token>` header.
- Returns the authenticated user record (excluding the password).

> **注意**: 新規ユーザー登録や削除はこのサーバーからは行えません。認証できるのは seed スクリプトで用意した下記3アカウントのみです。

| アカウント | メール | パスワード（プレーンテキスト） |
| --- | --- | --- |
| オーナー | `owner@nekocafe.com` | `NekoCafe123!` |
| 営業A | `sales@nekocafe.com` | `SalesStrong#1` |
| 運用B | `ops@nekocafe.com` | `OpsSecure!2` |

`npm run seed` によりこれらが存在するようハッシュ付きパスワードで upsert され、これ以外の認証情報では `/auth/login` は常に 401 になります。

## Seeded demo accounts

`npm run seed` upserts all three allowed users (owner 営業A 運用B) with bcrypt-hashed passwords, so the UI can only authenticate with those credentials. Re-running the script lets you reset the hashes if you ever need to rotate them.

## Meta Business Login helper

This server now contains a minimal Prisma-backed flow for the Meta config_id login.

### Prisma model

- `MetaConnection`
  - `id` (Int, PK)
  - `accessToken` (Text) – stored as returned from the `/oauth/access_token` response.
  - `expiresAt` (DateTime) – computed from `expires_in`; saves when the token no longer works.
  - `pageId` (String?) – populated from `/me/accounts`.
  - `igUserId` (String?) – the nested `instagram_business_account.id` if available.
  - `createdAt / updatedAt` – Prisma-managed timestamps.

After editing `prisma/schema.prisma`, run `npx prisma migrate dev --name add_meta_connection` (requires `DATABASE_URL`) and `npx prisma generate` before starting the server.

### Endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/meta/login` | Redirects the browser to `https://www.facebook.com/{version}/dialog/oauth` using `config_id`, `client_id`, and `redirect_uri`. |
| `GET /auth/meta/callback` | Exchanges the one-time `code` for an access token, saves it in `MetaConnection`, and returns the stored row in JSON. |
| `GET /api/meta/debug` | Reads the latest `MetaConnection`, calls `/{version}/me/accounts`, updates `pageId`/`igUserId`, and returns the Meta connection + page data. |

Keep `META_APP_SECRET` on the server (`.env`, `.env.local`, or CI secret) and never expose it to the browser. Each `code` is single-use, so always visit `/api/meta/login` first, complete the callback, and then call `/api/meta/debug`.
