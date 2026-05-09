import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { sitePageMetadata } from "@/lib/site-metadata";

export const metadata = sitePageMetadata(
  "Order confirmed",
  "Your Midnight Satin paperback order was received."
);

export default async function PaperbackSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ novelId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { novelId } = await params;
  const { session_id: sessionId } = await searchParams;

  // Redirect if session_id is missing
  if (!sessionId) {
    redirect(`/novel/${novelId}`);
  }

  // Retrieve Stripe session with line items expanded; redirect on failure
  let stripeSession: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch {
    redirect(`/novel/${novelId}`);
  }

  if (stripeSession.metadata?.novel_id !== novelId) {
    redirect(`/novel/${novelId}`);
  }

  // Extract display data from the session
  const novelTitle =
    stripeSession.line_items?.data?.[0]?.description ?? "Your Novel";
  const amountTotal = stripeSession.amount_total ?? 0;
  const formattedPrice = `$${(amountTotal / 100).toFixed(2)}`;

  return (
    <>
      {/* Fixed header with back arrow — matches Novel Detail Header styling */}
      <div
        className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent w-full pointer-events-none"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        <Link
          href={`/novel/${novelId}`}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-shadow-sm">
            arrow_back
          </span>
        </Link>
      </div>

      <main className="min-h-screen bg-void text-white flex flex-col items-center justify-center px-6 py-24">
        {/* Surface card container */}
        <div className="w-full max-w-md bg-surface border border-white/5 rounded-sm p-8 flex flex-col items-center gap-6 shadow-card-depth">
          {/* Confirmation heading */}
          <h1 className="font-cinzel uppercase text-primary text-xl tracking-widest text-center gold-text-shadow">
            Your paperback is on its way
          </h1>

          {/* Divider */}
          <div className="w-16 h-px bg-primary/30" />

          {/* Novel title */}
          <h2 className="font-playfair italic font-bold text-2xl text-white text-center gold-text-shadow">
            {novelTitle}
          </h2>

          {/* Price paid */}
          <p className="font-marcellus text-white/80 text-lg tracking-wide">
            {formattedPrice}
          </p>

          {/* Shipping note */}
          <p className="font-literata text-white/60 text-sm text-center leading-relaxed">
            Your shipping details have been collected and your order is being
            processed.
          </p>

          {/* Divider */}
          <div className="w-16 h-px bg-primary/30" />

          {/* Back to Novel button */}
          <Link
            href={`/novel/${novelId}`}
            className="btn-gold inline-block mt-2"
          >
            Back to Novel
          </Link>
        </div>
      </main>
    </>
  );
}
