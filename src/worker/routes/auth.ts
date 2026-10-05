import { Hono } from "hono";
import type { AppEnv } from "../middleware/database";
const auth = new Hono<AppEnv>();
auth.all("/*", c => c.get("auth").handler(c.req.raw));
export default auth;
