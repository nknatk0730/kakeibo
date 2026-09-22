import { Hono } from "hono";
import authorsRoutes from './routes/author.ts';

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ message: "Hello API" }));
app.route("/api/authors", authorsRoutes);


// app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
