import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Verified creator directory",
    body: "Search Ethiopian influencers by niche, platform, and city with verification badges.",
  },
  {
    title: "Campaign marketplace",
    body: "Advertisers post briefs; creators apply and get hired in one workflow.",
  },
  {
    title: "Realtime messaging",
    body: "Negotiate deals and share deliverables without leaving the platform.",
  },
  {
    title: "Local payments (ETB)",
    body: "Upgrade visibility with Pro & Elite tiers — ETB-ready (demo checkout for hackathons).",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6">
        {/* Hero: large rounded surface-container with layered atmospheric blur shapes */}
        <div className="relative overflow-hidden rounded-3xl bg-md-surface-container px-6 py-20 shadow-md-1 sm:rounded-[3rem] sm:px-12 sm:py-24">
          <div
            aria-hidden="true"
            className="md-blur-shape -left-24 -top-24 h-80 w-80 bg-primary/30"
          />
          <div
            aria-hidden="true"
            className="md-blur-shape -right-16 top-10 h-72 w-72 bg-md-tertiary/25"
          />
          <div
            aria-hidden="true"
            className="md-blur-shape bottom-[-6rem] left-1/3 h-96 w-96 bg-secondary/60"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-secondary-foreground">
              Ethiopia&apos;s influencer marketplace
            </span>
            <h1 className="mt-6 font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-6xl">
              Connect brands with creators who drive{" "}
              <span className="text-primary">real results</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-md-on-surface-variant">
              InfluencerHub unifies discovery, campaigns, messaging, and ETB
              subscriptions for influencers and advertisers.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/auth?mode=signup&role=influencer">Join as influencer</Link>
              </Button>
              <Button size="lg" variant="accent" asChild>
                <Link to="/auth?mode=signup&role=advertiser">Join as advertiser</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Feature cards — hover lift + scale, no borders, tonal surface */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
              className="group rounded-xl bg-md-surface-container p-6 shadow-md-1 transition-all duration-300 ease-md hover:-translate-y-1 hover:shadow-md-2 hover:scale-[1.02]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <span className="text-sm font-medium">{i + 1}</span>
              </div>
              <h3 className="text-lg font-medium leading-tight text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-md-on-surface-variant">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
