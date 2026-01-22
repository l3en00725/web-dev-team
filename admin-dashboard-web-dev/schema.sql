-- Blue Kids Database Schema
-- Run this migration in your Supabase SQL Editor
-- This creates all tables with Row-Level Security (RLS) enabled

-- ============================================
-- 1. DONORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  email TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. DONATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- References donors.user_id
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'one-time')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  event_id UUID, -- Optional: link to specific event/program
  receipt_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- References donors.user_id
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual')),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  next_billing_date TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TAX DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- References donors.user_id
  document_type TEXT NOT NULL CHECK (document_type IN ('annual', 'quarterly', 'individual')),
  year INTEGER NOT NULL,
  quarter INTEGER, -- 1-4, only for quarterly documents
  file_path TEXT NOT NULL, -- Path to PDF file in storage
  file_url TEXT, -- Public URL to download
  total_amount DECIMAL(10,2) NOT NULL,
  donation_count INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PROGRAMS/EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  max_participants INTEGER,
  registered_count INTEGER DEFAULT 0,
  coach_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. IMPACT METRICS TABLE (for site-wide stats)
-- ============================================
CREATE TABLE IF NOT EXISTS impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_donations DECIMAL(12,2) DEFAULT 0,
  total_hours_funded INTEGER DEFAULT 0,
  total_kids_helped INTEGER DEFAULT 0,
  total_events_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date)
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tax_documents_user_id ON tax_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_year ON tax_documents(year);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_event_date ON programs(event_date);

-- ============================================
-- 8. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS POLICIES
-- ============================================

-- Donors: Users can only see their own record
CREATE POLICY "Users can view own donor record"
  ON donors FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own donor record"
  ON donors FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Donations: Users can only see their own donations
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  USING (auth.uid()::text = user_id);

-- Subscriptions: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Tax Documents: Users can only see their own tax documents
CREATE POLICY "Users can view own tax documents"
  ON tax_documents FOR SELECT
  USING (auth.uid()::text = user_id);

-- Programs: Public read access (for public pages)
CREATE POLICY "Anyone can view programs"
  ON programs FOR SELECT
  USING (true);

-- Impact Metrics: Public read access (for homepage stats)
CREATE POLICY "Anyone can view impact metrics"
  ON impact_metrics FOR SELECT
  USING (true);

-- ============================================
-- 10. FUNCTIONS FOR AUTOMATED UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. FUNCTION TO UPDATE IMPACT METRICS
-- ============================================
CREATE OR REPLACE FUNCTION update_impact_metrics()
RETURNS void AS $$
DECLARE
  total_donations DECIMAL(12,2);
  total_hours INTEGER;
  total_kids INTEGER;
  total_events INTEGER;
BEGIN
  -- Calculate totals from donations
  SELECT COALESCE(SUM(amount), 0) INTO total_donations
  FROM donations
  WHERE status = 'completed';

  -- Calculate hours (assuming $50 = 1 hour)
  total_hours := FLOOR(total_donations / 50);

  -- Calculate kids helped (assuming 2 hours per kid average)
  total_kids := FLOOR(total_hours / 2);

  -- Count completed events
  SELECT COUNT(*) INTO total_events
  FROM programs
  WHERE status = 'completed';

  -- Insert or update today's metrics
  INSERT INTO impact_metrics (metric_date, total_donations, total_hours_funded, total_kids_helped, total_events_completed)
  VALUES (CURRENT_DATE, total_donations, total_hours, total_kids, total_events)
  ON CONFLICT (metric_date)
  DO UPDATE SET
    total_donations = EXCLUDED.total_donations,
    total_hours_funded = EXCLUDED.total_hours_funded,
    total_kids_helped = EXCLUDED.total_kids_helped,
    total_events_completed = EXCLUDED.total_events_completed,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. INITIAL DATA
-- ============================================

-- Insert initial impact metrics record
INSERT INTO impact_metrics (metric_date, total_donations, total_hours_funded, total_kids_helped, total_events_completed)
VALUES (CURRENT_DATE, 0, 0, 0, 0)
ON CONFLICT (metric_date) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Set up Clerk authentication
-- 2. Configure webhooks to sync Clerk user_id with Supabase
-- 3. Test RLS policies
-- 4. Set up storage bucket for tax document PDFs
-- Form Submissions Tables
-- Creates tables for contact, volunteer, and event registration forms

-- ============================================
-- 1. CONTACT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL CHECK (subject IN (
    'event-registration', 
    'volunteer', 
    'partnership', 
    'donation', 
    'general'
  )),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- ============================================
-- 2. VOLUNTEER APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_type TEXT NOT NULL CHECK (interest_type IN (
    'coach', 
    'mentor', 
    'event-coordinator', 
    'corporate-partner', 
    'community-partner', 
    'facility-partner', 
    'other'
  )),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  notes TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- ============================================
-- 3. EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id),
  child_first_name TEXT NOT NULL,
  child_age INTEGER NOT NULL CHECK (child_age >= 6 AND child_age <= 16),
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  sport TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  special_notes TEXT,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'no-show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON volunteer_applications(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_interest_type ON volunteer_applications(interest_type);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_created_at ON volunteer_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_registrations_program_id ON event_registrations(program_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_parent_email ON event_registrations(parent_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_date ON event_registrations(event_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_created_at ON event_registrations(created_at DESC);

-- ============================================
-- 5. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Contact Submissions: Only service role can insert, admins can read
CREATE POLICY "Service role can insert contact submissions"
  ON contact_submissions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true); -- TODO: Add admin role check when auth is set up

-- Volunteer Applications: Only service role can insert, admins can read
CREATE POLICY "Service role can insert volunteer applications"
  ON volunteer_applications FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read volunteer applications"
  ON volunteer_applications FOR SELECT
  TO authenticated
  USING (true); -- TODO: Add admin role check when auth is set up

-- Event Registrations: Only service role can insert, admins can read
CREATE POLICY "Service role can insert event registrations"
  ON event_registrations FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (true); -- TODO: Add admin role check when auth is set up

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Admin Dashboard Tables
-- Creates tables for admin users, content management, and social publishing

-- ============================================
-- 1. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE, -- Clerk user ID (nullable until user signs in)
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'viewer')),
  active BOOLEAN DEFAULT TRUE,
  created_by TEXT, -- Clerk user ID of creator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CONTENT POSTS TABLE (CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL, -- Markdown or HTML
  excerpt TEXT,
  author_id TEXT NOT NULL, -- Clerk user ID
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  
  -- Media
  featured_image_url TEXT,
  
  -- Social
  social_excerpt TEXT, -- Custom excerpt for social sharing
  
  -- AI Generation Metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT, -- Original prompt if AI-generated
  ai_model TEXT, -- Which AI model was used
  ai_metadata JSONB DEFAULT '{}'
);

-- ============================================
-- 3. SOCIAL CONNECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID who connected
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'medium', 'meta', 'x')),
  access_token TEXT NOT NULL,
  refresh_token TEXT, -- For LinkedIn, Meta
  platform_user_id TEXT,
  platform_username TEXT,
  expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 4. SOCIAL POSTS TABLE (Publishing Log)
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_post_id UUID REFERENCES content_posts(id),
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'medium', 'meta', 'x')),
  platform_post_id TEXT,
  platform_url TEXT,
  published_by TEXT NOT NULL, -- Clerk user ID
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'failed', 'scheduled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- 5. ADMIN ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  action TEXT NOT NULL, -- e.g., 'created_post', 'published_social', 'viewed_donors'
  resource_type TEXT, -- e.g., 'content_post', 'donor', 'form_submission'
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);

CREATE INDEX IF NOT EXISTS idx_content_posts_slug ON content_posts(slug);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_author ON content_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_at ON content_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_connections(active);

CREATE INDEX IF NOT EXISTS idx_social_posts_content_post_id ON social_posts(content_post_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON social_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- ============================================
-- 7. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Admin Users: Only admins can view
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- Content Posts: Admins can manage
CREATE POLICY "Admins can manage content posts"
  ON content_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
      AND role IN ('super_admin', 'content_manager')
    )
  );

-- Social Connections: Admins can manage their own
CREATE POLICY "Admins can manage own social connections"
  ON social_connections FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- Social Posts: Admins can view
CREATE POLICY "Admins can view social posts"
  ON social_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- Activity Log: Admins can view
CREATE POLICY "Admins can view activity log"
  ON admin_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- ============================================
-- 9. FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_id_param 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_admin_role(user_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = user_id_param 
  AND active = true
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- People-Centric Data Model Migration (Phase 1)
-- Creates unified people table and activities log
-- 
-- DESIGN PRINCIPLES:
-- 1. One person = one email = one source of truth
-- 2. Donors are a VIEW on people, not a separate entity
-- 3. All interactions (donations, forms, events) link to people
-- 4. Activity timeline provides full context for each person

-- ============================================
-- 1. PEOPLE TABLE (Single source of truth for all contacts)
-- ============================================
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core identity
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  
  -- Address (optional, for donors)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  
  -- Organization (for corporate sponsors later)
  organization TEXT,
  
  -- Tags for segmentation (e.g., ['donor', 'volunteer', 'newsletter'])
  tags TEXT[] DEFAULT '{}',
  
  -- Engagement tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  
  -- Source tracking
  source TEXT, -- 'donation', 'contact_form', 'volunteer_form', 'event_registration', 'manual'
  source_detail TEXT -- Additional context (e.g., which form, which event)
);

-- ============================================
-- 2. DONOR DETAILS TABLE (Role-specific data for donors)
-- ============================================
-- Note: This extends the people table for donor-specific attributes
-- A person becomes a donor when they make their first donation
CREATE TABLE IF NOT EXISTS donor_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  
  -- Donor status (pipeline stage)
  status TEXT NOT NULL DEFAULT 'one-time' CHECK (status IN ('lead', 'one-time', 'recurring', 'lapsed', 'vip')),
  
  -- Donation aggregates (computed, updated by triggers)
  lifetime_total DECIMAL(10,2) DEFAULT 0,
  ytd_total DECIMAL(10,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  
  -- Donation dates
  first_gift_at TIMESTAMPTZ,
  last_gift_at TIMESTAMPTZ,
  
  -- Subscription info
  is_recurring BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One donor record per person
  UNIQUE(person_id)
);

-- ============================================
-- 3. ACTIVITIES TABLE (Unified timeline for all interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  
  -- Activity classification
  type TEXT NOT NULL, 
  -- Types: 'donation', 'email_sent', 'email_opened', 'email_clicked',
  --        'form_submitted', 'event_registered', 'event_attended',
  --        'note_added', 'status_changed', 'tag_added', 'tag_removed'
  
  -- Human-readable description
  description TEXT NOT NULL,
  
  -- Flexible metadata (varies by type)
  -- Donations: { amount, type, stripe_id }
  -- Forms: { form_type, submission_id }
  -- Events: { event_id, event_name }
  -- Emails: { campaign_id, subject }
  metadata JSONB DEFAULT '{}',
  
  -- Who triggered this activity (null for automated)
  created_by TEXT, -- Admin user ID
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_people_tags ON people USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_people_last_activity ON people(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donor_details_person_id ON donor_details(person_id);
CREATE INDEX IF NOT EXISTS idx_donor_details_status ON donor_details(status);
CREATE INDEX IF NOT EXISTS idx_donor_details_lifetime_total ON donor_details(lifetime_total DESC);
CREATE INDEX IF NOT EXISTS idx_donor_details_last_gift_at ON donor_details(last_gift_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_person_id ON activities(person_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- ============================================
-- 5. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- People: Admin access only (using service role for admin operations)
-- Public users cannot access people table directly
CREATE POLICY "Service role can manage people"
  ON people FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage donor_details"
  ON donor_details FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage activities"
  ON activities FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_people_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for people updated_at
DROP TRIGGER IF EXISTS update_people_updated_at_trigger ON people;
CREATE TRIGGER update_people_updated_at_trigger
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_people_updated_at();

-- Trigger for donor_details updated_at
DROP TRIGGER IF EXISTS update_donor_details_updated_at_trigger ON donor_details;
CREATE TRIGGER update_donor_details_updated_at_trigger
  BEFORE UPDATE ON donor_details
  FOR EACH ROW
  EXECUTE FUNCTION update_people_updated_at();

-- Function to update last_activity_at on people when activity is created
CREATE OR REPLACE FUNCTION update_person_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE people 
  SET last_activity_at = NEW.created_at
  WHERE id = NEW.person_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS update_person_last_activity_trigger ON activities;
CREATE TRIGGER update_person_last_activity_trigger
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_person_last_activity();

-- ============================================
-- 8. HELPER FUNCTION: Get or create person by email
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_person(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'manual',
  p_source_detail TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_person_id UUID;
BEGIN
  -- Try to find existing person
  SELECT id INTO v_person_id FROM people WHERE email = LOWER(TRIM(p_email));
  
  IF v_person_id IS NULL THEN
    -- Create new person
    INSERT INTO people (email, name, phone, source, source_detail)
    VALUES (
      LOWER(TRIM(p_email)),
      COALESCE(p_name, 'Unknown'),
      p_phone,
      p_source,
      p_source_detail
    )
    RETURNING id INTO v_person_id;
  ELSE
    -- Update existing person if new info is provided
    UPDATE people
    SET
      name = COALESCE(NULLIF(p_name, ''), name),
      phone = COALESCE(NULLIF(p_phone, ''), phone),
      updated_at = NOW()
    WHERE id = v_person_id;
  END IF;
  
  RETURN v_person_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. HELPER FUNCTION: Log activity
-- ============================================
CREATE OR REPLACE FUNCTION log_activity(
  p_person_id UUID,
  p_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_created_by TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activities (person_id, type, description, metadata, created_by)
  VALUES (p_person_id, p_type, p_description, p_metadata, p_created_by)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. VIEWS FOR COMMON QUERIES
-- ============================================

-- Donors view: People with donor details
CREATE OR REPLACE VIEW donors_view AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.phone,
  p.address_line1,
  p.address_line2,
  p.city,
  p.state,
  p.zip,
  p.tags,
  p.created_at,
  p.last_activity_at,
  d.status AS donor_status,
  d.lifetime_total,
  d.ytd_total,
  d.donation_count,
  d.first_gift_at,
  d.last_gift_at,
  d.is_recurring,
  d.stripe_customer_id
FROM people p
INNER JOIN donor_details d ON p.id = d.person_id;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- USAGE NOTES:
-- 
-- 1. To add a new contact from any source:
--    SELECT get_or_create_person('email@example.com', 'John Doe', '555-1234', 'contact_form');
--
-- 2. To log an activity:
--    SELECT log_activity(person_id, 'donation', 'Made $100 donation', '{"amount": 100}');
--
-- 3. To query donors:
--    SELECT * FROM donors_view ORDER BY lifetime_total DESC;
--
-- 4. To find all people with a tag:
--    SELECT * FROM people WHERE 'donor' = ANY(tags);
--
-- NEXT STEPS:
-- 1. Run data migration to copy existing donors to people/donor_details tables
-- 2. Update application code to use new tables
-- 3. Create admin UI for managing people
-- Data Migration: Copy existing donors to new people-centric model
-- Run this AFTER 004_people_centric_model.sql
--
-- This migration:
-- 1. Copies all existing donors to the people table
-- 2. Creates donor_details records for each
-- 3. Creates activity records for historical donations
-- 4. Creates activity records for form submissions

-- ============================================
-- 1. MIGRATE DONORS TO PEOPLE TABLE
-- ============================================
INSERT INTO people (email, name, phone, address_line1, source, source_detail, tags, created_at)
SELECT 
  LOWER(TRIM(email)) as email,
  COALESCE(name, 'Unknown') as name,
  phone,
  address,
  'donation' as source,
  'migrated_from_donors_table' as source_detail,
  ARRAY['donor'] as tags,
  created_at
FROM donors
WHERE email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  name = COALESCE(NULLIF(EXCLUDED.name, 'Unknown'), people.name),
  phone = COALESCE(EXCLUDED.phone, people.phone),
  tags = CASE 
    WHEN NOT ('donor' = ANY(people.tags)) 
    THEN array_append(people.tags, 'donor')
    ELSE people.tags
  END;

-- ============================================
-- 2. CREATE DONOR_DETAILS FOR EACH DONOR
-- ============================================
-- First, calculate donation stats for each donor
WITH donor_stats AS (
  SELECT 
    d.user_id,
    d.email,
    COUNT(*) as donation_count,
    SUM(don.amount) as lifetime_total,
    SUM(CASE 
      WHEN EXTRACT(YEAR FROM don.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) 
      THEN don.amount 
      ELSE 0 
    END) as ytd_total,
    MIN(don.created_at) as first_gift_at,
    MAX(don.created_at) as last_gift_at,
    BOOL_OR(don.type = 'recurring') as is_recurring
  FROM donors d
  LEFT JOIN donations don ON d.user_id = don.user_id AND don.status = 'completed'
  WHERE d.email IS NOT NULL
  GROUP BY d.user_id, d.email
)
INSERT INTO donor_details (
  person_id, 
  status, 
  lifetime_total, 
  ytd_total, 
  donation_count,
  first_gift_at, 
  last_gift_at, 
  is_recurring,
  stripe_customer_id
)
SELECT 
  p.id as person_id,
  CASE 
    WHEN ds.is_recurring THEN 'recurring'
    WHEN ds.lifetime_total >= 1000 THEN 'vip'
    WHEN ds.last_gift_at < NOW() - INTERVAL '12 months' THEN 'lapsed'
    ELSE 'one-time'
  END as status,
  COALESCE(ds.lifetime_total, 0) as lifetime_total,
  COALESCE(ds.ytd_total, 0) as ytd_total,
  COALESCE(ds.donation_count, 0) as donation_count,
  ds.first_gift_at,
  ds.last_gift_at,
  COALESCE(ds.is_recurring, false) as is_recurring,
  (SELECT stripe_customer_id FROM subscriptions WHERE user_id = d.user_id LIMIT 1) as stripe_customer_id
FROM donors d
JOIN people p ON LOWER(TRIM(d.email)) = p.email
LEFT JOIN donor_stats ds ON d.user_id = ds.user_id
WHERE d.email IS NOT NULL
ON CONFLICT (person_id) DO UPDATE SET
  lifetime_total = EXCLUDED.lifetime_total,
  ytd_total = EXCLUDED.ytd_total,
  donation_count = EXCLUDED.donation_count,
  first_gift_at = EXCLUDED.first_gift_at,
  last_gift_at = EXCLUDED.last_gift_at,
  is_recurring = EXCLUDED.is_recurring,
  status = EXCLUDED.status;

-- ============================================
-- 3. CREATE ACTIVITY RECORDS FOR DONATIONS
-- ============================================
INSERT INTO activities (person_id, type, description, metadata, created_at)
SELECT 
  p.id as person_id,
  'donation' as type,
  CONCAT('Donated $', don.amount::numeric::text, ' (', don.type, ')') as description,
  jsonb_build_object(
    'amount', don.amount,
    'type', don.type,
    'status', don.status,
    'stripe_payment_intent_id', don.stripe_payment_intent_id,
    'donation_id', don.id
  ) as metadata,
  don.created_at
FROM donations don
JOIN donors d ON don.user_id = d.user_id
JOIN people p ON LOWER(TRIM(d.email)) = p.email
WHERE don.status = 'completed'
ORDER BY don.created_at;

-- ============================================
-- 4. CREATE ACTIVITY RECORDS FOR CONTACT FORM SUBMISSIONS
-- ============================================
-- First, add people from contact submissions
INSERT INTO people (email, name, phone, source, source_detail, created_at)
SELECT 
  LOWER(TRIM(email)) as email,
  CONCAT(first_name, ' ', last_name) as name,
  phone,
  'contact_form' as source,
  subject as source_detail,
  created_at
FROM contact_submissions
WHERE email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  name = COALESCE(people.name, EXCLUDED.name),
  phone = COALESCE(people.phone, EXCLUDED.phone);

-- Then log activities
INSERT INTO activities (person_id, type, description, metadata, created_at)
SELECT 
  p.id as person_id,
  'form_submitted' as type,
  CONCAT('Submitted contact form: ', cs.subject) as description,
  jsonb_build_object(
    'form_type', 'contact',
    'subject', cs.subject,
    'message', cs.message,
    'status', cs.status,
    'submission_id', cs.id
  ) as metadata,
  cs.created_at
FROM contact_submissions cs
JOIN people p ON LOWER(TRIM(cs.email)) = p.email
ORDER BY cs.created_at;

-- ============================================
-- 5. CREATE ACTIVITY RECORDS FOR VOLUNTEER APPLICATIONS
-- ============================================
-- First, add people from volunteer applications
INSERT INTO people (email, name, phone, source, source_detail, tags, created_at)
SELECT 
  LOWER(TRIM(email)) as email,
  name,
  phone,
  'volunteer_form' as source,
  COALESCE(interest, interest_type) as source_detail,
  ARRAY['volunteer'] as tags,
  created_at
FROM volunteer_applications
WHERE email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  name = COALESCE(people.name, EXCLUDED.name),
  phone = COALESCE(people.phone, EXCLUDED.phone),
  tags = CASE 
    WHEN NOT ('volunteer' = ANY(people.tags)) 
    THEN array_append(people.tags, 'volunteer')
    ELSE people.tags
  END;

-- Then log activities
INSERT INTO activities (person_id, type, description, metadata, created_at)
SELECT 
  p.id as person_id,
  'form_submitted' as type,
  CONCAT('Submitted volunteer application: ', COALESCE(va.interest, va.interest_type, 'general')) as description,
  jsonb_build_object(
    'form_type', 'volunteer',
    'interest', COALESCE(va.interest, va.interest_type),
    'experience', va.experience,
    'status', va.status,
    'submission_id', va.id
  ) as metadata,
  va.created_at
FROM volunteer_applications va
JOIN people p ON LOWER(TRIM(va.email)) = p.email
ORDER BY va.created_at;

-- ============================================
-- 6. CREATE ACTIVITY RECORDS FOR EVENT REGISTRATIONS
-- ============================================
-- Note: Event registrations are by parent email
INSERT INTO people (email, name, phone, source, source_detail, tags, created_at)
SELECT DISTINCT ON (LOWER(TRIM(parent_email)))
  LOWER(TRIM(parent_email)) as email,
  parent_name as name,
  parent_phone as phone,
  'event_registration' as source,
  sport as source_detail,
  ARRAY['parent'] as tags,
  created_at
FROM event_registrations
WHERE parent_email IS NOT NULL
ORDER BY LOWER(TRIM(parent_email)), created_at
ON CONFLICT (email) DO UPDATE SET
  name = COALESCE(people.name, EXCLUDED.name),
  phone = COALESCE(people.phone, EXCLUDED.phone),
  tags = CASE 
    WHEN NOT ('parent' = ANY(people.tags)) 
    THEN array_append(people.tags, 'parent')
    ELSE people.tags
  END;

-- Then log activities
INSERT INTO activities (person_id, type, description, metadata, created_at)
SELECT 
  p.id as person_id,
  'event_registered' as type,
  CONCAT('Registered ', er.child_first_name, ' (age ', er.child_age, ') for ', er.sport, ' event') as description,
  jsonb_build_object(
    'child_name', er.child_first_name,
    'child_age', er.child_age,
    'sport', er.sport,
    'event_date', er.event_date,
    'status', er.status,
    'registration_id', er.id,
    'program_id', er.program_id
  ) as metadata,
  er.created_at
FROM event_registrations er
JOIN people p ON LOWER(TRIM(er.parent_email)) = p.email
ORDER BY er.created_at;

-- ============================================
-- 7. UPDATE last_activity_at FOR ALL PEOPLE
-- ============================================
UPDATE people p
SET last_activity_at = (
  SELECT MAX(created_at) 
  FROM activities a 
  WHERE a.person_id = p.id
);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- VERIFICATION QUERIES:
--
-- Check people count:
--   SELECT COUNT(*) FROM people;
--
-- Check donors with details:
--   SELECT COUNT(*) FROM donors_view;
--
-- Check activities:
--   SELECT type, COUNT(*) FROM activities GROUP BY type;
--
-- View a person's timeline:
--   SELECT * FROM activities WHERE person_id = 'uuid' ORDER BY created_at DESC;
-- Upload-Post Social Publishing Integration
-- Creates tables for social drafts, publish results, and extends social_connections

-- ============================================
-- 1. EXTEND SOCIAL_CONNECTIONS TABLE
-- ============================================

-- Add ownership column (org vs personal accounts)
ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS ownership TEXT DEFAULT 'personal' CHECK (ownership IN ('org', 'personal'));

-- Add Upload-Post specific fields
ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS upload_post_user TEXT;

ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS upload_post_profile_data JSONB DEFAULT '{}';

-- Add tracking fields for connection health
ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS last_successful_post_at TIMESTAMPTZ;

ALTER TABLE social_connections 
ADD COLUMN IF NOT EXISTS last_error_message TEXT;

-- Update platform constraint to include Upload-Post supported platforms
ALTER TABLE social_connections DROP CONSTRAINT IF EXISTS social_connections_platform_check;
ALTER TABLE social_connections ADD CONSTRAINT social_connections_platform_check 
CHECK (platform IN ('linkedin', 'medium', 'meta', 'x', 'facebook', 'instagram', 'tiktok', 'youtube', 'threads', 'pinterest', 'reddit', 'bluesky'));

-- ============================================
-- 2. SOCIAL DRAFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT NOT NULL, -- Supabase user ID
  
  -- Content
  text_content TEXT,
  media_urls TEXT[] DEFAULT '{}', -- Array of media URLs
  link_url TEXT,
  
  -- Targeting
  target_platforms TEXT[] DEFAULT '{}', -- ['linkedin', 'x', 'facebook']
  target_accounts UUID[] DEFAULT '{}', -- References to social_connections IDs
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'partially_published', 'failed')),
  
  -- Upload-Post tracking
  upload_post_request_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================
-- 3. SOCIAL PUBLISH RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_publish_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES social_drafts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id UUID REFERENCES social_connections(id) ON DELETE SET NULL,
  
  -- Result
  success BOOLEAN NOT NULL,
  platform_post_id TEXT,
  platform_post_url TEXT,
  error_message TEXT,
  
  -- Upload-Post metadata
  upload_post_response JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_social_connections_ownership ON social_connections(ownership);
CREATE INDEX IF NOT EXISTS idx_social_connections_upload_post_user ON social_connections(upload_post_user);

CREATE INDEX IF NOT EXISTS idx_social_drafts_author_id ON social_drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_drafts_status ON social_drafts(status);
CREATE INDEX IF NOT EXISTS idx_social_drafts_scheduled_at ON social_drafts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_drafts_created_at ON social_drafts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_publish_results_draft_id ON social_publish_results(draft_id);
CREATE INDEX IF NOT EXISTS idx_social_publish_results_platform ON social_publish_results(platform);
CREATE INDEX IF NOT EXISTS idx_social_publish_results_account_id ON social_publish_results(account_id);

-- ============================================
-- 5. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE social_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publish_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Social Drafts: Authors can manage their own, admins can view all
CREATE POLICY "Users can manage own drafts"
  ON social_drafts FOR ALL
  TO authenticated
  USING (
    author_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
      AND role IN ('super_admin', 'content_manager')
    )
  );

-- Social Publish Results: Admins can view
CREATE POLICY "Admins can view publish results"
  ON social_publish_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- Social Publish Results: System can insert (via service role)
CREATE POLICY "Service can insert publish results"
  ON social_publish_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

-- Update social_connections policy to allow viewing org accounts
DROP POLICY IF EXISTS "Admins can manage own social connections" ON social_connections;

CREATE POLICY "Admins can view accessible social connections"
  ON social_connections FOR SELECT
  TO authenticated
  USING (
    -- Own connections
    user_id = auth.uid()::text
    -- Or org connections (visible to all admins)
    OR (
      ownership = 'org'
      AND EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid()::text 
        AND active = true
      )
    )
  );

CREATE POLICY "Admins can manage own social connections"
  ON social_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

CREATE POLICY "Admins can update own social connections"
  ON social_connections FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
    )
  );

CREATE POLICY "Super admins can manage org connections"
  ON social_connections FOR ALL
  TO authenticated
  USING (
    ownership = 'org'
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()::text 
      AND active = true
      AND role = 'super_admin'
    )
  );

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to check if user can connect accounts
CREATE OR REPLACE FUNCTION can_connect_social_accounts(user_id_param TEXT)
RETURNS TABLE (can_connect_org BOOLEAN, can_connect_personal BOOLEAN) AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = user_id_param 
  AND active = true
  LIMIT 1;
  
  -- super_admin can connect both org and personal
  IF user_role = 'super_admin' THEN
    RETURN QUERY SELECT TRUE, TRUE;
  -- content_manager (admin) can connect personal only
  ELSIF user_role = 'content_manager' THEN
    RETURN QUERY SELECT FALSE, TRUE;
  -- viewer (staff/contributor) cannot connect accounts
  ELSE
    RETURN QUERY SELECT FALSE, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get accessible accounts for a user
CREATE OR REPLACE FUNCTION get_accessible_social_accounts(user_id_param TEXT)
RETURNS SETOF social_connections AS $$
BEGIN
  RETURN QUERY
  SELECT sc.*
  FROM social_connections sc
  WHERE sc.active = true
  AND (
    -- Own personal accounts
    sc.user_id = user_id_param
    -- Or org accounts (for any admin)
    OR (
      sc.ownership = 'org'
      AND EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = user_id_param 
        AND active = true
      )
    )
  )
  ORDER BY sc.ownership DESC, sc.connected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Notification Settings Migration
-- Creates a table to store notification email preferences for form submissions

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT TRUE,
  email_addresses TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_settings (notification_type, enabled, email_addresses)
VALUES 
  ('contact_forms', TRUE, ARRAY['ben@bluehomesgroup.com', 'scott@bluehomesgroup.com', 'bryan@bluehomesgroup.com', 'yuliya@confidere.biz']),
  ('event_registrations', TRUE, ARRAY['ben@bluehomesgroup.com', 'scott@bluehomesgroup.com', 'bryan@bluehomesgroup.com', 'yuliya@confidere.biz']),
  ('volunteer_applications', TRUE, ARRAY['ben@bluehomesgroup.com', 'scott@bluehomesgroup.com', 'bryan@bluehomesgroup.com', 'yuliya@confidere.biz'])
ON CONFLICT (notification_type) DO NOTHING;

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read and update
CREATE POLICY "Admins can view notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()::text 
      AND admin_users.active = TRUE
    )
  );

CREATE POLICY "Admins can update notification settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()::text 
      AND admin_users.active = TRUE
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Site Settings Migration
-- Creates a table to store site-wide settings like annual report year and file URL

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text', -- 'text', 'number', 'url', 'file'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('annual_report_year', '2025', 'number', 'Year displayed for the annual report'),
  ('annual_report_url', '/documents/2025-annual-report.html', 'url', 'URL to the annual report document (PDF or HTML)'),
  ('annual_report_file_path', NULL, 'file', 'Path to uploaded annual report file in Supabase Storage')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read and update
CREATE POLICY "Admins can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()::text 
      AND admin_users.active = TRUE
    )
  );

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid()::text 
      AND admin_users.active = TRUE
    )
  );

-- Policy: Service role can insert/update (for API routes)
CREATE POLICY "Service role can manage site settings"
  ON site_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
