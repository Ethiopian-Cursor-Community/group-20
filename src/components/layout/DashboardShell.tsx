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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="border-b p-5">
          <Link to="/" className="font-display text-lg font-bold text-navy">
            Influencer<span className="text-primary">Hub</span>
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground">{title}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === basePath}>
              {item.label}
              {item.label === "Messages" && unread > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="mb-2 truncate text-xs text-muted-foreground">{profile?.full_name}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
          <span className="font-display font-bold text-navy">{title}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
