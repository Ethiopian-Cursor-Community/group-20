import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEtb } from "@/lib/utils";

export default function InfluencerSubscriptionPage() {
  const { user } = useAuth();

  const { data: sub } = useQuery({
    queryKey: ["my-subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const plan = sub?.subscription_plans;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Subscription</h1>
      <Card>
        <CardHeader><CardTitle>Current plan</CardTitle></CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{plan?.name ?? "Free"}</p>
          <p className="text-muted-foreground">{plan ? formatEtb(Number(plan.price_etb)) : "ETB 0"} / month</p>
          <Button className="mt-4" asChild><Link to="/pricing">View plans & upgrade</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
