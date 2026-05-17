import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import DemoCheckoutModal from "@/components/payments/DemoCheckoutModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatEtb, cn } from "@/lib/utils";
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
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Atmospheric blurs in the page background */}
        <div
          aria-hidden="true"
          className="md-blur-shape -left-32 top-32 h-72 w-72 bg-primary/15"
        />
        <div
          aria-hidden="true"
          className="md-blur-shape right-0 top-0 h-72 w-72 bg-md-tertiary/15"
        />

        <div className="relative text-center">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Subscription plans
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-md-on-surface-variant">
            Tiered visibility in ETB — demo checkout simulates local payment rails.
          </p>
        </div>

        {isLoading && (
          <p className="mt-10 text-center text-md-on-surface-variant">Loading plans…</p>
        )}

        <div className="relative mt-12 grid items-stretch gap-6 md:grid-cols-3">
          {plans?.map((plan) => {
            const featured = plan.slug === "pro";
            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative flex flex-col rounded-xl bg-md-surface-container p-8 shadow-md-1 transition-all duration-300 ease-md hover:shadow-md-2",
                  featured && "ring-2 ring-primary md:-translate-y-4 md:shadow-md-2",
                )}
              >
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent">Popular</Badge>
                  </div>
                )}

                <h3 className="text-2xl font-medium tracking-tight text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-medium tracking-tight text-foreground">
                    {plan.price_etb === 0 ? "Free" : formatEtb(Number(plan.price_etb))}
                  </span>
                  {plan.price_etb > 0 && (
                    <span className="text-sm text-md-on-surface-variant">/ month</span>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3 text-sm text-md-on-surface-variant">
                  {plan.features.map((f: string) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 transition-transform duration-200 ease-md group-hover:translate-x-0.5"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.slug === "free" ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Included
                    </Button>
                  ) : (
                    <Button
                      variant={featured ? "default" : "outline"}
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
                </div>
              </div>
            );
          })}
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
