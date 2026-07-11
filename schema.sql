-- ============================================================
-- NOLANCE COMPLETE DATABASE SCHEMA
-- Stack: Supabase (PostgreSQL)
-- Version: 1.0
-- Built by: Joshua Eniola
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'both', 'admin');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'restricted', 'suspended', 'banned');
CREATE TYPE seller_level AS ENUM ('new', 'level1', 'level2', 'top_rated', 'pro_verified');
CREATE TYPE gig_status AS ENUM ('draft', 'pending', 'active', 'paused', 'denied', 'deleted');
CREATE TYPE order_status AS ENUM ('pending', 'active', 'delivered', 'revision', 'completed', 'cancelled', 'disputed');
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn', 'expired');
CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded', 'failed');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'flagged');
CREATE TYPE section_type AS ENUM ('gigs', 'scout', 'marketplace', 'community', 'directory');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'appealed', 'closed');
CREATE TYPE notification_type AS ENUM ('order', 'message', 'review', 'payment', 'security', 'system', 'community', 'scout', 'marketplace');
CREATE TYPE marketplace_category AS ENUM ('social_media', 'domain', 'template', 'digital_product', 'software', 'source_code', 'ebook', 'physical', 'other');
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'active', 'sold', 'removed');
CREATE TYPE business_plan AS ENUM ('free', 'standard', 'premium');
CREATE TYPE violation_type AS ENUM ('off_platform', 'fake_review', 'spam', 'harassment', 'ip_violation', 'fraud', 'prohibited_service', 'other');
CREATE TYPE strike_level AS ENUM ('warning', 'restriction', 'suspension', 'ban');
CREATE TYPE managed_status AS ENUM ('requested', 'reviewing', 'matched', 'in_progress', 'delivered', 'completed', 'cancelled');
CREATE TYPE clearance_status AS ENUM ('pending', 'cleared', 'held', 'released');
CREATE TYPE contract_status AS ENUM ('active', 'completed', 'disputed', 'cancelled');

-- ============================================================
-- SECTION 1: USERS & PROFILES
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  status account_status NOT NULL DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_attempts_today INT DEFAULT 0,
  phone_last_attempt TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  country VARCHAR(100),
  timezone VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'USD',
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  bio TEXT,
  professional_headline VARCHAR(150),
  website_url TEXT,
  trust_score NUMERIC(5,2) DEFAULT 50.00,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  level VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  institution VARCHAR(200),
  degree VARCHAR(200),
  field VARCHAR(200),
  year_start INT,
  year_end INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200),
  issuer VARCHAR(200),
  year INT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level seller_level DEFAULT 'new',
  total_orders_completed INT DEFAULT 0,
  unique_clients INT DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 100.00,
  response_time_hours NUMERIC(5,2) DEFAULT 24,
  completion_rate NUMERIC(5,2) DEFAULT 100.00,
  on_time_delivery_rate NUMERIC(5,2) DEFAULT 100.00,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  active_gig_count INT DEFAULT 0,
  max_gig_slots INT DEFAULT 5,
  is_available BOOLEAN DEFAULT TRUE,
  scout_access BOOLEAN DEFAULT FALSE,
  marketplace_access BOOLEAN DEFAULT FALSE,
  community_access BOOLEAN DEFAULT FALSE,
  directory_access BOOLEAN DEFAULT FALSE,
  managed_partner BOOLEAN DEFAULT FALSE,
  last_level_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: SECURITY & AUTHENTICATION
-- ============================================================

CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE phone_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE login_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(50),
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  device_info TEXT,
  location TEXT,
  success BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: SECTION REGISTRATIONS
-- ============================================================

CREATE TABLE section_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  section section_type NOT NULL,
  status account_status DEFAULT 'active',
  terms_agreed BOOLEAN DEFAULT FALSE,
  terms_agreed_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section)
);

-- ============================================================
-- SECTION 4: CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  gig_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: GIGS
-- ============================================================

CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(80) NOT NULL,
  slug TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  status gig_status DEFAULT 'draft',
  denial_reason TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  orders_count INT DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gig_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  tag VARCHAR(20) NOT NULL,
  CONSTRAINT tag_length CHECK (char_length(tag) <= 20),
  CONSTRAINT tag_words CHECK (array_length(string_to_array(trim(tag), ' '), 1) <= 3)
);

CREATE TABLE gig_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  package_type VARCHAR(10) CHECK (package_type IN ('basic', 'standard', 'premium')),
  name VARCHAR(100),
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  delivery_days INT NOT NULL,
  revisions INT DEFAULT 1,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gig_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  delivery_days_extra INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gig_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gig_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('text', 'multiple_choice', 'file')),
  options JSONB,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gig_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('image', 'video', 'pdf')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gig_id)
);

CREATE TABLE work_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  description TEXT,
  url TEXT NOT NULL,
  type VARCHAR(20),
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: ORDERS
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  gig_id UUID REFERENCES gigs(id),
  package_id UUID REFERENCES gig_packages(id),
  section section_type DEFAULT 'gigs',
  title TEXT NOT NULL,
  requirements_submitted BOOLEAN DEFAULT FALSE,
  requirements_data JSONB,
  status order_status DEFAULT 'pending',
  price NUMERIC(10,2) NOT NULL,
  nolance_fee NUMERIC(10,2) NOT NULL,
  seller_earnings NUMERIC(10,2) NOT NULL,
  delivery_days INT NOT NULL,
  deadline TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  revision_count INT DEFAULT 0,
  max_revisions INT DEFAULT 1,
  is_managed BOOLEAN DEFAULT FALSE,
  managed_services_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  extra_id UUID REFERENCES gig_extras(id),
  title TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  message TEXT,
  files JSONB,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  files JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id),
  extra_days INT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: PAYMENTS & EARNINGS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  provider_reference TEXT,
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  section section_type DEFAULT 'gigs',
  gross_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  clearance_status clearance_status DEFAULT 'pending',
  clearance_days INT NOT NULL,
  clears_at TIMESTAMPTZ NOT NULL,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  available NUMERIC(12,2) DEFAULT 0,
  pending_clearance NUMERIC(12,2) DEFAULT 0,
  total_earned NUMERIC(12,2) DEFAULT 0,
  total_withdrawn NUMERIC(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawal_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100),
  details JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  method_id UUID REFERENCES withdrawal_methods(id),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  target_currency VARCHAR(10),
  conversion_rate NUMERIC(10,6),
  converted_amount NUMERIC(10,2),
  status withdrawal_status DEFAULT 'pending',
  provider_reference TEXT,
  flagged_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: MESSAGING
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  scout_job_id UUID,
  marketplace_listing_id UUID,
  section section_type DEFAULT 'gigs',
  is_scout_to_business BOOLEAN DEFAULT FALSE,
  scout_payment_available BOOLEAN DEFAULT FALSE,
  scout_payment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  files JSONB,
  message_type VARCHAR(20) DEFAULT 'text',
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  is_system_message BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE custom_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id),
  buyer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  delivery_days INT NOT NULL,
  revisions INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  seller_id UUID REFERENCES users(id),
  buyer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 10,
  commission_amount NUMERIC(10,2),
  seller_earnings NUMERIC(10,2),
  delivery_days INT,
  status payment_status DEFAULT 'pending',
  clearance_days INT DEFAULT 2,
  clears_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  gig_id UUID REFERENCES gigs(id),
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  seller_response TEXT,
  seller_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 10: SCOUT SECTION
-- ============================================================

CREATE TABLE scout_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  required_skills JSONB,
  budget_type VARCHAR(20) CHECK (budget_type IN ('fixed', 'hourly')),
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  duration VARCHAR(50),
  deadline TIMESTAMPTZ,
  visibility VARCHAR(20) DEFAULT 'public',
  min_seller_level seller_level DEFAULT 'new',
  attachments JSONB,
  status job_status DEFAULT 'open',
  proposal_count INT DEFAULT 0,
  community_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE scout_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES scout_jobs(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id),
  cover_letter TEXT NOT NULL,
  bid_amount NUMERIC(10,2) NOT NULL,
  delivery_days INT NOT NULL,
  portfolio_samples JSONB,
  questions TEXT,
  status proposal_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seller_id)
);

CREATE TABLE scout_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES scout_jobs(id),
  proposal_id UUID REFERENCES scout_proposals(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  agreed_price NUMERIC(10,2),
  agreed_hourly_rate NUMERIC(10,2),
  milestones JSONB,
  deadline TIMESTAMPTZ,
  revision_terms TEXT,
  status contract_status DEFAULT 'active',
  nda_signed BOOLEAN DEFAULT FALSE,
  nda_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES scout_contracts(id),
  requested_by UUID REFERENCES users(id),
  description TEXT NOT NULL,
  additional_cost NUMERIC(10,2) DEFAULT 0,
  additional_days INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES scout_contracts(id),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  due_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending',
  funded BOOLEAN DEFAULT FALSE,
  funded_at TIMESTAMPTZ,
  released BOOLEAN DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES scout_contracts(id),
  seller_id UUID REFERENCES users(id),
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  week_start DATE,
  is_disputed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11: MARKETPLACE
-- ============================================================

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  slug TEXT UNIQUE,
  category marketplace_category NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  delivery_type VARCHAR(20) CHECK (delivery_type IN ('instant', 'manual', 'physical')),
  condition VARCHAR(20),
  proof_of_ownership TEXT,
  screenshots JSONB,
  status listing_status DEFAULT 'pending',
  commission_rate NUMERIC(5,2) DEFAULT 5,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  seller_earnings NUMERIC(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  delivery_confirmed BOOLEAN DEFAULT FALSE,
  delivery_confirmed_at TIMESTAMPTZ,
  clearance_days INT DEFAULT 2,
  clears_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 12: COMMUNITY
-- ============================================================

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  keywords JSONB,
  member_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  gig_link TEXT,
  attachments JSONB,
  post_type VARCHAR(20) DEFAULT 'post',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE gig_post_count (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  community_id UUID REFERENCES communities(id),
  week_start DATE,
  count INT DEFAULT 0,
  UNIQUE(user_id, community_id, week_start)
);

-- ============================================================
-- SECTION 13: BUSINESS DIRECTORY
-- ============================================================

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  slug TEXT UNIQUE,
  category VARCHAR(100),
  description TEXT,
  plan business_plan DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  logo_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  size VARCHAR(20),
  year_founded INT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  social_links JSONB,
  photos JSONB,
  views INT DEFAULT 0,
  contact_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_service_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  budget_range VARCHAR(100),
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  business_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 14: MANAGED SERVICES
-- ============================================================

CREATE TABLE managed_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  deadline TIMESTAMPTZ,
  attachments JSONB,
  trust_reason TEXT,
  status managed_status DEFAULT 'requested',
  handling_type VARCHAR(20) CHECK (handling_type IN ('nolance_team', 'matched_seller')),
  assigned_seller_id UUID REFERENCES users(id),
  commission_rate NUMERIC(5,2) DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE managed_seller_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES managed_requests(id),
  seller_id UUID REFERENCES users(id),
  portfolio_url TEXT,
  approved BOOLEAN,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 15: DISPUTES & RESOLUTION
-- ============================================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  opened_by UUID REFERENCES users(id),
  against UUID REFERENCES users(id),
  section section_type DEFAULT 'gigs',
  reason TEXT NOT NULL,
  evidence JSONB,
  status dispute_status DEFAULT 'open',
  resolution VARCHAR(20),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  appeal_opened BOOLEAN DEFAULT FALSE,
  appeal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dispute_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  attachments JSONB,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 16: TRUST & SAFETY
-- ============================================================

CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID REFERENCES users(id),
  target_type VARCHAR(50),
  target_id UUID,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE account_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  violation_type violation_type NOT NULL,
  description TEXT,
  strike strike_level NOT NULL,
  issued_by UUID REFERENCES users(id),
  evidence JSONB,
  appealed BOOLEAN DEFAULT FALSE,
  appeal_text TEXT,
  appeal_status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fund_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL,
  hold_type VARCHAR(20) CHECK (hold_type IN ('flag', 'suspension', 'fraud')),
  hold_days INT NOT NULL,
  releases_at TIMESTAMPTZ NOT NULL,
  released BOOLEAN DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 17: NOTIFICATIONS & EMAILS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email_to VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  template VARCHAR(100),
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 18: PROMOTIONS & AFFILIATES
-- ============================================================

CREATE TABLE promoted_gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id),
  budget NUMERIC(10,2),
  spent NUMERIC(10,2) DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  total_referrals INT DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  referred_user_id UUID REFERENCES users(id),
  commission_rate NUMERIC(5,2) DEFAULT 10,
  total_commission NUMERIC(10,2) DEFAULT 0,
  active_months INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nolance_plus_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan VARCHAR(20) CHECK (plan IN ('monthly', 'annual')),
  price NUMERIC(10,2),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 19: MARKET AI
-- ============================================================

CREATE TABLE market_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  keyword VARCHAR(200),
  demand_score NUMERIC(5,2),
  trend_direction VARCHAR(20) CHECK (trend_direction IN ('rising', 'stable', 'declining', 'new')),
  region VARCHAR(100),
  week_start DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_opportunity_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  business_id UUID REFERENCES businesses(id),
  alert_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 20: PROJECT ROOMS & VIDEO CALLS
-- ============================================================

CREATE TABLE project_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES scout_contracts(id),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_room_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES project_rooms(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  url TEXT NOT NULL,
  filename TEXT,
  milestone_id UUID REFERENCES scout_milestones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  initiated_by UUID REFERENCES users(id),
  participant_ids JSONB,
  recording_url TEXT,
  recording_consented BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 21: INVOICES & TAX
-- ============================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  invoice_number VARCHAR(50) UNIQUE,
  amount NUMERIC(10,2),
  commission_amount NUMERIC(10,2),
  net_amount NUMERIC(10,2),
  currency VARCHAR(10),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ndas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES scout_contracts(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  signed_by_buyer BOOLEAN DEFAULT FALSE,
  signed_by_seller BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_gigs_seller ON gigs(seller_id);
CREATE INDEX idx_gigs_category ON gigs(category_id);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_slug ON gigs(slug);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_scout_jobs_status ON scout_jobs(status);
CREATE INDEX idx_scout_jobs_buyer ON scout_jobs(buyer_id);
CREATE INDEX idx_scout_proposals_job ON scout_proposals(job_id);
CREATE INDEX idx_scout_proposals_seller ON scout_proposals(seller_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_plan ON businesses(plan);
CREATE INDEX idx_reviews_gig ON reviews(gig_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_earnings_seller ON earnings(seller_id);
CREATE INDEX idx_earnings_clearance ON earnings(clearance_status);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_gigs_updated BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_seller_profiles_updated BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scout_jobs_updated BEFORE UPDATE ON scout_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_marketplace_listings_updated BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'NL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_balance_on_earning()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clearance_status = 'cleared' AND OLD.clearance_status = 'pending' THEN
    UPDATE balances SET available = available + NEW.net_amount, updated_at = NOW() WHERE user_id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_balance_update AFTER UPDATE ON earnings FOR EACH ROW EXECUTE FUNCTION update_balance_on_earning();

CREATE OR REPLACE FUNCTION update_gig_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gig_slug BEFORE INSERT ON gigs FOR EACH ROW EXECUTE FUNCTION update_gig_slug();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "gigs_public_read" ON gigs FOR SELECT USING (status = 'active');
CREATE POLICY "gigs_seller_manage" ON gigs FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "orders_parties_only" ON orders FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "messages_participants_only" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "earnings_own" ON earnings FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "balance_own" ON balances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "withdrawals_own" ON withdrawals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- END OF NOLANCE DATABASE SCHEMA v1.0
-- ============================================================
