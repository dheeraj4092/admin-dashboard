-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("user_id")
);

-- Drop existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can insert their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can update their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can delete their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."user_roles";

-- Create new policies without recursion
CREATE POLICY "Enable read access for authenticated users"
ON "public"."user_roles"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON "public"."user_roles"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."user_roles"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."user_roles"
FOR DELETE
TO authenticated
USING (true);

-- Make sure RLS is enabled on the table
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY; 