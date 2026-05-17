import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfluencerAnalyticsPage() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["influencer-analytics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: apps } = await supabase
        .from("campaign_applications")
        .select("status")
        .eq("influencer_id", user!.id);
      const counts = { pending: 0, accepted: 0, rejected: 0 };
      apps?.forEach((a) => {
        const s = a.status as keyof typeof counts;
        if (s in counts) counts[s] += 1;
      });
      return [
        { name: "Pending", value: counts.pending },
        { name: "Accepted", value: counts.accepted },
        { name: "Rejected", value: counts.rejected },
      ];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Analytics</h1>
      <Card>
        <CardHeader><CardTitle>Application outcomes</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
