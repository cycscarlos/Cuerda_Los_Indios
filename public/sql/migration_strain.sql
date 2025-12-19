-- Add 'strain' column to 'roosters' table
ALTER TABLE roosters 
ADD COLUMN strain text DEFAULT NULL;

-- Comment on column (Optional documentation)
COMMENT ON COLUMN roosters.strain IS 'Línea genética del ejemplar (ej. Kelso, Sweater)';
