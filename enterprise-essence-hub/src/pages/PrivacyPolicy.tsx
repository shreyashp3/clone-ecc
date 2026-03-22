import SEOHead from "@/components/shared/SEOHead";
import { motion } from "framer-motion";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { pageHeroImages } from "@/data/pageHeroImages";

const PrivacyPolicy = () => (
  <>
    <SEOHead title="Privacy Policy" description="ECC Technologies Privacy Policy. Learn how we collect, use, and protect your data." canonical="/privacy-policy" />
    <section className="relative overflow-hidden bg-hero py-20 lg:py-24">
      <PageHeroBackdrop src={pageHeroImages.policy.src} position={pageHeroImages.policy.position} />
      <div className="container relative z-10 mx-auto px-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-display font-bold text-white">Privacy Policy</motion.h1>
      </div>
    </section>
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <p className="text-muted-foreground">Last updated: March 2026</p>
        <h2 className="font-display text-foreground">1. Information We Collect</h2>
        <p className="text-muted-foreground">We collect information you provide directly, such as name, email, phone number, and company details when you submit forms on our website.</p>
        <h2 className="font-display text-foreground">2. How We Use Your Information</h2>
        <p className="text-muted-foreground">We use the information to respond to inquiries, provide services, and improve our website experience.</p>
        <h2 className="font-display text-foreground">3. Data Protection</h2>
        <p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information.</p>
        <h2 className="font-display text-foreground">4. Contact</h2>
        <p className="text-muted-foreground">For questions about this policy, contact us at info@ecctechnologies.ai.</p>
      </div>
    </section>
  </>
);

export default PrivacyPolicy;
