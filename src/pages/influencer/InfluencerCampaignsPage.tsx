import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatEtb } from "@/lib/utils";
import type { Campaign } from "@/types/database";

export default function InfluencerCampaignsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [pitch, setPitch] = useState<Record<string, string>>({});

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["open-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").eq("status", "open").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const apply = useMutation({
    mutationFn: async ({ campaignId, text }: { campaignId: string; text: string }) => {
      const { error } = await supabase.from("campaign_applications").insert({
        campaign_id: campaignId,
        influencer_id: user!.id,
        pitch: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted");
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: () => toast.error("Could not apply — you may have already applied"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading campaigns…</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Open campaigns</h1>
      {!campaigns?.length && <p className="text-muted-foreground">No open campaigns right now.</p>}
      <div className="grid gap-4">
        {campaigns?.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{c.title}</h3>
                <Badge variant="secondary">{formatEtb(Number(c.budget_etb))}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <Textarea
                placeholder="Your pitch…"
                value={pitch[c.id] ?? ""}
                onChange={(e) => setPitch({ ...pitch, [c.id]: e.target.value })}
              />
              <Button
                onClick={() => apply.mutate({ campaignId: c.id, text: pitch[c.id] ?? "" })}
                disabled={!pitch[c.id]?.trim()}
              >
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
