import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileForm({
  userId,
  initial,
  onSaved,
}: {
  userId: string;
  initial: { displayName: string; niche: string; headline: string; bio: string };
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [niche, setNiche] = useState(initial.niche);
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio);

  const save = useMutation({
    mutationFn: async () => {
      await supabase
        .from("influencer_profiles")
        .update({ display_name: displayName, niche, headline })
        .eq("user_id", userId);
      await supabase.from("profiles").update({ bio }).eq("id", userId);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      onSaved();
    },
    onError: () => toast.error("Failed to save profile"),
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Display name</Label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <Label>Niche</Label>
        <Input value={niche} onChange={(e) => setNiche(e.target.value)} />
      </div>
      <div>
        <Label>Headline</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        Save profile
      </Button>
    </div>
  );
}

export default function InfluencerProfilePage() {
  const { user, refreshProfile, profile: authProfile } = useAuth();
  const qc = useQueryClient();

  const { data: influencer, isLoading } = useQuery({
    queryKey: ["influencer-profile-edit", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (!influencer || !user) {
    return <p className="text-muted-foreground">Profile not found.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile management</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm
          key={influencer.id}
          userId={user.id}
          initial={{
            displayName: influencer.display_name ?? "",
            niche: influencer.niche ?? "",
            headline: influencer.headline ?? "",
            bio: authProfile?.bio ?? "",
          }}
          onSaved={async () => {
            await refreshProfile();
            qc.invalidateQueries({ queryKey: ["influencer-profile-edit"] });
          }}
        />
      </CardContent>
    </Card>
  );
}
