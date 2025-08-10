/*
  # Fix profiles table RLS policies

  1. Security
    - Add INSERT policy for profiles table to allow users to create their own profile
    - Ensures authenticated users can create a profile where auth.uid() = id

  This fixes the error: "new row violates row-level security policy for table profiles"
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);