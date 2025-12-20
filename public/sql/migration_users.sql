-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Storing plain text for prototype/simple use as requested. encryption recommended for prod.
    role TEXT NOT NULL CHECK (role IN ('admin', 'empleado', 'cliente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Users
-- Admin: Full Access
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Empleado: Inventory Access (CRUD) but no User Management
INSERT INTO users (username, password, role) 
VALUES ('empleado', 'emp123', 'empleado')
ON CONFLICT (username) DO NOTHING;

-- Cliente: View Only & Cart
INSERT INTO users (username, password, role) 
VALUES ('cliente', 'client123', 'cliente')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS (Row Level Security) - Optional but good practice
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read users (for login verification logic if client-side or public profile)
-- Ideally Login should be server-side or via Supabase Auth, but for this custom table approach:
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);

-- Policy: Only Admins can update/delete users
-- (This logic relies on Supabase Auth usually, but here we are managing auth manually via table)
-- So we'll leave it open for now or restrict if using Supabase Auth UID mapping.
