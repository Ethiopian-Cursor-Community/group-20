import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth, authErrorMessage } from "@/features/auth/AuthProvider";
import type { AppRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, primaryRole, user } = useAuth();

  const defaultMode = params.get("mode") === "signup" ? "signup" : "signin";
  const defaultRole = (params.get("role") as AppRole) || "influencer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<AppRole>(defaultRole);
  const [loading, setLoading] = useState(false);

  const dashboardForRole = (r: AppRole | null) =>
    r === "admin" ? "/admin" : r === "advertiser" ? "/advertiser" : "/influencer";

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate(dashboardForRole(primaryRole ?? role), { replace: true });
    } catch (err) {
      toast.error(authErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUp({
        email,
        password,
        role,
        fullName,
        companyName: role === "advertiser" ? companyName : undefined,
      });

      if (needsEmailConfirmation) {
        toast.info(
          "Account created. Check your email to confirm, then sign in. For hackathon demos, disable “Confirm email” in Supabase.",
          { duration: 8000 },
        );
        return;
      }

      toast.success("Account created!");
      navigate(role === "advertiser" ? "/advertiser" : "/influencer/onboarding", { replace: true });
    } catch (err) {
      toast.error(authErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate(dashboardForRole(primaryRole ?? "influencer"), { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/5 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy">InfluencerHub</CardTitle>
            <CardDescription>Ethiopia&apos;s creator marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="email-in">Email</Label>
                    <Input
                      id="email-in"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pass-in">Password</Label>
                    <Input
                      id="pass-in"
                      type="password"
                      autoComplete="current-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-4 space-y-4">
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">I am a…</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(["influencer", "advertiser"] as AppRole[]).map((r) => (
                        <Button
                          key={r}
                          type="button"
                          variant={role === r ? "default" : "outline"}
                          onClick={() => setRole(r)}
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  {role === "advertiser" && (
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email-up">Email</Label>
                    <Input
                      id="email-up"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pass-up">Password (8+)</Label>
                    <Input
                      id="pass-up"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
