import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function InfluencerProfilePage() {
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [niche, setNiche] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["influencer-profile-edit", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setNiche(profile.niche ?? "");
      setHeadline(profile.headline ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      await supabase
        .from("influencer_profiles")
        .update({ display_name: displayName, niche, headline })
        .eq("user_id", user!.id);
      await supabase.from("profiles").update({ bio }).eq("id", user!.id);
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["influencer-profile-edit"] });
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Profile management</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Display name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
        <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} /></div>
        <div><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
        <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        <Button onClick={() => save.mutate()}>Save profile</Button>
      </CardContent>
    </Card>
  );
}
