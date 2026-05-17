-- Server-side admin actions (never trust frontend alone)

CREATE OR REPLACE FUNCTION public.admin_verify_influencer(
  target_user_id UUID,
  new_status verification_status
)
RETURNS public.influencer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.influencer_profiles;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.influencer_profiles
  SET verification_status = new_status,
      is_featured = CASE WHEN new_status = 'verified' THEN is_featured ELSE false END,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Influencer not found';
  END IF;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_verify_influencer(UUID, verification_status) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_influencers', (SELECT COUNT(*) FROM public.influencer_profiles),
    'total_advertisers', (SELECT COUNT(*) FROM public.advertiser_profiles),
    'open_campaigns', (SELECT COUNT(*) FROM public.campaigns WHERE status = 'open'),
    'mrr_etb', (
      SELECT COALESCE(SUM(sp.price_etb), 0)
      FROM public.subscriptions s
      JOIN public.subscription_plans sp ON sp.id = s.plan_id
      WHERE s.status = 'active' AND sp.slug != 'free'
    ),
    'gmv_etb', (
      SELECT COALESCE(SUM(amount_etb), 0)
      FROM public.payments
      WHERE status = 'success'
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_platform_stats() TO authenticated;
