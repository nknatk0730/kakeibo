CREATE TABLE "authors" (
	"id" uuid,
	"name" text NOT NULL,
	"birthday" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
