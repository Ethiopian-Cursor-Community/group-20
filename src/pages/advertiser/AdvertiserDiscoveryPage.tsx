import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InfluencerProfile } from "@/types/database";

export default function AdvertiserDiscoveryPage() {
  const { data } = useQuery({
    queryKey: ["discovery"],
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("onboarding_completed", true)
        .order("is_featured", { ascending: false })
        .limit(24);
      return (rows ?? []) as InfluencerProfile[];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Discover creators</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((inf) => (
          <Link key={inf.id} to={`/influencer/${inf.user_id}`}>
            <Card className="h-full hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{inf.display_name}</h3>
                  {inf.verification_status === "verified" && <Badge variant="verified">Verified</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{inf.niche} · {inf.city}</p>
                <ButtonLink inf={inf} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ButtonLink({ inf }: { inf: InfluencerProfile }) {
  return (
    <Link
      to={`/advertiser/messages?peer=${inf.user_id}`}
      className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      Message creator →
    </Link>
  );
}
