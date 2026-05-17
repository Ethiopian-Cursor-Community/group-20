import { Link, NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/useUnreadCount";

type NavItem = { to: string; label: string };

type Props = {
  title: string;
  nav: NavItem[];
  basePath: string;
};

export default function DashboardShell({ title, nav, basePath }: Props) {
  const { profile, signOut } = useAuth();
  const unread = useUnreadCount();

  // MD3 nav items are pill-shaped tonal containers with state layers
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition-all duration-300 ease-md ${
      isActive
        ? "bg-secondary text-secondary-foreground shadow-md-1"
        : "text-md-on-surface-variant hover:bg-primary/10 hover:text-primary"
    }`;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-md-outline/20 bg-md-surface-container md:flex">
        <div className="p-6">
          <Link to="/" className="font-display text-lg font-medium tracking-tight text-foreground">
            Influencer<span className="text-primary">Hub</span>
          </Link>
          <p className="mt-1 truncate text-xs text-md-on-surface-variant">{title}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === basePath}>
              <span className="flex-1">{item.label}</span>
              {item.label === "Messages" && unread > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-md-tertiary px-1.5 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <div className="rounded-2xl bg-background/60 p-3">
            <p className="mb-3 truncate text-xs text-md-on-surface-variant">{profile?.full_name}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-md-outline/20 bg-background/75 px-4 py-3 backdrop-blur-xl md:hidden">
          <span className="font-display font-medium tracking-tight text-foreground">{title}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
