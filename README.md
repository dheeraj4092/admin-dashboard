# Storybook Emporium Admin Dashboard

This is the admin dashboard for the Storybook Emporium online store. It provides a comprehensive interface for managing products, orders, and users.

## Features

- Product Management (CRUD operations)
- Order Management with status updates
- User Management
- Dashboard with key metrics
- Secure authentication

## Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository
2. Navigate to the admin-dashboard directory:
   ```bash
   cd admin-dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The admin dashboard will be available at `http://localhost:3001`

## Database Schema

The admin dashboard expects the following tables in your Supabase database:

### Products
- id (int, primary key)
- title (text)
- description (text)
- price (decimal)
- image_url (text)
- stock (int)
- created_at (timestamp)

### Orders
- id (int, primary key)
- user_id (text, foreign key)
- total_amount (decimal)
- status (text)
- created_at (timestamp)

### Users
- id (text, primary key)
- email (text)
- phone (text, optional)
- address (text, optional)
- created_at (timestamp)
- last_sign_in_at (timestamp, optional)

### User Roles
- id (int, primary key)
- user_id (text, foreign key to auth.users)
- role (text)
- created_at (timestamp)

## Fixing Infinite Recursion in RLS Policies

If you encounter an "infinite recursion detected in policy for relation 'user_roles'" error, follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL:

```sql
-- Drop existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can insert their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can update their own roles" ON "public"."user_roles";
DROP POLICY IF EXISTS "Users can delete their own roles" ON "public"."user_roles";

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
```

4. Run the SQL query
5. Restart your application

## Security

- The admin dashboard uses Supabase authentication
- Only authenticated users with admin privileges can access the dashboard
- All API calls are secured with Supabase's Row Level Security (RLS)

## Development

- Built with React + TypeScript
- Uses Vite for fast development and building
- Styled with Tailwind CSS
- Uses React Query for data fetching
- Implements React Router for navigation

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## License

This project is licensed under the MIT License. 