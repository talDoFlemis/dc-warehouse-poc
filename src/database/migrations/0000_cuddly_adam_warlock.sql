CREATE TABLE "equipments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tags" text[],
	"search" "tsvector" GENERATED ALWAYS AS (
            setweight(to_tsvector('simple', array_to_string("equipments"."tags", ' ')), 'C') ||
            setweight(to_tsvector('english', "equipments"."name"), 'A')
            ||
            setweight(to_tsvector('english', "equipments"."description"), 'B')) STORED NOT NULL
);
--> statement-breakpoint
CREATE INDEX "equipments_fts_index" ON "equipments" USING GIN ("search");