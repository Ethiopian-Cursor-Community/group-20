import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { plan_slug } = await req.json();
    if (!plan_slug || !["pro", "elite"].includes(plan_slug)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: corsHeaders });
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: plan } = await service
      .from("subscription_plans")
      .select("*")
      .eq("slug", plan_slug)
      .single();

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), { status: 404, headers: corsHeaders });
    }

    const txRef = `ih-${user.id.slice(0, 8)}-${Date.now()}`;
    const amount = Number(plan.price_etb);

    await service.from("payments").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_etb: amount,
      chapa_tx_ref: txRef,
      status: "pending",
      metadata: { plan_slug },
    });

    const chapaSecret = Deno.env.get("CHAPA_SECRET_KEY");
    if (!chapaSecret) {
      return new Response(JSON.stringify({ error: "Chapa not configured" }), { status: 500, headers: corsHeaders });
    }

    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chapaSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ETB",
        email: user.email,
        first_name: user.user_metadata?.full_name ?? "InfluencerHub",
        tx_ref: txRef,
        callback_url: `${Deno.env.get("PUBLIC_APP_URL")}/pricing?payment=verify`,
        return_url: `${Deno.env.get("PUBLIC_APP_URL")}/pricing?payment=success`,
        customization: {
          title: "InfluencerHub",
          description: `${plan.name} subscription`,
        },
      }),
    });

    const chapaData = await chapaRes.json();
    if (!chapaRes.ok) {
      return new Response(JSON.stringify({ error: chapaData.message ?? "Chapa init failed" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ checkout_url: chapaData.data.checkout_url, tx_ref: txRef }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
