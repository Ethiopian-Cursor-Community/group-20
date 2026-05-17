import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEtb } from "@/lib/utils";

export default function AdvertiserHomePage() {
  const { user } = useAuth();

  const { data: campaigns } = useQuery({
    queryKey: ["advertiser-campaigns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*").eq("advertiser_id", user!.id);
      return data ?? [];
    },
  });

  const open = campaigns?.filter((c) => c.status === "open").length ?? 0;
  const spend = campaigns?.reduce((s, c) => s + Number(c.budget_etb), 0) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Advertiser dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Open campaigns</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{open}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total budget</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatEtb(spend)}</CardContent></Card>
      </div>
    </div>
  );
}
