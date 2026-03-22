import SEOHead from "@/components/shared/SEOHead";
import { motion } from "framer-motion";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { pageHeroImages } from "@/data/pageHeroImages";

const Terms = () => (
  <>
    <SEOHead title="Terms & Conditions" description="ECC Technologies Terms and Conditions of service." canonical="/terms" />
    <section className="relative overflow-hidden bg-hero py-20 lg:py-24">
      <PageHeroBackdrop src={pageHeroImages.policy.src} position={pageHeroImages.policy.position} />
      <div className="container relative z-10 mx-auto px-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-display font-bold text-white">Terms & Conditions</motion.h1>
      </div>
    </section>
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <p className="text-muted-foreground">Last updated: March 2026</p>
        <h2 className="font-display text-foreground">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">By accessing and using this website, you accept and agree to be bound by these terms.</p>
        <h2 className="font-display text-foreground">2. Services</h2>
        <p className="text-muted-foreground">ECC Technologies provides cloud consulting, DevOps, and AI services as described on this website.</p>
        <h2 className="font-display text-foreground">3. Intellectual Property</h2>
        <p className="text-muted-foreground">All content on this website is the property of ECC Technologies and protected by applicable laws.</p>
      </div>
    </section>
  </>
);

export default Terms;
