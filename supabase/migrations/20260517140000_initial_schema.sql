-- InfluencerHub: schema, RLS, triggers, has_role()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE app_role AS ENUM ('influencer', 'advertiser', 'admin');
CREATE TYPE campaign_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Profiles (NO role column)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT NOT NULL DEFAULT 'ET',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles ONLY here
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

CREATE TABLE public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  niche TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  headline TEXT,
  followers_count INTEGER NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_etb NUMERIC(12,2) NOT NULL DEFAULT 0,
  tier_rank INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  chapa_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount_etb NUMERIC(12,2) NOT NULL,
  chapa_tx_ref TEXT UNIQUE,
  status payment_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_etb NUMERIC(12,2) NOT NULL DEFAULT 0,
  status campaign_status NOT NULL DEFAULT 'draft',
  requirements TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, influencer_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_messages_recipient_unread ON public.messages(recipient_id) WHERE read_at IS NULL;

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, reviewee_id, campaign_id)
);

-- has_role SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated, anon;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER influencer_profiles_updated_at BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER advertiser_profiles_updated_at BEFORE UPDATE ON public.advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle_new_user: profile + role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role app_role;
  display TEXT;
BEGIN
  selected_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'influencer'::app_role
  );

  display := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, display);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);

  IF selected_role = 'influencer' THEN
    INSERT INTO public.influencer_profiles (user_id, display_name)
    VALUES (NEW.id, display);
  ELSIF selected_role = 'advertiser' THEN
    INSERT INTO public.advertiser_profiles (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', display));
  END IF;

  -- Free plan subscription
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  SELECT NEW.id, sp.id, 'active'
  FROM public.subscription_plans sp
  WHERE sp.slug = 'free'
  LIMIT 1;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles: users read own; admin read all via function
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- influencer_profiles
CREATE POLICY "influencer_profiles_select_public" ON public.influencer_profiles FOR SELECT USING (true);
CREATE POLICY "influencer_profiles_update_own" ON public.influencer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "influencer_profiles_insert_own" ON public.influencer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "influencer_profiles_admin_all" ON public.influencer_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- advertiser_profiles
CREATE POLICY "advertiser_profiles_select_own" ON public.advertiser_profiles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "advertiser_profiles_select_public_directory" ON public.advertiser_profiles FOR SELECT USING (true);
CREATE POLICY "advertiser_profiles_update_own" ON public.advertiser_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "advertiser_profiles_insert_own" ON public.advertiser_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- social_links
CREATE POLICY "social_links_select_public" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "social_links_manage_own" ON public.social_links FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.influencer_profiles ip
    WHERE ip.id = influencer_profile_id AND ip.user_id = auth.uid()
  )
);

-- subscription_plans public read
CREATE POLICY "plans_select_all" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "plans_admin_write" ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "subscriptions_update_service" ON public.subscriptions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- payments
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- campaigns
CREATE POLICY "campaigns_select_open" ON public.campaigns FOR SELECT USING (
  status IN ('open', 'in_progress', 'completed') OR advertiser_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "campaigns_insert_advertiser" ON public.campaigns FOR INSERT WITH CHECK (
  auth.uid() = advertiser_id AND public.has_role(auth.uid(), 'advertiser')
);
CREATE POLICY "campaigns_update_own" ON public.campaigns FOR UPDATE USING (
  auth.uid() = advertiser_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "campaigns_delete_own" ON public.campaigns FOR DELETE USING (
  auth.uid() = advertiser_id OR public.has_role(auth.uid(), 'admin')
);

-- applications
CREATE POLICY "applications_select_involved" ON public.campaign_applications FOR SELECT USING (
  auth.uid() = influencer_id
  OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.advertiser_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "applications_insert_influencer" ON public.campaign_applications FOR INSERT WITH CHECK (
  auth.uid() = influencer_id AND public.has_role(auth.uid(), 'influencer')
);
CREATE POLICY "applications_update_advertiser" ON public.campaign_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.advertiser_id = auth.uid())
  OR auth.uid() = influencer_id
  OR public.has_role(auth.uid(), 'admin')
);

-- messages
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "messages_insert_sender" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_recipient_read" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);

-- reviews
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_authenticated" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
