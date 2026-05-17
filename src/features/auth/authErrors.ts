import type { AuthError } from "@supabase/supabase-js";

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
