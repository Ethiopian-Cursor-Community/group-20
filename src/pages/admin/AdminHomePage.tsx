import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEtb } from "@/lib/utils";

export default function AdminHomePage() {
  const { data: stats, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_platform_stats");
      if (error) throw error;
      return data as Record<string, number>;
    },
  });

  if (isError) {
    return <p className="text-destructive">Admin stats unavailable. Ensure you have admin role in user_roles.</p>;
  }

  const cards = [
    { label: "Total users", value: stats?.total_users ?? 0 },
    { label: "Influencers", value: stats?.total_influencers ?? 0 },
    { label: "Advertisers", value: stats?.total_advertisers ?? 0 },
    { label: "Open campaigns", value: stats?.open_campaigns ?? 0 },
    { label: "MRR (ETB)", value: formatEtb(stats?.mrr_etb ?? 0) },
    { label: "GMV (ETB)", value: formatEtb(stats?.gmv_etb ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{c.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
