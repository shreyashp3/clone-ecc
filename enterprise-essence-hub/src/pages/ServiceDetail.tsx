import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle, Shield, Zap, BarChart3,
  Cloud, Server, GitBranch, Brain, Database, Workflow, Bot, Headset,
  RefreshCw, Network, HardDrive, Lock, Activity, Boxes, Cpu,
  Clock, Users, Award, Target, Building2, Factory, ShoppingCart,
  Truck, Stethoscope, Landmark, ChevronDown, ChevronUp, Phone, Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEOHead from "@/components/shared/SEOHead";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import SectionHeading from "@/components/shared/SectionHeading";
import { useServiceCategories, useBlogPosts, useCaseStudies } from "@/hooks/useCMSData";
import { serviceCategories as staticCategories } from "@/data/services";
import { primaryContactMethods, salesEmail, toTelHref } from "@/data/contactInfo";
import { pageHeroImages } from "@/data/pageHeroImages";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";
import { submitLead } from "@/lib/submitLead";

type Json = any;

/* ─── Icon Maps ─── */
const serviceIconMap: Record<string, any> = {
  Cloud, Server, GitBranch, Brain, Shield, Database, Workflow, Bot,
  Headset, RefreshCw, Network, HardDrive, Lock, Activity, Boxes, Cpu,
  BarChart3, Zap, Target,
};

const industryIcons: Record<string, any> = {
  fintech: Landmark, saas: Cloud, healthcare: Stethoscope,
  manufacturing: Factory, retail: ShoppingCart, "supply-chain": Truck,
  default: Building2,
};

/* ─── Defaults ─── */
const defaultBenefits = [
  { title: "Reduced Costs", desc: "Cut operational expenses by up to 40% with optimized infrastructure.", icon: "BarChart3" },
  { title: "Faster Delivery", desc: "Accelerate time-to-market with automated pipelines and best practices.", icon: "Zap" },
  { title: "Enterprise Security", desc: "SOC 2, ISO 27001 compliant architectures with zero-trust principles.", icon: "Shield" },
  { title: "24/7 Expert Support", desc: "Round-the-clock monitoring and incident response from certified engineers.", icon: "Headset" },
  { title: "Scalable Architecture", desc: "Auto-scaling infrastructure that grows with your business demands.", icon: "Activity" },
  { title: "Proven Results", desc: "Track record with 100+ enterprise clients across industries.", icon: "Award" },
];

const defaultInclusions = [
  "Architecture assessment & design", "Migration planning & execution", "Infrastructure as Code setup",
  "CI/CD pipeline configuration", "Security hardening & compliance", "Performance optimization",
  "Monitoring & alerting setup", "Documentation & knowledge transfer", "Post-launch support & SLA",
];

const defaultIndustryUseCases = [
  { industry: "FinTech", slug: "fintech", desc: "PCI-DSS compliant cloud architectures for payment processing and financial analytics." },
  { industry: "SaaS", slug: "saas", desc: "Multi-tenant infrastructure with auto-scaling and zero-downtime deployments." },
  { industry: "Healthcare", slug: "healthcare", desc: "HIPAA-compliant environments for health data and telemedicine platforms." },
  { industry: "Manufacturing", slug: "manufacturing", desc: "IoT-integrated cloud solutions for supply chain and production monitoring." },
  { industry: "Retail", slug: "retail", desc: "High-availability ecommerce platforms with real-time inventory management." },
  { industry: "Supply Chain", slug: "supply-chain", desc: "Global logistics platforms with edge computing and real-time tracking." },
];

const defaultComparison = [
  { feature: "AWS & Azure Certified Team", ecct: true, others: false },
  { feature: "24/7 Dedicated Support", ecct: true, others: false },
  { feature: "Multi-Cloud Expertise", ecct: true, others: false },
  { feature: "FinOps & Cost Optimization", ecct: true, others: false },
  { feature: "Proprietary AI Tools", ecct: true, others: false },
  { feature: "Fixed-Price Engagements", ecct: true, others: false },
  { feature: "Compliance-First Approach", ecct: true, others: false },
];

const defaultFaqs = (title: string, desc: string) => [
  { q: `What is ${title}?`, a: desc || `${title} is a comprehensive enterprise service offered by ECC Technologies.` },
  { q: "How long does implementation take?", a: "Typical engagements range from 2–12 weeks depending on scope, complexity, and current infrastructure maturity." },
  { q: "Do you provide ongoing managed support?", a: "Yes. All our service engagements include options for 24/7 managed services, proactive monitoring, and dedicated SLA-backed support." },
  { q: "What certifications does your team hold?", a: "Our engineers are AWS Solutions Architect, Azure Administrator, Kubernetes (CKA/CKAD), and Terraform certified." },
  { q: "Can you work with our existing infrastructure?", a: "Absolutely. We assess your current setup first and build a tailored roadmap that integrates with your existing tools and workflows." },
  { q: "What industries do you serve?", a: "We serve FinTech, SaaS, Healthcare, Manufacturing, Retail, Supply Chain, and more — with compliance expertise for each vertical." },
  { q: "How do you ensure security and compliance?", a: "We follow SOC 2, ISO 27001, GDPR, HIPAA, and PCI-DSS standards depending on your industry requirements." },
  { q: "What is your pricing model?", a: "We offer flexible pricing — fixed-price projects, retainer-based managed services, and pay-as-you-go consulting hours." },
];

const defaultProcessSteps = [
  { step: "01", title: "Discovery & Assessment", desc: "Deep-dive into your current infrastructure, pain points, and business goals." },
  { step: "02", title: "Strategy & Roadmap", desc: "A detailed implementation plan with milestones, timelines, and risk mitigation." },
  { step: "03", title: "Implementation", desc: "Our certified engineers execute with Infrastructure as Code and automation-first approach." },
  { step: "04", title: "Optimization & Handover", desc: "Continuous monitoring, performance tuning, and complete documentation." },
];

/* ─── Helper ─── */
const asArray = (val: Json | null | undefined): any[] =>
  Array.isArray(val) && val.length > 0 ? val : [];

const ServiceDetail = () => {
  const { categorySlug, serviceSlug } = useParams();
  const { categories: dbCategories, isLoading } = useServiceCategories();
  const { data: blogPosts } = useBlogPosts();
  const { data: caseStudies } = useCaseStudies();
  const { openEnquiry } = useQuickEnquiry();

  const cats = dbCategories.length > 0 ? dbCategories : staticCategories.map(c => ({
    ...c, subServices: c.subServices.map(s => ({
      ...s, category_slug: c.slug, category_name: c.title,
      benefits: [] as Json, process_steps: [] as Json, faqs: [] as Json,
      features: [] as Json, seo_title: null, seo_description: null,
      hero_subtitle: null, long_overview: null, service_inclusions: [] as Json,
      industry_use_cases: [] as Json, comparison_points: [] as Json,
      related_blogs: [] as Json, related_services: [] as Json,
      related_case_studies: [] as Json, related_products: [] as Json,
      cta_heading: null, cta_text: null, og_image: null, canonical_url: null,
    } as any))
  }));

  const category = cats.find((c: any) => c.slug === categorySlug);
  const service = category?.subServices.find((s: any) => s.slug === serviceSlug);

  if (isLoading) {
    return <div className="py-32 container mx-auto px-4"><Skeleton className="h-64" /></div>;
  }

  /* ─── Category Overview Page ─── */
  if (category && !serviceSlug) {
    return (
      <>
        <SEOHead title={category.title} description={category.description || ""} canonical={`/services/${category.slug}`} />
        <Breadcrumb
          items={[
            { label: "Services", path: "/services" },
            { label: category.title },
          ]}
        />
        <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
          <PageHeroBackdrop src={pageHeroImages.services.src} position={pageHeroImages.services.position} />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/services" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> All Services
              </Link>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">{category.title}</h1>
              <p className="mt-4 text-lg text-white/60 max-w-xl">{category.description}</p>
            </motion.div>
          </div>
        </section>
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.subServices.map((sub: any, i: number) => (
              <motion.div key={sub.slug} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/services/${category.slug}/${sub.slug}`} className="group block p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{sub.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{sub.description}</p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-electric text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold">Ready to Get Started?</h2>
            <p className="mt-3 text-white/80 max-w-lg mx-auto">Book a free consultation with our {category.title} experts.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 font-semibold"
                onClick={() => openEnquiry({ interest: "consultation" })}
              >
                Book Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={() => openEnquiry({ interest: "assessment" })}
              >
                Get Free Assessment
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!category || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Service Not Found</h1>
          <Button asChild className="mt-4"><Link to="/services">View All Services</Link></Button>
        </div>
      </div>
    );
  }

  /* ─── Resolve CMS data with fallbacks ─── */
  const benefits = asArray(service.benefits).length > 0
    ? asArray(service.benefits)
    : defaultBenefits;

  const processSteps = asArray(service.process_steps).length > 0
    ? asArray(service.process_steps)
    : defaultProcessSteps;

  const inclusions = asArray(service.service_inclusions).length > 0
    ? asArray(service.service_inclusions)
    : defaultInclusions;

  const useCases = asArray(service.industry_use_cases).length > 0
    ? asArray(service.industry_use_cases)
    : defaultIndustryUseCases;

  const comparison = asArray(service.comparison_points).length > 0
    ? asArray(service.comparison_points)
    : defaultComparison;

  const faqs = asArray(service.faqs).length > 0
    ? asArray(service.faqs)
    : defaultFaqs(service.title, service.description || "");

  const ctaHeading = service.cta_heading || "Ready to modernize your cloud & DevOps operations?";
  const ctaText = service.cta_text || "Talk to our certified architects and get a tailored roadmap for your business.";
  const heroSubtitle = service.hero_subtitle || service.description || "";
  const longOverview = service.long_overview || service.description || "";

  // Related content
  const relatedBlogs = (blogPosts || []).slice(0, 3);
  const relatedCases = (caseStudies || []).slice(0, 3);

  // Other services in same category for "Related Services"
  const siblingServices = category.subServices.filter((s: any) => s.slug !== service.slug).slice(0, 3);

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f: any) => ({
      "@type": "Question",
      name: f.q || f.question,
      acceptedAnswer: { "@type": "Answer", text: f.a || f.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "ECC Technologies",
      url: "https://ecctechnologies.ai",
    },
    areaServed: "Worldwide",
    serviceType: category.title,
  };

  const combinedSchema = [serviceSchema, faqSchema];

  return (
    <>
      <SEOHead
        title={service.seo_title || `${service.title} - ${category.title}`}
        description={service.seo_description || service.description || ""}
        canonical={service.canonical_url || `/services/${category.slug}/${service.slug}`}
        ogImage={service.og_image}
        schema={combinedSchema}
      />

      <Breadcrumb
        items={[
          { label: "Services", path: "/services" },
          { label: category.title, path: `/services/${category.slug}` },
          { label: service.title },
        ]}
      />

      {/* ═══ 1. HERO ═══ */}
      <section className="bg-hero py-20 lg:py-32 relative overflow-hidden">
        <PageHeroBackdrop src={pageHeroImages.services.src} position={pageHeroImages.services.position} />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to={`/services/${category.slug}`} className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" /> {category.title}
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white max-w-4xl leading-tight">
              {service.title}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">{heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gradient-electric hover:opacity-90 text-white font-semibold shadow-lg"
                onClick={() => openEnquiry({ interest: "consultation" })}
              >
                Book Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold"
                onClick={() => openEnquiry({ interest: "assessment" })}
              >
                Get Free Assessment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. LONG-FORM OVERVIEW ═══ */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading badge="Overview" title={`What is ${service.title}?`} align="left" />
              <div className="mt-6 text-muted-foreground leading-relaxed space-y-4">
                {longOverview.split("\n").filter(Boolean).map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
                {longOverview === service.description && (
                  <>
                    <p>Businesses of all sizes rely on {service.title.toLowerCase()} to reduce operational overhead, improve reliability, and accelerate innovation. Whether you're a startup scaling rapidly or an enterprise modernizing legacy systems, this service delivers measurable outcomes from day one.</p>
                    <p>Our team of certified engineers brings deep expertise in {category.title.toLowerCase()}, ensuring every engagement follows industry best practices and compliance standards.</p>
                  </>
                )}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "2–12 Week Delivery" },
                  { icon: Users, label: "Dedicated Team" },
                  { icon: Award, label: "Certified Engineers" },
                  { icon: Target, label: "Measurable ROI" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {processSteps.map((step: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-border bg-card text-center"
                >
                  <div className="text-3xl font-display font-bold text-primary/20">{step.step || `0${i + 1}`}</div>
                  <h3 className="font-display font-semibold text-foreground mt-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{step.desc || step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. KEY BENEFITS ═══ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Benefits" title={`Why Choose Our ${service.title}`} description="Business outcomes that matter — not just technical features." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((b: any, i: number) => {
              const IconComp = serviceIconMap[b.icon] || CheckCircle;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <IconComp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">
                    {typeof b === "string" ? b : b.title || b.text}
                  </h3>
                  {typeof b !== "string" && b.desc && (
                    <p className="text-sm text-muted-foreground mt-2">{b.desc}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. SERVICE INCLUSIONS ═══ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge="What We Deliver" title="Service Inclusions" description="A comprehensive engagement covering every aspect of your project." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {inclusions.map((item: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{typeof item === "string" ? item : item.title || item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. INDUSTRY USE CASES ═══ */}
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Industries" title="Industry Use Cases" description={`How ${service.title} applies across verticals.`} dark />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCases.map((uc: any, i: number) => {
              const IconComp = industryIcons[uc.slug] || industryIcons.default;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all"
                >
                  <IconComp className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display font-semibold text-white">{uc.industry}</h3>
                  <p className="text-sm text-white/60 mt-2">{uc.desc || uc.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 6. WHY CHOOSE ECC TECHNOLOGIES ═══ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Why ECC Technologies" title="ECC Technologies vs Generic Providers" description="See the difference a specialized cloud & DevOps partner makes." />
          <div className="mt-12 max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-display font-semibold text-foreground">Capability</th>
                  <th className="text-center p-4 font-display font-semibold text-primary">ECC Technologies</th>
                  <th className="text-center p-4 font-display font-semibold text-muted-foreground">Generic Providers</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row: any, i: number) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? "bg-card" : ""}`}>
                    <td className="p-4 text-foreground font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.ecct !== false ? (
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.others ? (
                        <CheckCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: "SOC 2 & ISO 27001" },
              { icon: Award, label: "AWS Advanced Partner" },
              { icon: Users, label: "100+ Enterprise Clients" },
              { icon: Clock, label: "99.9% SLA Uptime" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <FAQSection faqs={faqs} />

      {/* ═══ 8. CTA BANNER ═══ */}
      <section className="py-16 bg-gradient-electric text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">{ctaHeading}</h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">{ctaText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 font-semibold shadow-lg"
              onClick={() => openEnquiry({ interest: "consultation" })}
            >
              Book Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold"
              onClick={() => openEnquiry()}
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ 9. LEAD FORM ═══ */}
      <ServiceLeadForm serviceTitle={service.title} categoryTitle={category.title} />

      {/* ═══ 10. RELATED CONTENT ═══ */}
      <RelatedContent
        blogs={relatedBlogs}
        caseStudies={relatedCases}
        siblingServices={siblingServices}
        categorySlug={category.slug}
      />
    </>
  );
};

/* ─── FAQ Accordion Component ─── */
const FAQSection = ({ faqs }: { faqs: any[] }) => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <SectionHeading badge="FAQs" title="Frequently Asked Questions" />
        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq: any, i: number) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-display font-semibold text-foreground text-sm pr-4">{faq.q || faq.question}</h3>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a || faq.answer}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─── Service Lead Form ─── */
const ServiceLeadForm = ({ serviceTitle, categoryTitle }: { serviceTitle: string; categoryTitle: string }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target as HTMLFormElement);
    const { data, error, message } = await submitLead({
      name: (fd.get("name") as string) || "",
      email: (fd.get("email") as string) || "",
      phone: (fd.get("phone") as string) || null,
      company: (fd.get("company") as string) || null,
      interest: serviceTitle,
      message: (fd.get("message") as string) || null,
      form_type: "service_inquiry",
      source_page: window.location.pathname,
      honeypot: (fd.get("website") as string) || null,
    });
    if (error) toast.error(message || "Something went wrong. Please try again.");
    else { toast.success("Thank you! We'll be in touch shortly."); (e.target as HTMLFormElement).reset(); }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <div>
            <SectionHeading badge="Contact Us" title="Get Started Today" align="left" description="Fill in the form and our team will reach out within 2 hours." />
            <div className="mt-8 space-y-4">
              {[
                { icon: Clock, label: "Response Time", value: "Under 2 hours" },
                { icon: Users, label: "Free Consultation", value: "30-minute expert session" },
                { icon: Award, label: "Certified Team", value: "AWS & Azure architects" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground"><strong className="text-foreground">{label}:</strong> {value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-2 text-sm text-muted-foreground">
              <a href={`mailto:${salesEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> {salesEmail}
              </a>
              {primaryContactMethods.map((contact) => (
                <a key={contact.label} href={toTelHref(contact.phone)} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" /> {contact.label}: {contact.phone}
                </a>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="p-8 rounded-2xl border border-border bg-card space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Full Name" name="name" required />
              <Input placeholder="Work Email" type="email" name="email" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Phone" type="tel" name="phone" />
              <Input placeholder="Company" name="company" />
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border">
              <label className="text-xs text-muted-foreground">Service Interest</label>
              <p className="text-sm font-medium text-foreground mt-0.5">{serviceTitle} — {categoryTitle}</p>
            </div>
            <Textarea placeholder="Tell us about your project requirements..." name="message" rows={4} />
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Button type="submit" className="w-full bg-gradient-electric hover:opacity-90 text-white font-semibold" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Submit Inquiry"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to our <Link to="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

/* ─── Related Content Section ─── */
const RelatedContent = ({
  blogs, caseStudies, siblingServices, categorySlug,
}: { blogs: any[]; caseStudies: any[]; siblingServices: any[]; categorySlug: string }) => {
  const hasContent = blogs.length > 0 || caseStudies.length > 0 || siblingServices.length > 0;
  if (!hasContent) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Related Blogs */}
        {blogs.length > 0 && (
          <div className="mb-16">
            <SectionHeading badge="Insights" title="Related Articles" />
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {blogs.map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Services */}
        {siblingServices.length > 0 && (
          <div className="mb-16">
            <SectionHeading badge="Related" title="Explore Related Services" />
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {siblingServices.map((s: any) => (
                <Link key={s.slug} to={`/services/${categorySlug}/${s.slug}`} className="group block p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  <div className="mt-3 flex items-center text-sm text-primary font-medium">
                    Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Case Studies */}
        {caseStudies.length > 0 && (
          <div>
            <SectionHeading badge="Success Stories" title="Related Case Studies" />
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {caseStudies.map((cs: any) => (
                <Link key={cs.id} to={`/case-studies`} className="group block p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{cs.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2">{cs.client_industry}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceDetail;
