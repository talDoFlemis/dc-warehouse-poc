ALTER TABLE "equipments" drop column "search";--> statement-breakpoint
ALTER TABLE "equipments" ADD COLUMN "search" "tsvector" GENERATED ALWAYS AS (
            setweight(to_tsvector('portuguese', "equipments"."id"), 'A') 
            ||
            setweight(to_tsvector('portuguese', "equipments"."name"), 'A')
            ||
            setweight(to_tsvector('portuguese', "equipments"."description"), 'B')
            ||
            setweight(to_tsvector('simple', immutable_array_to_string("equipments"."tags")), 'C')
            ) STORED NOT NULL;