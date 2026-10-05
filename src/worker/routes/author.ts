import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod';
import type { AppEnv } from "../middleware/database";
import { requireAuth } from "../middleware/require-auth";
import { AuthorsTable } from '../../db/schema.ts';
import { eq } from "drizzle-orm";

const authors = new Hono<AppEnv>();
authors.use("*", requireAuth);

const createAuthorSchema = z.object({
    name: z.string().trim().min(1),
    birthday: z.coerce.date().optional()
});

const updateAuthorSchema = z.object({
    name: z.string().trim().min(1).optional(),
    birthday: z.coerce.date().nullable().optional()
});

authors.get("/", async c => {
    const db = c.get("db");
    const authors = await db.query.AuthorsTable.findMany();
    
    return c.json(authors);
});

authors.get("/:id", async c => {
    const db = c.get("db");
    const id = c.req.param("id");
    if (!z.uuid().safeParse(id).success) return c.json({ error: "Invalid author ID" }, 400);

    const author = await db.query.AuthorsTable.findFirst({
        where: { id },
    });

    if (author == null) {
        return c.json({ error: "Author not found" }, 404);
    }

    return c.json(author);
});

authors.post("/", sValidator("json", createAuthorSchema),  async c => {
    const db = c.get("db");
    const data = c.req.valid("json");

    const [author] = await db.insert(AuthorsTable).values({ ...data, id: crypto.randomUUID() }).returning();

    return c.json(author, 201);
});

authors.put("/:id", sValidator("json", updateAuthorSchema), async c => {
    const db = c.get("db");
    const id = c.req.param("id");
    if (!z.uuid().safeParse(id).success) return c.json({ error: "Invalid author ID" }, 400);
    const data = c.req.valid("json");

    const [author] = await db.update(AuthorsTable).set(data).where(eq(AuthorsTable.id, id)).returning();

    if (author == null) {
        return c.json({ error: "Author not found" }, 404);
    }

    return c.json(author);
});

authors.delete("/:id", async c => {
    const db = c.get("db");
    const id = c.req.param("id");
    if (!z.uuid().safeParse(id).success) return c.json({ error: "Invalid author ID" }, 400);

    await db.delete(AuthorsTable).where(eq(AuthorsTable.id, id));

    return c.body(null, 204);
});

export default authors;