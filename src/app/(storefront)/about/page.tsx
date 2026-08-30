import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { placeholderImage } from "@/lib/placeholder";

export const metadata = {
  title: "About — RUHVIQUE",
  description: "Premium modern fashion & streetwear crafted for those who refuse to blend in.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="ru-hero text-white">
        <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
          <div className="group inline-flex items-center gap-3 mb-6">
            <div className="ru-logo-shine ru-logo-ring ru-logo-glow-dark ru-logo-enter rounded-lg overflow-hidden">
              <img
                src="/ruhvique-logo.jpeg"
                alt="RUHVIQUE"
                className="h-16 w-16 rounded-lg object-cover"
              />
            </div>
            <span className="text-3xl font-black tracking-[0.2em] group-hover:tracking-[0.28em] transition-all">RUHVIQUE</span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-4">Est. 2024</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            About Ruhvique
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            We design premium modern fashion and streetwear for those who refuse to blend in.
            Every piece is engineered with intent — heavyweight fabrics, considered fits, and silhouettes
            that hold their shape long after the trend cycle moves on.
          </p>
        </div>
      </section>

      {/* Brand philosophy */}
      <section className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our Philosophy</p>
            <h2 className="text-3xl font-black tracking-tight">
              Built for those who wear their attitude.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Ruhvique was born out of a simple frustration: streetwear had become either over-designed and overpriced,
              or cheap and disposable. We set out to build the missing middle — pieces that respect the heritage
              of streetwear culture (heavyweight cotton, raw seams, considered proportions) without charging
              a premium for a logo.
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Our design process starts with the fabric. If the cotton isn&apos;t dense enough, the seams
              aren&apos;t reinforced, and the silhouette doesn&apos;t flatter real bodies — we don&apos;t ship it.
              Every drop is small-batch, every colorway is deliberate, and every stitch is checked by hand
              before it leaves our warehouse.
            </p>
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-lg">
            { }
            <img src={placeholderImage("Ruhvique Philosophy", 800, 1000, 1)} alt="Ruhvique" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Quality commitment */}
      <section className="bg-muted/40">
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Quality Promise</p>
            <h2 className="text-3xl font-black tracking-tight">No shortcuts. Ever.</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              We test every fabric for weight, shrinkage, color-fastness and pilling before it earns the Ruhvique label.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { k: "240gsm", v: "Heavyweight cotton", d: "Dense, structured fabric that drapes with intent." },
              { k: "Reinforced", v: "Double-stitched seams", d: "Stress points reinforced to outlast trends." },
              { k: "Pre-washed", v: "Zero shrink surprises", d: "Garment dyed and pre-shrunk for consistent fit." },
              { k: "Hand-checked", v: "QC on every piece", d: "Each unit inspected before it ships out." },
            ].map((item) => (
              <div key={item.v} className="rounded-lg border border-border bg-background p-5">
                <p className="text-2xl font-black">{item.k}</p>
                <p className="mt-1 text-sm font-semibold">{item.v}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Identity */}
      <section className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] overflow-hidden rounded-lg order-2 lg:order-1">
            { }
            <img src={placeholderImage("Streetwear Identity", 800, 1000, 2)} alt="Ruhvique streetwear" className="h-full w-full object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Streetwear Identity</p>
            <h2 className="text-3xl font-black tracking-tight">
              Modern streetwear with a heavyweight soul.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Streetwear at its best was never about hype — it was about how a heavy hoodie fell on the shoulders,
              how a boxy tee sat on the frame, how a cargo pant broke over the shoe. We design for that feeling.
              Our silhouettes lean oversized, our palettes stay restrained, and our graphics earn their place.
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              We drop in small batches — sometimes 200 pieces, sometimes 50. When a colorway is gone,
              it&apos;s gone. That&apos;s not artificial scarcity; it&apos;s the natural rhythm of small-batch
              manufacturing done right.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/60 mb-3">Our Mission</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Make premium the new default.
          </h2>
          <p className="mt-5 text-sm sm:text-base text-primary-foreground/70 leading-relaxed">
            We&apos;re building a fashion label where quality isn&apos;t a tier — it&apos;s the baseline.
            Where the customer never has to choose between fit, fabric, and price. Where streetwear
            can be both honest and beautiful. We&apos;re small, but we&apos;re building something that lasts.
          </p>
          <Link
            href="/tshirts"
            className="inline-flex items-center gap-2 mt-8 bg-primary-foreground text-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-foreground/90"
          >
            Shop the Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
