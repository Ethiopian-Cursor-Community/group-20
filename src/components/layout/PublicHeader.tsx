import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  const { user, primaryRole } = useAuth();

  const dashboardPath =
    primaryRole === "admin"
      ? "/admin"
      : primaryRole === "advertiser"
        ? "/advertiser"
        : "/influencer";

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-md-outline/20 bg-background/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-xl font-medium tracking-tight text-foreground"
        >
          Influencer<span className="text-primary">Hub</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link
            to="/directory"
            className="rounded-full px-4 py-2 text-md-on-surface-variant transition-colors duration-200 ease-md hover:bg-primary/10 hover:text-primary"
          >
            Directory
          </Link>
          <Link
            to="/pricing"
            className="rounded-full px-4 py-2 text-md-on-surface-variant transition-colors duration-200 ease-md hover:bg-primary/10 hover:text-primary"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to={dashboardPath}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
