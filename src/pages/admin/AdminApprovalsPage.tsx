import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InfluencerProfile } from "@/types/database";

export default function AdminApprovalsPage() {
  const qc = useQueryClient();

  const { data: pending } = useQuery({
    queryKey: ["pending-influencers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("verification_status", "pending")
        .eq("onboarding_completed", true);
      return (data ?? []) as InfluencerProfile[];
    },
  });

  const verify = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "verified" | "rejected" }) => {
      const { error } = await supabase.rpc("admin_verify_influencer", {
        target_user_id: userId,
        new_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification updated (server-side RPC)");
      qc.invalidateQueries({ queryKey: ["pending-influencers"] });
    },
    onError: () => toast.error("Verification failed — admin role required"),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Verification queue</h1>
      {!pending?.length && <p className="text-muted-foreground">No pending verifications.</p>}
      <div className="grid gap-4">
        {pending?.map((inf) => (
          <Card key={inf.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <h3 className="font-semibold">{inf.display_name}</h3>
                <p className="text-sm text-muted-foreground">{inf.niche} · {inf.city}</p>
                <Badge className="mt-1" variant="pending">Pending</Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => verify.mutate({ userId: inf.user_id, status: "verified" })}>Verify</Button>
                <Button variant="outline" onClick={() => verify.mutate({ userId: inf.user_id, status: "rejected" })}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
