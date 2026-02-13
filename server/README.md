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
