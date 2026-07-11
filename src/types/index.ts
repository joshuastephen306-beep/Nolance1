// ============================================================
// NOLANCE — Complete TypeScript Types
// ============================================================

// ── ENUMS ──────────────────────────────────────────────────

export type UserRole = 'buyer' | 'seller' | 'both' | 'admin'
export type AccountStatus = 'pending' | 'active' | 'restricted' | 'suspended' | 'banned'
export type SellerLevel = 'new' | 'level1' | 'level2' | 'top_rated' | 'pro_verified'
export type GigStatus = 'draft' | 'pending' | 'active' | 'paused' | 'denied' | 'deleted'
export type OrderStatus = 'pending' | 'active' | 'delivered' | 'revision' | 'completed' | 'cancelled' | 'disputed'
export type ProposalStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'failed'
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'flagged'
export type SectionType = 'gigs' | 'scout' | 'marketplace' | 'community' | 'directory'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'appealed' | 'closed'
export type NotificationType = 'order' | 'message' | 'review' | 'payment' | 'security' | 'system' | 'community' | 'scout' | 'marketplace'
export type MarketplaceCategory = 'social_media' | 'domain' | 'template' | 'digital_product' | 'software' | 'source_code' | 'ebook' | 'physical' | 'other'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'removed'
export type BusinessPlan = 'free' | 'standard' | 'premium'
export type ManagedStatus = 'requested' | 'reviewing' | 'matched' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'
export type ClearanceStatus = 'pending' | 'cleared' | 'held' | 'released'
export type PackageType = 'basic' | 'standard' | 'premium'

// ── USER ────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  role: UserRole
  status: AccountStatus
  email_verified: boolean
  phone: string | null
  phone_verified: boolean
  country: string | null
  timezone: string | null
  language: string
  currency: string
  profile_photo_url: string | null
  cover_photo_url: string | null
  bio: string | null
  professional_headline: string | null
  website_url: string | null
  trust_score: number
  is_online: boolean
  last_seen: string | null
  created_at: string
  updated_at: string
  // Joined relations
  seller_profile?: SellerProfile
  skills?: UserSkill[]
  languages?: UserLanguage[]
}

export interface UserSkill {
  id: string
  user_id: string
  skill: string
}

export interface UserLanguage {
  id: string
  user_id: string
  language: string
  level: string | null
}

export interface UserEducation {
  id: string
  user_id: string
  institution: string | null
  degree: string | null
  field: string | null
  year_start: number | null
  year_end: number | null
}

export interface UserCertification {
  id: string
  user_id: string
  name: string | null
  issuer: string | null
  year: number | null
  certificate_url: string | null
}

export interface SellerProfile {
  id: string
  user_id: string
  level: SellerLevel
  total_orders_completed: number
  unique_clients: number
  total_earnings: number
  response_rate: number
  response_time_hours: number
  completion_rate: number
  on_time_delivery_rate: number
  average_rating: number
  total_reviews: number
  active_gig_count: number
  max_gig_slots: number
  is_available: boolean
  scout_access: boolean
  marketplace_access: boolean
  community_access: boolean
  directory_access: boolean
  managed_partner: boolean
  created_at: string
  updated_at: string
}

// ── AUTH ────────────────────────────────────────────────────

export interface SignupPayload {
  email: string
  username: string
  password: string
  role: UserRole
  country?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refresh_token: string
}

// ── CATEGORY ─────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  gig_count: number
  subcategories?: Category[]
}

// ── GIGS ─────────────────────────────────────────────────────

export interface Gig {
  id: string
  seller_id: string
  title: string
  slug: string
  category_id: string
  subcategory_id: string | null
  description: string
  status: GigStatus
  denial_reason: string | null
  impressions: number
  clicks: number
  orders_count: number
  conversion_rate: number
  average_rating: number
  total_reviews: number
  is_promoted: boolean
  created_at: string
  updated_at: string
  // Joined
  seller?: User
  category?: Category
  packages?: GigPackage[]
  extras?: GigExtra[]
  gallery?: GigGallery[]
  tags?: GigTag[]
  faqs?: GigFaq[]
  requirements?: GigRequirement[]
  reviews?: Review[]
}

export interface GigTag {
  id: string
  gig_id: string
  tag: string
}

export interface GigPackage {
  id: string
  gig_id: string
  package_type: PackageType
  name: string | null
  description: string | null
  price: number
  delivery_days: number
  revisions: number
  features: Record<string, boolean> | null
}

export interface GigExtra {
  id: string
  gig_id: string
  title: string
  description: string | null
  price: number
  delivery_days_extra: number
}

export interface GigFaq {
  id: string
  gig_id: string
  question: string
  answer: string
  sort_order: number
}

export interface GigRequirement {
  id: string
  gig_id: string
  question: string
  type: 'text' | 'multiple_choice' | 'file'
  options: string[] | null
  is_required: boolean
  sort_order: number
}

export interface GigGallery {
  id: string
  gig_id: string
  type: 'image' | 'video' | 'pdf'
  url: string
  thumbnail_url: string | null
  sort_order: number
}

// Gig creation form steps
export interface GigOverviewForm {
  title: string
  category_id: string
  subcategory_id?: string
  tags: string[]
}

export interface GigPricingForm {
  packages: {
    basic: GigPackageForm
    standard?: GigPackageForm
    premium?: GigPackageForm
  }
  extras?: GigExtraForm[]
}

export interface GigPackageForm {
  name: string
  description: string
  price: number
  delivery_days: number
  revisions: number
  features: Record<string, boolean>
}

export interface GigExtraForm {
  title: string
  description: string
  price: number
  delivery_days_extra: number
}

export interface GigDescriptionForm {
  description: string
  faqs: { question: string; answer: string }[]
}

export interface GigRequirementsForm {
  requirements: {
    question: string
    type: 'text' | 'multiple_choice' | 'file'
    options?: string[]
    is_required: boolean
  }[]
}

// ── ORDERS ───────────────────────────────────────────────────

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  gig_id: string | null
  package_id: string | null
  section: SectionType
  title: string
  requirements_submitted: boolean
  requirements_data: Record<string, unknown> | null
  status: OrderStatus
  price: number
  nolance_fee: number
  seller_earnings: number
  delivery_days: number
  deadline: string | null
  delivered_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  revision_count: number
  max_revisions: number
  is_managed: boolean
  created_at: string
  updated_at: string
  // Joined
  buyer?: User
  seller?: User
  gig?: Gig
  package?: GigPackage
  extras?: OrderExtra[]
  deliveries?: OrderDelivery[]
  revisions?: OrderRevision[]
}

export interface OrderExtra {
  id: string
  order_id: string
  extra_id: string
  title: string | null
  price: number
}

export interface OrderDelivery {
  id: string
  order_id: string
  message: string | null
  files: string[] | null
  is_final: boolean
  created_at: string
}

export interface OrderRevision {
  id: string
  order_id: string
  reason: string
  files: string[] | null
  created_at: string
}

// ── MESSAGES ─────────────────────────────────────────────────

export interface Conversation {
  id: string
  order_id: string | null
  scout_job_id: string | null
  marketplace_listing_id: string | null
  section: SectionType
  is_scout_to_business: boolean
  scout_payment_available: boolean
  scout_payment_count: number
  created_at: string
  updated_at: string
  // Joined
  participants?: User[]
  last_message?: Message
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  files: string[] | null
  message_type: 'text' | 'file' | 'offer' | 'payment_request' | 'system'
  is_flagged: boolean
  is_system_message: boolean
  created_at: string
  // Joined
  sender?: User
}

export interface CustomOffer {
  id: string
  conversation_id: string
  seller_id: string
  buyer_id: string
  title: string
  description: string | null
  price: number
  delivery_days: number
  revisions: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
}

export interface ScoutPayment {
  id: string
  conversation_id: string
  seller_id: string
  buyer_id: string
  title: string
  description: string | null
  amount: number
  commission_rate: number
  commission_amount: number | null
  seller_earnings: number | null
  delivery_days: number | null
  status: PaymentStatus
  clearance_days: number
  clears_at: string | null
  created_at: string
}

// ── REVIEWS ──────────────────────────────────────────────────

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  gig_id: string | null
  rating: number
  comment: string | null
  is_verified: boolean
  seller_response: string | null
  seller_response_at: string | null
  created_at: string
  // Joined
  reviewer?: User
}

// ── PAYMENTS & EARNINGS ───────────────────────────────────────

export interface Payment {
  id: string
  order_id: string
  buyer_id: string
  amount: number
  currency: string
  payment_method: string | null
  payment_provider: string | null
  provider_reference: string | null
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

export interface Earning {
  id: string
  seller_id: string
  order_id: string
  section: SectionType
  gross_amount: number
  commission_rate: number
  commission_amount: number
  net_amount: number
  clearance_status: ClearanceStatus
  clearance_days: number
  clears_at: string
  cleared_at: string | null
  created_at: string
}

export interface Balance {
  id: string
  user_id: string
  available: number
  pending_clearance: number
  total_earned: number
  total_withdrawn: number
  updated_at: string
}

export interface WithdrawalMethod {
  id: string
  user_id: string
  type: string
  label: string | null
  details: Record<string, string>
  is_verified: boolean
  is_default: boolean
  created_at: string
}

export interface Withdrawal {
  id: string
  user_id: string
  method_id: string
  amount: number
  currency: string
  target_currency: string | null
  conversion_rate: number | null
  converted_amount: number | null
  status: WithdrawalStatus
  provider_reference: string | null
  flagged_reason: string | null
  processed_at: string | null
  created_at: string
  method?: WithdrawalMethod
}

// ── SCOUT ─────────────────────────────────────────────────────

export interface ScoutJob {
  id: string
  buyer_id: string
  title: string
  description: string
  category_id: string
  required_skills: string[] | null
  budget_type: 'fixed' | 'hourly'
  budget_min: number | null
  budget_max: number | null
  duration: string | null
  deadline: string | null
  visibility: 'public' | 'invite_only'
  min_seller_level: SellerLevel
  attachments: string[] | null
  status: JobStatus
  proposal_count: number
  community_id: string | null
  created_at: string
  updated_at: string
  expires_at: string
  // Joined
  buyer?: User
  category?: Category
  proposals?: ScoutProposal[]
}

export interface ScoutProposal {
  id: string
  job_id: string
  seller_id: string
  cover_letter: string
  bid_amount: number
  delivery_days: number
  portfolio_samples: string[] | null
  questions: string | null
  status: ProposalStatus
  created_at: string
  updated_at: string
  // Joined
  seller?: User
  job?: ScoutJob
}

export interface ScoutContract {
  id: string
  job_id: string
  proposal_id: string
  buyer_id: string
  seller_id: string
  title: string
  scope: string
  agreed_price: number | null
  agreed_hourly_rate: number | null
  milestones: ScoutMilestone[] | null
  deadline: string | null
  revision_terms: string | null
  status: 'active' | 'completed' | 'disputed' | 'cancelled'
  nda_signed: boolean
  nda_url: string | null
  created_at: string
}

export interface ScoutMilestone {
  id: string
  contract_id: string
  title: string
  description: string | null
  amount: number
  due_date: string | null
  status: 'pending' | 'funded' | 'submitted' | 'approved' | 'released'
  funded: boolean
  funded_at: string | null
  released: boolean
  released_at: string | null
  created_at: string
}

// ── MARKETPLACE ───────────────────────────────────────────────

export interface MarketplaceListing {
  id: string
  seller_id: string
  title: string
  slug: string
  category: MarketplaceCategory
  description: string
  price: number
  currency: string
  delivery_type: 'instant' | 'manual' | 'physical'
  condition: string | null
  proof_of_ownership: string | null
  screenshots: string[] | null
  status: ListingStatus
  commission_rate: number
  views: number
  created_at: string
  updated_at: string
  // Joined
  seller?: User
}

export interface MarketplaceOrder {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  commission_amount: number
  seller_earnings: number
  status: PaymentStatus
  delivery_confirmed: boolean
  delivery_confirmed_at: string | null
  clearance_days: number
  clears_at: string | null
  created_at: string
}

// ── COMMUNITY ─────────────────────────────────────────────────

export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  keywords: string[] | null
  member_count: number
  post_count: number
  is_active: boolean
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  is_member?: boolean
}

export interface CommunityPost {
  id: string
  community_id: string
  author_id: string
  content: string
  gig_link: string | null
  attachments: string[] | null
  post_type: 'post' | 'job' | 'gig_share'
  is_pinned: boolean
  is_flagged: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  // Joined
  author?: User
  comments?: CommunityComment[]
  is_liked?: boolean
}

export interface CommunityComment {
  id: string
  post_id: string
  author_id: string
  content: string
  is_flagged: boolean
  created_at: string
  author?: User
}

// ── BUSINESS DIRECTORY ────────────────────────────────────────

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  plan: BusinessPlan
  plan_expires_at: string | null
  logo_url: string | null
  cover_url: string | null
  website_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  size: string | null
  year_founded: number | null
  is_verified: boolean
  social_links: Record<string, string> | null
  photos: string[] | null
  views: number
  contact_count: number
  created_at: string
  updated_at: string
  // Joined
  owner?: User
  service_needs?: BusinessServiceNeed[]
  reviews?: BusinessReview[]
}

export interface BusinessServiceNeed {
  id: string
  business_id: string
  title: string
  description: string | null
  category_id: string | null
  budget_range: string | null
  deadline: string | null
  is_active: boolean
  created_at: string
  category?: Category
}

export interface BusinessReview {
  id: string
  business_id: string
  reviewer_id: string
  rating: number
  comment: string | null
  business_response: string | null
  created_at: string
  reviewer?: User
}

// ── MANAGED SERVICES ──────────────────────────────────────────

export interface ManagedRequest {
  id: string
  buyer_id: string
  title: string
  description: string
  category_id: string | null
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  attachments: string[] | null
  trust_reason: string | null
  status: ManagedStatus
  handling_type: 'nolance_team' | 'matched_seller' | null
  assigned_seller_id: string | null
  commission_rate: number
  created_at: string
  updated_at: string
  // Joined
  buyer?: User
  assigned_seller?: User
  category?: Category
}

// ── DISPUTES ──────────────────────────────────────────────────

export interface Dispute {
  id: string
  order_id: string
  opened_by: string
  against: string
  section: SectionType
  reason: string
  evidence: string[] | null
  status: DisputeStatus
  resolution: string | null
  resolution_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  appeal_opened: boolean
  appeal_reason: string | null
  created_at: string
  updated_at: string
  order?: Order
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

// ── MARKET AI ─────────────────────────────────────────────────

export interface MarketTrend {
  id: string
  category_id: string
  keyword: string
  demand_score: number
  trend_direction: 'rising' | 'stable' | 'declining' | 'new'
  region: string | null
  week_start: string
  created_at: string
  category?: Category
}

export interface SellerOpportunityAlert {
  id: string
  seller_id: string
  title: string | null
  description: string | null
  category_id: string | null
  business_id: string | null
  alert_type: string
  is_read: boolean
  created_at: string
}

// ── API RESPONSES ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// ── SEARCH & FILTERS ──────────────────────────────────────────

export interface GigSearchFilters {
  query?: string
  category_id?: string
  subcategory_id?: string
  min_price?: number
  max_price?: number
  delivery_days?: number
  seller_level?: SellerLevel
  min_rating?: number
  is_online?: boolean
  country?: string
  sort?: 'best_selling' | 'newest' | 'top_rated' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

export interface ScoutJobFilters {
  query?: string
  category_id?: string
  budget_type?: 'fixed' | 'hourly'
  min_budget?: number
  max_budget?: number
  duration?: string
  min_seller_level?: SellerLevel
  community_id?: string
  sort?: 'newest' | 'budget_high' | 'budget_low' | 'most_proposals'
  page?: number
  limit?: number
}

export interface MarketplaceFilters {
  query?: string
  category?: MarketplaceCategory
  min_price?: number
  max_price?: number
  delivery_type?: 'instant' | 'manual' | 'physical'
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'most_viewed'
  page?: number
  limit?: number
}

export interface DirectoryFilters {
  query?: string
  category?: string
  country?: string
  city?: string
  size?: string
  plan?: BusinessPlan
  has_service_needs?: boolean
  sort?: 'newest' | 'most_viewed' | 'most_contacted'
  page?: number
  limit?: number
}

// ── DASHBOARD ─────────────────────────────────────────────────

export interface SellerDashboardStats {
  active_orders: number
  orders_in_queue: number
  earnings_today: number
  earnings_this_month: number
  pending_clearance: number
  available_balance: number
  completion_rate: number
  response_rate: number
  on_time_delivery_rate: number
  level: SellerLevel
  total_reviews: number
  average_rating: number
  impressions_this_week: number
  clicks_this_week: number
}

export interface BuyerDashboardStats {
  active_orders: number
  total_spent: number
  saved_gigs: number
  saved_sellers: number
  open_scout_jobs: number
  total_proposals_received: number
  marketplace_purchases: number
}

// ── SECTION REGISTRATION ──────────────────────────────────────

export interface SectionRegistration {
  id: string
  user_id: string
  section: SectionType
  status: AccountStatus
  terms_agreed: boolean
  terms_agreed_at: string | null
  registered_at: string
}

// ── NOLANCE PLUS ──────────────────────────────────────────────

export interface NolancePlusSubscription {
  id: string
  user_id: string
  plan: 'monthly' | 'annual'
  price: number
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
}

// ── AFFILIATE ─────────────────────────────────────────────────

export interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  total_referrals: number
  total_earnings: number
  created_at: string
}

// ── STORE ─────────────────────────────────────────────────────

export interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export interface UIStore {
  sidebarOpen: boolean
  activeSection: SectionType
  theme: 'light' | 'dark'
  setSidebarOpen: (open: boolean) => void
  setActiveSection: (section: SectionType) => void
  setTheme: (theme: 'light' | 'dark') => void
}
