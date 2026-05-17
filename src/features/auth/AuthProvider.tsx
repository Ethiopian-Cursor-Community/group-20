import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppRole, Profile, UserRole } from "@/types/database";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppRole | null>;
  signUp: (payload: {
    email: string;
    password: string;
    role: AppRole;
    fullName: string;
    companyName?: string;
  }) => Promise<{ needsEmailConfirmation: boolean; role: AppRole | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextType = AuthContextValue;

function resolvePrimaryRole(roles: AppRole[]): AppRole | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("advertiser")) return "advertiser";
  if (roles.includes("influencer")) return "influencer";
  return roles[0] ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string): Promise<AppRole[]> => {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const nextRoles = (rolesData ?? []).map((r) => (r as UserRole).role);
    setProfile((profileData as Profile | null) ?? null);
    setRoles(nextRoles);
    return nextRoles;
  }, []);

  const clearUserData = useCallback(() => {
    setProfile(null);
    setRoles([]);
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
      } else {
        clearUserData();
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (!mounted) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      if (initial?.user) {
        await loadUserData(initial.user.id);
      } else {
        clearUserData();
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, clearUserData]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session?.user) return null;
      const nextRoles = await loadUserData(data.session.user.id);
      return resolvePrimaryRole(nextRoles);
    },
    [loadUserData],
  );

  const signUp = useCallback(
    async (payload: {
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
      let role: AppRole | null = payload.role;

      if (data.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        const nextRoles = await loadUserData(data.session.user.id);
        role = resolvePrimaryRole(nextRoles) ?? payload.role;
      }

      return { needsEmailConfirmation, role };
    },
    [loadUserData],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearUserData();
  }, [clearUserData]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);

  const primaryRole = useMemo(() => resolvePrimaryRole(roles), [roles]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user.id);
  }, [user, loadUserData]);

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
      refreshProfile,
    }),
    [
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
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
