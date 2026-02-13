import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // schema.prisma の場所（server配下にある前提）
  schema: "prisma/schema.prisma",

  // migrations の出力先（任意：明示しておくと分かりやすい）
  migrations: {
    path: "prisma/migrations",
  },

  // ここで接続URLを指定（schema.prisma には url を書かない）
  datasource: {
    url: env("DATABASE_URL"),
  },
});
