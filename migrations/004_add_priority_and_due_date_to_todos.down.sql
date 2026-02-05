-- Remove priority and due_date columns from todos table
ALTER TABLE todos DROP COLUMN priority;
ALTER TABLE todos DROP COLUMN due_date;