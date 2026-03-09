CREATE OR REPLACE FUNCTION immutable_array_to_string(text[])
RETURNS text AS $$
SELECT array_to_string($1, ' ');
$$ LANGUAGE sql IMMUTABLE;
--> statement-breakpoint