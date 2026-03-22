import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Cloud, Server, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const trustBadges = [
  { icon: ShieldCheck, label: "AWS Advanced Tier Partner" },
  { icon: Globe, label: "Global Presence" },
  { icon: Cloud, label: "Multi-Cloud Expertise" },
  { icon: Server, label: "Enterprise Security" },
];

const highlights = [
  "AWS, Azure & Multi-Cloud Architecture",
  "DevOps, CI/CD & Platform Engineering",
  "FinOps, Security & Compliance",
  "24x7 Managed Cloud Operations",
];

const HeroSection = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <section className="relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] flex items-start lg:items-center">
      <div className="absolute inset-0 bg-hero" aria-hidden="true" />
      <div className="absolute inset-0 hero-aurora" aria-hidden="true" />
      <div className="absolute inset-0 hero-grid" aria-hidden="true" />
      <div className="absolute inset-0 hero-noise" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40" aria-hidden="true" />
      <div
        className="absolute top-10 right-[10%] w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] hero-orb-float"
        style={{ animationDelay: "0.2s" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full bg-teal/10 blur-[100px] hero-orb-float"
        style={{ animationDelay: "0.5s" }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 py-10 sm:py-12 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="max-w-2xl space-y-5 lg:pl-6 xl:pl-10 text-left">
            <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] tracking-tight">
              Cloud Infrastructure
              <br />
              <span className="text-gradient">That Pays for Itself</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-xl leading-relaxed hero-fade-up" style={{ animationDelay: "0.15s" }}>
              Move to AWS or Azure faster, cheaper, and with zero downtime. Used by 50+ enterprises globally.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
              {highlights.map((h, i) => (
                <div
                  key={h}
                  className="flex items-center gap-2 text-white/50 text-sm hero-fade-up"
                  style={{ animationDelay: `${0.25 + i * 0.08}s` }}
                >
                  <CheckCircle className="w-4 h-4 text-teal shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 hero-fade-up" style={{ animationDelay: "0.45s" }}>
              <Button
                size="lg"
                className="bg-gradient-electric hover:opacity-90 text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-13 font-semibold text-white"
                onClick={() => openEnquiry({ interest: "audit" })}
              >
                Free Audit <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all text-sm sm:text-base h-12 sm:h-13 font-semibold" asChild>
                <Link to="/case-studies">Case Studies <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
              </Button>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 hero-fade-up" style={{ animationDelay: "0.55s" }}>
              <span className="text-amber text-sm font-semibold">4.9 stars</span>
              <span className="text-white/40 text-xs">50+ enterprise reviews</span>
            </div>

            <div className="pt-1 hero-fade-up" style={{ animationDelay: "0.65s" }}>
              <p className="text-xs text-white/30 font-display font-medium uppercase tracking-wider mb-2">Trusted by 50+ enterprises</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-md">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-white/60">
                    <badge.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-display font-medium tracking-wide text-white/70">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end hero-fade-in" style={{ animationDelay: "0.35s" }}>
            <img
              src="/images/devops.png"
              alt="DevOps automation illustration"
              className="w-full max-w-[860px] xl:max-w-[980px] 2xl:max-w-[1040px] h-auto object-contain drop-shadow-2xl lg:ml-auto xl:translate-x-4 2xl:translate-x-8 hero-image-float"
              width={896}
              height={664}
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
