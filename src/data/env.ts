import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    POSTGRES_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_NAME: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const env = parsed.data;