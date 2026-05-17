import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: roles?.filter((r) => r.user_id === p.id).map((r) => r.role) ?? [],
      }));
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">User management</h1>
      <div className="grid gap-3">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-6">
              <div>
                <p className="font-medium">{u.full_name ?? "Unnamed"}</p>
                <p className="text-xs text-muted-foreground">{u.id}</p>
              </div>
              <div className="flex gap-1">
                {u.roles.map((r: string) => (
                  <Badge key={r} variant="secondary">{r}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
