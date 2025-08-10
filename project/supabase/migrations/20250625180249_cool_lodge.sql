/*
  # Fix profiles table foreign key constraint
  
  1. Problem
    - The profiles table currently has a foreign key constraint referencing `users(id)`
    - Supabase auth system uses `auth.users(id)` instead
    - This causes foreign key constraint violations when creating profiles
  
  2. Solution
    - Drop the existing incorrect foreign key constraint
    - Create new constraint that properly references `auth.users(id)`
    - Ensure RLS policies are correctly configured
  
  3. Changes
    - Remove `profiles_id_fkey` constraint that references `users(id)`
    - Add new constraint that references `auth.users(id) ON DELETE CASCADE`
    - Update RLS policies to use `auth.uid()` function
*/

-- Drop the existing incorrect foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the correct foreign key constraint that references auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create correct RLS policies using auth.uid()
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Also create a policy to allow reading all profiles for authenticated users
-- (needed for the application to function properly)
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);