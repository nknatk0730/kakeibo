import { pgTable, uuid, timestamp, text} from "drizzle-orm/pg-core";

export const AuthorsTable = pgTable("authors", {
    id: uuid(),
    name: text().notNull(),
    birthday: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});