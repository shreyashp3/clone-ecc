import SEOHead from "@/components/shared/SEOHead";
import { motion } from "framer-motion";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { pageHeroImages } from "@/data/pageHeroImages";

const CookiePolicy = () => (
  <>
    <SEOHead title="Cookie Policy" description="ECC Technologies Cookie Policy. Learn about how we use cookies." canonical="/cookie-policy" />
    <section className="relative overflow-hidden bg-hero py-20 lg:py-24">
      <PageHeroBackdrop src={pageHeroImages.policy.src} position={pageHeroImages.policy.position} />
      <div className="container relative z-10 mx-auto px-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-display font-bold text-white">Cookie Policy</motion.h1>
      </div>
    </section>
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <p className="text-muted-foreground">Last updated: March 2026</p>
        <h2 className="font-display text-foreground">1. What Are Cookies</h2>
        <p className="text-muted-foreground">Cookies are small text files stored on your device when you visit our website.</p>
        <h2 className="font-display text-foreground">2. How We Use Cookies</h2>
        <p className="text-muted-foreground">We use cookies to analyze website traffic and improve your browsing experience.</p>
        <h2 className="font-display text-foreground">3. Managing Cookies</h2>
        <p className="text-muted-foreground">You can control cookies through your browser settings.</p>
      </div>
    </section>
  </>
);

export default CookiePolicy;
