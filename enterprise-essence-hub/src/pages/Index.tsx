import { Suspense, lazy } from "react";
import SEOHead from "@/components/shared/SEOHead";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import CompanyOverviewSection from "@/components/home/CompanyOverviewSection";
import DeferredSection from "@/components/shared/DeferredSection";
import { organizationContactPoints, salesEmail } from "@/data/contactInfo";

const LazyServicesGridSection = lazy(() => import("@/components/home/ServicesGridSection"));
const LazyFeaturedServicesSection = lazy(() => import("@/components/home/FeaturedServicesSection"));
const LazyTechLogoStrip = lazy(() => import("@/components/home/TechLogoStrip"));
const LazyDevOpsToolsSection = lazy(() => import("@/components/home/DevOpsToolsSection"));
const LazyProductsSection = lazy(() => import("@/components/home/ProductsSection"));
const LazyIndustrySolutionsSection = lazy(() => import("@/components/home/IndustrySolutionsSection"));
const LazyDeliveryMethodologySection = lazy(() => import("@/components/home/DeliveryMethodologySection"));
const LazyDifferentiatorsSection = lazy(() => import("@/components/home/DifferentiatorsSection"));
const LazyCaseStudiesSection = lazy(() => import("@/components/home/CaseStudiesSection"));
const LazyTestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const LazySecurityComplianceSection = lazy(() => import("@/components/home/SecurityComplianceSection"));
const LazyBlogPreviewSection = lazy(() => import("@/components/home/BlogPreviewSection"));
const LazyGlobalPresenceSection = lazy(() => import("@/components/home/GlobalPresenceSection"));
const LazyCTASection = lazy(() => import("@/components/home/CTASection"));
const LazyContactFormSection = lazy(() => import("@/components/home/ContactFormSection"));
const LazyTrustStripSection = lazy(() => import("@/components/home/TrustStripSection"));

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECC Technologies",
  url: "https://ecctechnologies.ai",
  logo: "https://ecctechnologies.ai/images/ecc-logo.png",
  description: "ECC Technologies — Enterprise Cloud, DevOps, and AI Solutions",
  email: salesEmail,
  contactPoint: organizationContactPoints,
  sameAs: [
    "https://www.linkedin.com/company/expertcloudconsulting/",
    "https://www.instagram.com/expert_cloud_consulting",
    "https://www.facebook.com/share/1BoffVnXCj/",
    "https://www.youtube.com/@expertcloudconsultingakagp3755",
  ],
};

const Index = () => {
  return (
    <>
      <SEOHead
        title="ECC Technologies | AWS, Azure, DevOps & AI Solutions"
        description="ECC Technologies delivers tailored multi-cloud consulting, DevOps automation, FinOps, and AI solutions. AWS Advanced Tier Partner. 200+ projects delivered globally."
        canonical="/"
        schema={organizationSchema}
      />
      <HeroSection />
      <StatsSection />
      <DeferredSection minHeight={320}>
        <Suspense fallback={null}>
          <LazyTechLogoStrip />
        </Suspense>
      </DeferredSection>
      <CompanyOverviewSection />
      <DeferredSection minHeight={560}>
        <Suspense fallback={null}>
          <LazyServicesGridSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazyFeaturedServicesSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={560}>
        <Suspense fallback={null}>
          <LazyDevOpsToolsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={640}>
        <Suspense fallback={null}>
          <LazyProductsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={560}>
        <Suspense fallback={null}>
          <LazyIndustrySolutionsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazyDeliveryMethodologySection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={720}>
        <Suspense fallback={null}>
          <LazyDifferentiatorsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazyCaseStudiesSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={0}>
        <Suspense fallback={null}>
          <LazyTestimonialsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazySecurityComplianceSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazyBlogPreviewSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <LazyGlobalPresenceSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={420}>
        <Suspense fallback={null}>
          <LazyCTASection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={700}>
        <Suspense fallback={null}>
          <LazyContactFormSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={220}>
        <Suspense fallback={null}>
          <LazyTrustStripSection />
        </Suspense>
      </DeferredSection>
    </>
  );
};

export default Index;
