import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, chapa-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const txRef = payload.tx_ref ?? payload.data?.tx_ref;
    const status = payload.status ?? payload.data?.status;

    if (!txRef) {
      return new Response(JSON.stringify({ error: "Missing tx_ref" }), { status: 400, headers: corsHeaders });
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: payment } = await service
      .from("payments")
      .select("*")
      .eq("chapa_tx_ref", txRef)
      .single();

    if (!payment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), { status: 404, headers: corsHeaders });
    }

    if (status !== "success" && status !== "successful") {
      await service.from("payments").update({ status: "failed" }).eq("id", payment.id);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    await service.from("payments").update({ status: "success" }).eq("id", payment.id);

    const planSlug = (payment.metadata as { plan_slug?: string })?.plan_slug;
    if (planSlug) {
      const { data: plan } = await service.from("subscription_plans").select("id").eq("slug", planSlug).single();
      if (plan) {
        const { data: existing } = await service
          .from("subscriptions")
          .select("id")
          .eq("user_id", payment.user_id)
          .maybeSingle();

        const subPayload = {
          user_id: payment.user_id,
          plan_id: plan.id,
          status: "active",
          chapa_reference: txRef,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        if (existing?.id) {
          await service.from("subscriptions").update(subPayload).eq("id", existing.id);
        } else {
          await service.from("subscriptions").insert(subPayload);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
