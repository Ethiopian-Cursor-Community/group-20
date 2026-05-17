import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEtb } from "@/lib/utils";
import { demoActivatePlan } from "@/lib/demoPayment";

type Props = {
  open: boolean;
  planName: string;
  planSlug: "pro" | "elite";
  priceEtb: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DemoCheckoutModal({
  open,
  planName,
  planSlug,
  priceEtb,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [error, setError] = useState("");

  const handlePay = async () => {
    setError("");
    setStep("processing");
    try {
      await demoActivatePlan(planSlug);
      setStep("done");
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep("confirm");
      }, 1200);
    } catch {
      setError("Demo payment failed. Run Supabase migrations (demo_activate_plan RPC).");
      setStep("confirm");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-card"
        role="dialog"
        aria-labelledby="demo-checkout-title"
      >
        <div className="flex items-center gap-2 text-primary">
          <CreditCard className="h-5 w-5" aria-hidden />
          <h2 id="demo-checkout-title" className="font-display text-lg font-bold text-navy">
            ETB checkout (demo)
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Simulates a Chapa payment for judges — no real money is charged.
        </p>

        <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">{planName} plan</p>
          <p className="text-muted-foreground">{formatEtb(priceEtb)} · Telebirr / Chapa (simulated)</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "processing" && (
            <motion.p
              key="proc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Processing demo payment…
            </motion.p>
          )}
          {step === "done" && (
            <motion.p
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-sm text-primary"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Payment successful — plan activated!
            </motion.p>
          )}
        </AnimatePresence>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={step === "processing"}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handlePay} disabled={step !== "confirm"}>
            Pay {formatEtb(priceEtb)}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
