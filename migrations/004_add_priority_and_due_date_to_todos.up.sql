-- Add priority and due_date columns to todos table
ALTER TABLE todos ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium';
ALTER TABLE todos ADD COLUMN due_date TIMESTAMP NULL;