import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PublicHeader from "@/components/layout/PublicHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import type { InfluencerProfile } from "@/types/database";

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["directory", search, niche, city],
    queryFn: async () => {
      let q = supabase
        .from("influencer_profiles")
        .select("*, profiles(full_name, avatar_url)")
        .eq("onboarding_completed", true)
        .order("is_featured", { ascending: false });

      if (niche) q = q.ilike("niche", `%${niche}%`);
      if (city) q = q.ilike("city", `%${city}%`);
      if (search) q = q.ilike("display_name", `%${search}%`);

      const { data: rows, error } = await q;
      if (error) throw error;
      return rows as InfluencerProfile[];
    },
  });

  const niches = useMemo(
    () => [...new Set((data ?? []).map((d) => d.niche).filter(Boolean))] as string[],
    [data],
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-navy">Creator directory</h1>
        <p className="mt-2 text-muted-foreground">Discover verified Ethiopian influencers</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search name…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search creators" />
          <Input placeholder="Filter niche…" value={niche} onChange={(e) => setNiche(e.target.value)} list="niches" aria-label="Filter by niche" />
          <datalist id="niches">{niches.map((n) => <option key={n} value={n} />)}</datalist>
          <Input placeholder="City…" value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city" />
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        )}
        {isError && <p className="mt-8 text-destructive">Could not load directory. Check Supabase connection.</p>}
        {!isLoading && !isError && data?.length === 0 && (
          <p className="mt-8 text-muted-foreground">No creators match your filters yet.</p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((inf) => (
            <Link key={inf.id} to={`/influencer/${inf.user_id}`}>
              <Card className="h-full transition hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{inf.display_name}</h3>
                      <p className="text-sm text-muted-foreground">{inf.niche} · {inf.city}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{inf.followers_count.toLocaleString()} followers</p>
                    </div>
                    {inf.verification_status === "verified" && <Badge variant="verified">Verified</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
