import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";
import { authRelations } from "./schemas/auth.ts";

export const relations = { ...defineRelations(schema), ...authRelations };
