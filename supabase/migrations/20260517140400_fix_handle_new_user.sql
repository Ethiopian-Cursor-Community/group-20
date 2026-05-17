-- Fix signup failures: safe role parsing + optional free plan

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role app_role;
  display TEXT;
  role_text TEXT;
  free_plan_id UUID;
BEGIN
  role_text := NEW.raw_user_meta_data->>'role';

  BEGIN
    selected_role := COALESCE(role_text::app_role, 'influencer'::app_role);
  EXCEPTION
    WHEN OTHERS THEN
      selected_role := 'influencer'::app_role;
  END;

  display := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, display)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF selected_role = 'influencer' THEN
    INSERT INTO public.influencer_profiles (user_id, display_name)
    VALUES (NEW.id, display)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF selected_role = 'advertiser' THEN
    INSERT INTO public.advertiser_profiles (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', display))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;

  IF free_plan_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active');
  END IF;

  RETURN NEW;
END;
$$;
