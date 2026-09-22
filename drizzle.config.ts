import { defineConfig } from "drizzle-kit";
import { env } from "./src/data/env.ts";

export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        password: env.POSTGRES_PASSWORD,
        database: env.DB_NAME,
        host: env.DB_HOST,
        user: env.DB_USER,
        port: env.DB_PORT,
        ssl: false,
    }

})