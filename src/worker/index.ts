import { Hono } from "hono";
import authorsRoutes from "./routes/author";
import authRoutes from "./routes/auth";
import { database, type AppEnv } from "./middleware/database";

const app = new Hono<AppEnv>();
app.get("/api/", c => c.json({ message: "Hello API" }));
app.use("/api/*", database);
app.route("/api/auth", authRoutes);
app.route("/api/authors", authorsRoutes);
export default app;
