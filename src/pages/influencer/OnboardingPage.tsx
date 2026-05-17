import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = ["Profile", "Social", "Bio", "Reach", "Review"];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [platform, setPlatform] = useState("Instagram");
  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [followers, setFollowers] = useState("0");

  const { data: profile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
  });

  const saveStep = async () => {
    if (!user) return;
    const nextStep = step + 1;

    if (step === 0) {
      await supabase.from("influencer_profiles").update({ display_name: displayName, niche, city, onboarding_step: 1 }).eq("user_id", user.id);
      await supabase.from("profiles").update({ full_name: displayName }).eq("id", user.id);
    } else if (step === 1 && profile?.id) {
      await supabase.from("social_links").insert({ influencer_profile_id: profile.id, platform, url, handle: url });
      await supabase.from("influencer_profiles").update({ onboarding_step: 2 }).eq("user_id", user.id);
    } else if (step === 2) {
      await supabase.from("influencer_profiles").update({ headline, onboarding_step: 3 }).eq("user_id", user.id);
      await supabase.from("profiles").update({ bio }).eq("id", user.id);
    } else if (step === 3) {
      await supabase
        .from("influencer_profiles")
        .update({ followers_count: Number(followers) || 0, onboarding_step: 4 })
        .eq("user_id", user.id);
    } else if (step === 4) {
      await supabase
        .from("influencer_profiles")
        .update({ onboarding_completed: true, onboarding_step: 5 })
        .eq("user_id", user.id);
      toast.success("Onboarding complete — you appear in the directory!");
      navigate("/influencer");
      return;
    }

    setStep(nextStep);
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-navy">
            Onboarding — step {step + 1} of {STEPS.length}: {STEPS[step]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div><Label>Display name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
              <div><Label>Niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} /></div>
              <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            </>
          )}
          {step === 1 && (
            <>
              <div><Label>Platform</Label><Input value={platform} onChange={(e) => setPlatform(e.target.value)} /></div>
              <div><Label>Profile URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} /></div>
            </>
          )}
          {step === 2 && (
            <>
              <div><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
              <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></div>
            </>
          )}
          {step === 3 && (
            <div><Label>Followers</Label><Input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} /></div>
          )}
          {step === 4 && (
            <p className="text-sm text-muted-foreground">
              Review your profile, then finish to appear in the public directory.
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <Button onClick={saveStep}>{step === 4 ? "Finish" : "Continue"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
