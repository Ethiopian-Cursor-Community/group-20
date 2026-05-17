import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppRole, Profile, UserRole } from "@/types/database";

export function authErrorMessage(error: AuthError | Error): string {
  const msg = error.message ?? "Authentication failed";

  if (msg.includes("Invalid login credentials")) {
    return "Invalid email or password. If you just signed up, confirm your email first (check inbox/spam), or disable “Confirm email” in Supabase → Authentication → Providers → Email.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please confirm your email before signing in. Check your inbox or disable email confirmation in Supabase for local demos.";
  }
  if (msg.includes("User already registered")) {
    return "This email is already registered. Try signing in instead.";
  }
  if (msg.includes("Password")) {
    return msg;
  }
  if (msg.includes("rate limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }

  return msg;
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    role: AppRole;
    fullName: string;
    companyName?: string;
  }) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    setProfile((profileData as Profile | null) ?? null);
    setRoles((rolesData ?? []).map((r) => (r as UserRole).role));
  }, []);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        await loadUserData(nextSession.user.id);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (!mounted) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      if (initial?.user) {
        await loadUserData(initial.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      return;
    }
    loadUserData(user.id);
  }, [user, loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session?.user) {
      await loadUserData(data.session.user.id);
    }
  };

  const signUp = async (payload: {
    email: string;
    password: string;
    role: AppRole;
    fullName: string;
    companyName?: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          role: payload.role,
          full_name: payload.fullName,
          company_name: payload.companyName ?? null,
        },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) throw error;

    const needsEmailConfirmation = !data.session;

    if (data.session?.user) {
      setSession(data.session);
      setUser(data.session.user);
      await loadUserData(data.session.user.id);
    }

    return { needsEmailConfirmation };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);

  const primaryRole = useMemo<AppRole | null>(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("advertiser")) return "advertiser";
    if (roles.includes("influencer")) return "influencer";
    return roles[0] ?? null;
  }, [roles]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      roles,
      primaryRole,
      loading,
      signIn,
      signUp,
      signOut,
      hasRole,
      refreshProfile: async () => {
        if (user) await loadUserData(user.id);
      },
    }),
    [session, user, profile, roles, primaryRole, loading, hasRole, loadUserData, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
