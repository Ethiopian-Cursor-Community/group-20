import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InfluencerHomePage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["influencer-me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
  });

  const { data: apps } = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("campaign_applications").select("*, campaigns(title, status)").eq("influencer_id", user!.id);
      return data ?? [];
    },
  });

  if (profile && !profile.onboarding_completed) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Complete onboarding to appear in the directory.</p>
          <Button className="mt-4" asChild><Link to="/influencer/onboarding">Continue onboarding</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Influencer dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.display_name}</p>
        {profile?.verification_status === "verified" && <Badge className="mt-2" variant="verified">Verified creator</Badge>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Applications</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{apps?.length ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Followers</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{profile?.followers_count?.toLocaleString() ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Visibility</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{profile?.is_featured ? "Featured" : "Standard"}</CardContent></Card>
      </div>
    </div>
  );
}
