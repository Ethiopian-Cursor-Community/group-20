-- Demo-only subscription activation (hackathon / local demo without Chapa).
-- Replace with chapa-verify edge function in production.

CREATE OR REPLACE FUNCTION public.demo_activate_plan(plan_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  plan_row public.subscription_plans%ROWTYPE;
  tx_ref TEXT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF plan_slug NOT IN ('pro', 'elite') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  SELECT * INTO plan_row FROM public.subscription_plans WHERE slug = plan_slug LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;

  tx_ref := 'demo-' || uid::text || '-' || floor(extract(epoch FROM now()))::text;

  INSERT INTO public.payments (user_id, plan_id, amount_etb, chapa_tx_ref, status, metadata)
  VALUES (uid, plan_row.id, plan_row.price_etb, tx_ref, 'success', jsonb_build_object('demo', true, 'plan_slug', plan_slug));

  UPDATE public.subscriptions
  SET plan_id = plan_row.id,
      status = 'active',
      chapa_reference = tx_ref,
      current_period_end = now() + interval '30 days',
      updated_at = now()
  WHERE user_id = uid;

  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, chapa_reference, current_period_end)
    VALUES (uid, plan_row.id, 'active', tx_ref, now() + interval '30 days');
  END IF;

  RETURN json_build_object('ok', true, 'plan', plan_slug, 'tx_ref', tx_ref);
END;
$$;

GRANT EXECUTE ON FUNCTION public.demo_activate_plan(TEXT) TO authenticated;
