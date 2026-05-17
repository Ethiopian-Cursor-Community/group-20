export type AppRole = "influencer" | "advertiser" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

export type InfluencerProfile = {
  id: string;
  user_id: string;
  display_name: string;
  niche: string | null;
  city: string | null;
  headline: string | null;
  followers_count: number;
  verification_status: "pending" | "verified" | "rejected";
  is_featured: boolean;
  onboarding_step: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  social_links?: SocialLink[];
};

export type AdvertiserProfile = {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
};

export type SocialLink = {
  id: string;
  influencer_profile_id: string;
  platform: string;
  url: string;
  handle: string | null;
};

export type Campaign = {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  budget_etb: number;
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  requirements: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignApplication = {
  id: string;
  campaign_id: string;
  influencer_id: string;
  pitch: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  campaigns?: Campaign;
  influencer_profiles?: InfluencerProfile;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  campaign_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  price_etb: number;
  tier_rank: number;
  features: string[];
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  subscription_plans?: SubscriptionPlan;
};

export type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  campaign_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
    Functions: {
      has_role: { Args: { _user_id: string; _role: AppRole }; Returns: boolean };
      admin_verify_influencer: {
        Args: { target_user_id: string; new_status: string };
        Returns: InfluencerProfile;
      };
      admin_platform_stats: { Args: Record<string, never>; Returns: Record<string, number> };
    };
  };
};
