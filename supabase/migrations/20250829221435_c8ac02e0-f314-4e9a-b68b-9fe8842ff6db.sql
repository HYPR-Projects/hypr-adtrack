-- Update RLS policies for shared workspace access

-- Drop existing restrictive policies for campaigns
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

-- Create new shared workspace policies for campaigns
CREATE POLICY "Authenticated users can view all campaigns" 
ON public.campaigns 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create campaigns" 
ON public.campaigns 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all campaigns" 
ON public.campaigns 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete all campaigns" 
ON public.campaigns 
FOR DELETE 
TO authenticated
USING (true);

-- Drop existing restrictive policies for tags
DROP POLICY IF EXISTS "Users can view tags from their campaigns" ON public.tags;
DROP POLICY IF EXISTS "Users can create tags for their campaigns" ON public.tags;
DROP POLICY IF EXISTS "Users can update tags from their campaigns" ON public.tags;
DROP POLICY IF EXISTS "Users can delete tags from their campaigns" ON public.tags;

-- Create new shared workspace policies for tags
CREATE POLICY "Authenticated users can view all tags" 
ON public.tags 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tags for any campaign" 
ON public.tags 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update all tags" 
ON public.tags 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete all tags" 
ON public.tags 
FOR DELETE 
TO authenticated
USING (true);

-- Drop existing restrictive policies for events
DROP POLICY IF EXISTS "Users can view events from their campaign tags" ON public.events;

-- Create new shared workspace policies for events
CREATE POLICY "Authenticated users can view all events" 
ON public.events 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the existing policy for event insertion (anyone can insert events via tracking)
-- "Anyone can insert events" policy remains unchanged