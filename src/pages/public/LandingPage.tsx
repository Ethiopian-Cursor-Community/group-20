import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ethiopia&apos;s influencer marketplace
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Connect brands with creators who drive real results
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            InfluencerHub unifies discovery, campaigns, messaging, and ETB subscriptions for
            influencers and advertisers.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth?mode=signup&role=influencer">Join as influencer</Link>
            </Button>
            <Button size="lg" variant="navy" asChild>
              <Link to="/auth?mode=signup&role=advertiser">Join as advertiser</Link>
            </Button>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
