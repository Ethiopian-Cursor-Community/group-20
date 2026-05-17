import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEtb } from "@/lib/utils";

export default function AdvertiserBillingPage() {
  const { user } = useAuth();

  const { data: payments } = useQuery({
    queryKey: ["payments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Billing</h1>
      {!payments?.length && <p className="text-muted-foreground">No payments yet.</p>}
      <div className="grid gap-3">
        {payments?.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <span>{formatEtb(Number(p.amount_etb))}</span>
              <Badge variant={p.status === "success" ? "verified" : "pending"}>{p.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
