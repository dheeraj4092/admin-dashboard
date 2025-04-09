-- First, disable RLS temporarily to fix the policies
ALTER TABLE "public"."user_roles" DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can insert their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can update their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can delete their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."user_roles";

-- Create simplified policies that don't cause recursion
CREATE POLICY "Allow authenticated users to read user_roles"
ON "public"."user_roles"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert user_roles"
ON "public"."user_roles"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update user_roles"
ON "public"."user_roles"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete user_roles"
ON "public"."user_roles"
FOR DELETE
TO authenticated
USING (true);

-- Re-enable RLS
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY; 