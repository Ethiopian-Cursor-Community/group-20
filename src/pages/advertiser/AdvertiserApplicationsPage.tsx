import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampaignApplication } from "@/types/database";

export default function AdvertiserApplicationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: applications } = useQuery({
    queryKey: ["advertiser-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, title")
        .eq("advertiser_id", user!);
      const ids = campaigns?.map((c) => c.id) ?? [];
      if (ids.length === 0) return [];

      const { data } = await supabase
        .from("campaign_applications")
        .select("*")
        .in("campaign_id", ids);

      const enriched = await Promise.all(
        (data ?? []).map(async (app) => {
          const campaign = campaigns?.find((c) => c.id === app.campaign_id);
          const { data: inf } = await supabase
            .from("influencer_profiles")
            .select("display_name, user_id")
            .eq("user_id", app.influencer_id)
            .maybeSingle();
          return {
            ...app,
            campaigns: campaign ? { title: campaign.title } : undefined,
            influencer_profiles: inf ?? undefined,
          };
        }),
      );
      return enriched as CampaignApplication[];
    },
  });

  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase.from("campaign_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application updated");
      qc.invalidateQueries({ queryKey: ["advertiser-applications"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Applications</h1>
      {!applications?.length && <p className="text-muted-foreground">No applications yet.</p>}
      <div className="grid gap-4">
        {applications?.map((app) => (
          <Card key={app.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold">{app.campaigns?.title}</h3>
                <Badge variant="outline">{app.status}</Badge>
              </div>
              <p className="text-sm">From: {app.influencer_profiles?.display_name}</p>
              <p className="text-sm text-muted-foreground">{app.pitch}</p>
              {app.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review.mutate({ id: app.id, status: "accepted" })}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => review.mutate({ id: app.id, status: "rejected" })}>Reject</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
