import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PublicHeader from "@/components/layout/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import type { InfluencerProfile, Review } from "@/types/database";

export default function InfluencerPublicPage() {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["influencer-public", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*, profiles(*), social_links(*)")
        .eq("user_id", id!)
        .single();
      if (error) throw error;
      return data as InfluencerProfile;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewee_id", id!)
        .order("created_at", { ascending: false });
      return (data ?? []) as Review[];
    },
  });

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <Skeleton className="mx-auto mt-10 h-64 max-w-3xl rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <p className="p-10 text-center text-muted-foreground">Creator not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-navy">{profile.display_name}</h1>
                <p className="text-muted-foreground">
                  {profile.headline ?? profile.niche} · {profile.city}
                </p>
                <p className="mt-1 text-sm">{profile.followers_count.toLocaleString()} followers</p>
              </div>
              <div className="flex gap-2">
                {profile.verification_status === "verified" && (
                  <Badge variant="verified">Verified</Badge>
                )}
                {avgRating && <Badge variant="secondary">★ {avgRating}</Badge>}
              </div>
            </div>
            {profile.profiles?.bio && <p className="text-sm leading-relaxed">{profile.profiles.bio}</p>}
            <div className="flex flex-wrap gap-2">
              {profile.social_links?.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {link.platform}
                </a>
              ))}
            </div>
            {user && hasRole("advertiser") && id && (
              <Button asChild>
                <Link to={`/advertiser/messages?peer=${id}`}>Send message</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {reviews && reviews.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="font-display text-lg font-semibold">Reviews</h2>
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-4 text-sm">
                  <span className="font-semibold">★ {r.rating}</span>
                  {r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
