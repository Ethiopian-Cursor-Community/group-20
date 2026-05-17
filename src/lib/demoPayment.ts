import { supabase } from "@/lib/supabase";

/** Simulates ETB checkout for hackathon demos — no Chapa API required. */
export async function demoActivatePlan(planSlug: "pro" | "elite") {
  await delay(1800);

  const { data, error } = await supabase.rpc("demo_activate_plan", {
    plan_slug: planSlug,
  });

  if (error) throw error;
  return data as { ok: boolean; plan: string; tx_ref: string };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
