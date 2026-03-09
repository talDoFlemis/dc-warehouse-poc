CREATE TABLE "equipments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tags" text[],
	"search" "tsvector" GENERATED ALWAYS AS (
            setweight(to_tsvector('english', "equipments"."name"), 'A')
            ||
            setweight(to_tsvector('english', "equipments"."description"), 'B')
            ||
            setweight(to_tsvector('simple', immutable_array_to_string("equipments"."tags")), 'C')
            ) STORED NOT NULL
);
--> statement-breakpoint
CREATE INDEX "equipments_fts_index" ON "equipments" USING GIN ("search");