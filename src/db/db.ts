import { env } from "../data/env.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations.ts";

// Workers では接続をリクエスト間で共有しない。
export const createDb = () => drizzle({
    relations,
    connection: {
        password: env.POSTGRES_PASSWORD,
        database: env.DB_NAME,
        host: env.DB_HOST,
        user: env.DB_USER,
        port: env.DB_PORT,
    }
});