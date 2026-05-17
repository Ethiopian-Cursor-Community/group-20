-- Seed subscription plans
INSERT INTO public.subscription_plans (slug, name, price_etb, tier_rank, features) VALUES
  ('free', 'Free', 0, 0, '["Basic directory listing","Up to 3 applications/month"]'::jsonb),
  ('pro', 'Pro', 499, 1, '["Priority directory placement","Unlimited applications","Verified badge eligible"]'::jsonb),
  ('elite', 'Elite', 1499, 2, '["Featured homepage slot","Analytics dashboard","Dedicated support"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
