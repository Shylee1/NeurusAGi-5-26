export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

export interface Profile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  location_city?: string;
  location_state?: string;
  location_country?: string;
  compliance_region?: string;
  must_change_password?: boolean;
  password_changed_at?: string | null;
  status?: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export type EarlyAccessStatus =
  | 'new'
  | 'reviewing'
  | 'approved'
  | 'invited'
  | 'onboarded'
  | 'declined';

export interface EarlyAccessRequest {
  id: string;
  created_at: string;
  updated_at?: string;
  full_name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  team_size?: string | null;
  use_case?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  locale?: string | null;
  languages?: string | null;
  referrer?: string | null;
  landing_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_type?: string | null;
  screen?: string | null;
  platform?: string | null;
  hardware?: string | null;
  user_agent?: string | null;
  source?: string | null;
  status: EarlyAccessStatus;
  priority?: number | null;
  notes?: string | null;
  contacted_at?: string | null;
  decided_at?: string | null;
}

export interface AdminMessage {
  id: string;
  created_at: string;
  created_by?: string | null;
  subject: string;
  body: string;
  audience: 'selected' | 'status' | 'all';
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: 'queued' | 'sent' | 'partial' | 'failed';
  error?: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5' | 'tier6';
  status: 'active' | 'suspended' | 'cancelled';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyMedia {
  id: string;
  added_by: string;
  title: string;
  description?: string;
  media_type: 'article' | 'video' | 'podcast' | 'other';
  url: string;
  thumbnail_url?: string;
  source?: string;
  published: boolean;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  inquiry_type: 'general' | 'media' | 'support';
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
}

export interface InvestorInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ComplianceRule {
  id: string;
  region: string;
  disclosures?: Record<string, string>;
  restricted_features?: string[];
  data_retention_days?: number;
  requires_explicit_consent: boolean;
  gdpr_compliant: boolean;
  created_at: string;
  updated_at: string;
}
