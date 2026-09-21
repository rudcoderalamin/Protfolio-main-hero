-- ===================================================================
-- SUPABASE DATABASE SETUP SCRIPT FOR PORTFOLIO WEBSITE
-- ===================================================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard/project/davrjqtvfjcnhietowuy
-- 2. Click on "SQL Editor" on the left sidebar
-- 3. Click "New query", paste all the SQL below, and click "Run"
-- ===================================================================

-- 1. Create Portfolio Table (stores all portfolio text, titles, bio, and photos)
CREATE TABLE IF NOT EXISTS public.portfolio (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB NOT NULL,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_password TEXT DEFAULT 'admin123',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the portfolio data
CREATE POLICY "Allow public select on portfolio"
ON public.portfolio FOR SELECT
TO public
USING (true);

-- Allow anyone to insert/update portfolio data (managed via admin panel)
CREATE POLICY "Allow public insert/update on portfolio"
ON public.portfolio FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 2. Create Messages Table (stores contact form inquiries and consultation bookings)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow visitors to submit messages
CREATE POLICY "Allow public insert on messages"
ON public.messages FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading messages in admin panel
CREATE POLICY "Allow public select on messages"
ON public.messages FOR SELECT
TO public
USING (true);

-- Allow updating message read status in admin panel
CREATE POLICY "Allow public update on messages"
ON public.messages FOR UPDATE
TO public
USING (true);

-- Allow deleting messages in admin panel
CREATE POLICY "Allow public delete on messages"
ON public.messages FOR DELETE
TO public
USING (true);

-- Enable Realtime publication so all visitors see edits live in <100ms
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
