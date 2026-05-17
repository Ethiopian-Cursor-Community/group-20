import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/types/database";

export default function AdvertiserCampaignsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  const { data: campaigns } = useQuery({
    queryKey: ["advertiser-campaigns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*").eq("advertiser_id", user!.id).order("created_at", { ascending: false });
      return (data ?? []) as Campaign[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert({
        advertiser_id: user!.id,
        title,
        description,
        budget_etb: Number(budget) || 0,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign published");
      setTitle("");
      setDescription("");
      setBudget("");
      qc.invalidateQueries({ queryKey: ["advertiser-campaigns"] });
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("campaigns").update({ status }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["advertiser-campaigns"] }),
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-navy">Campaigns</h1>
      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Budget ETB" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Textarea className="sm:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={() => create.mutate()} disabled={!title || !description}>Post campaign</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {campaigns?.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{c.status}</Badge>
                {c.status === "draft" && (
                  <Button size="sm" onClick={() => setStatus.mutate({ id: c.id, status: "open" })}>Publish</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
