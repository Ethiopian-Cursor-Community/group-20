import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PublicHeader from "@/components/layout/PublicHeader";
import DemoCheckoutModal from "@/components/payments/DemoCheckoutModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatEtb } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import type { SubscriptionPlan } from "@/types/database";

export default function PricingPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const [checkout, setCheckout] = useState<{ slug: "pro" | "elite"; name: string; price: number } | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*").order("tier_rank");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(String(p.features ?? "[]")),
      })) as SubscriptionPlan[];
    },
  });

  if (params.get("payment") === "success") {
    toast.success("Plan upgraded successfully.");
    setParams({}, { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-navy">Subscription plans</h1>
          <p className="mt-2 text-muted-foreground">
            Tiered visibility in ETB — demo checkout simulates local payment rails
          </p>
        </div>

        {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading plans…</p>}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className={plan.slug === "pro" ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.slug === "pro" && <Badge variant="accent">Popular</Badge>}
                </CardTitle>
                <CardDescription>
                  {plan.price_etb === 0 ? "Free forever" : formatEtb(Number(plan.price_etb))}
                  {plan.price_etb > 0 && " / month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f: string) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                {plan.slug === "free" ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Included
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled={!user}
                    onClick={() =>
                      setCheckout({
                        slug: plan.slug as "pro" | "elite",
                        name: plan.name,
                        price: Number(plan.price_etb),
                      })
                    }
                  >
                    {user ? "Upgrade (demo pay)" : "Sign in to upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {checkout && (
        <DemoCheckoutModal
          open
          planName={checkout.name}
          planSlug={checkout.slug}
          priceEtb={checkout.price}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            toast.success(`${checkout.name} activated`);
            qc.invalidateQueries({ queryKey: ["my-subscription"] });
          }}
        />
      )}
    </div>
  );
}
