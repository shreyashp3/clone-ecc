import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, ExternalLink, ArrowRight, Shield, Zap, BarChart3, Users, Headphones, Cpu, Cloud, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/shared/SEOHead";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import SectionHeading from "@/components/shared/SectionHeading";
import { useProducts } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { analytics } from "@/integrations/api/client";
import { toast } from "sonner";
import { pageHeroImages } from "@/data/pageHeroImages";
import { submitLead } from "@/lib/submitLead";

const logoMap: Record<string, string> = {
  ticketly: "/images/ticketly-logo.jpg",
  "ai-cloud-insights": "/images/ai-cloud-insights-logo.png",
  "gpu-on-cloud": "/images/gpuoncloud-logo.png",
};

const screenshotMap: Record<string, string> = {
  ticketly: "/images/ticketly-screenshot.png",
  "ai-cloud-insights": "/images/aicloudinsights-screenshot.png",
  "gpu-on-cloud": "/images/gpuoncloud-screenshot.png",
};

const useCaseData: Record<string, { icon: React.ReactNode; title: string; desc: string }[]> = {
  ticketly: [
    { icon: <Building2 className="w-5 h-5" />, title: "Enterprise IT Support", desc: "Centralize incident management across departments with multi-workspace isolation and unified reporting." },
    { icon: <Headphones className="w-5 h-5" />, title: "Customer Service Teams", desc: "Handle email, WhatsApp, and portal tickets in one AI-powered platform with smart routing." },
    { icon: <Users className="w-5 h-5" />, title: "Managed Service Providers", desc: "Multi-tenant workspaces with SLA tracking, CMDB, and white-label support for client environments." },
    { icon: <BarChart3 className="w-5 h-5" />, title: "Operations & Compliance", desc: "Automated SLA monitoring, audit trails, and compliance reporting for regulated industries." },
  ],
  "ai-cloud-insights": [
    { icon: <Cloud className="w-5 h-5" />, title: "Multi-Cloud Cost Optimization", desc: "Identify unused resources, right-size instances, and automate savings across AWS and Azure accounts." },
    { icon: <Shield className="w-5 h-5" />, title: "Security & Compliance Auditing", desc: "Continuous compliance monitoring for HIPAA, PCI-DSS, GDPR, and SOC2 with automated remediation." },
    { icon: <BarChart3 className="w-5 h-5" />, title: "FinOps & Cloud Governance", desc: "Detailed cost analytics, forecasting, and chargeback reporting for finance and engineering teams." },
    { icon: <Zap className="w-5 h-5" />, title: "DevOps & Infrastructure Teams", desc: "Real-time CloudTrail monitoring, resource activity tracking, and AI-powered optimization alerts." },
  ],
  "gpu-on-cloud": [
    { icon: <Cpu className="w-5 h-5" />, title: "AI & Machine Learning", desc: "Train large language models, computer vision systems, and deep learning models with parallel GPU processing." },
    { icon: <Zap className="w-5 h-5" />, title: "Generative AI", desc: "Deploy Stable Diffusion, LLMs like Llama and Mistral, and other generative models at production scale." },
    { icon: <Shield className="w-5 h-5" />, title: "Blockchain & Web3", desc: "High-throughput GPU infrastructure for cryptocurrency mining, validator nodes, and DeFi applications." },
    { icon: <BarChart3 className="w-5 h-5" />, title: "3D Rendering & VFX", desc: "Render massive visual effects workloads instantly with on-demand GPU clusters and transparent pricing." },
  ],
};

const faqData: Record<string, { q: string; a: string }[]> = {
  ticketly: [
    { q: "What is Ticketly and how does it differ from traditional helpdesk software?", a: "Ticketly is an AI-native incident management platform that goes beyond traditional ticketing. It uses artificial intelligence to auto-generate incidents from email and WhatsApp, suggest resolutions from historical data, route tickets intelligently, and provide predictive analytics — delivering a 10x productivity boost over conventional tools." },
    { q: "Does Ticketly support multi-channel ticket intake?", a: "Yes. Ticketly consolidates tickets from email, WhatsApp, and a self-service portal into a unified queue. AI automatically categorizes, prioritizes, and routes each incident to the right team or agent." },
    { q: "Can Ticketly handle multiple teams or departments?", a: "Absolutely. Ticketly's multi-workspace architecture allows complete isolation between departments — each with dedicated incidents, assets, SLA rules, and reporting — while maintaining centralized oversight for management." },
    { q: "What kind of reporting and analytics does Ticketly provide?", a: "Ticketly offers real-time dashboards with trend analysis, SLA compliance tracking, user-wise turnaround time reports, and exportable management reports. Predictive analytics help anticipate incident spikes before they happen." },
    { q: "Is there a free trial available?", a: "Yes, Ticketly offers a free trial with no credit card required. Plans start at $69/month for small teams with pricing that scales as your organization grows." },
  ],
  "ai-cloud-insights": [
    { q: "What cloud providers does AI Cloud Insights support?", a: "AI Cloud Insights currently supports both AWS and Azure, providing a unified management dashboard that works across both cloud environments simultaneously for cost optimization, security monitoring, and resource tracking." },
    { q: "How does AI Cloud Insights help reduce cloud costs?", a: "The platform uses AI-powered analysis to identify unused resources, recommend right-sizing for over-provisioned instances, detect waste patterns, and provide one-click cost savings. Enterprise customers typically achieve 30-40% cost reductions." },
    { q: "What compliance standards does AI Cloud Insights monitor?", a: "AI Cloud Insights continuously monitors for HIPAA, PCI-DSS, GDPR, and SOC2 compliance violations across your cloud infrastructure. It provides automated remediation suggestions and detailed compliance reports." },
    { q: "Is there a free tier available?", a: "Yes. The free tier includes one-click cost optimization for all connected cloud accounts and instant savings insights. Paid plans start at $499/month for accounts with billing below $20,000." },
    { q: "How quickly can I get started?", a: "Sign up takes minutes. Connect your AWS or Azure accounts using the secure setup wizard and you'll have access to your personalized dashboard with cost insights and security analysis immediately." },
  ],
  "gpu-on-cloud": [
    { q: "What GPU models are available on GPU on Cloud?", a: "GPU on Cloud offers 50+ GPU models including NVIDIA RTX 4090 (24GB), A100 PCIe (80GB), H100 (80GB), and L40 (48GB). Our marketplace features verified GPUs from top providers, with side-by-side comparison tools for specs, benchmarks, and pricing." },
    { q: "How fast can I deploy a GPU instance?", a: "GPU instances deploy in approximately 60 seconds. Choose from pre-built templates for LLM deployment, Stable Diffusion, crypto mining, or custom development — or configure from scratch with PyTorch, TensorFlow, and CUDA toolkit." },
    { q: "What workloads is GPU on Cloud designed for?", a: "The platform supports AI/ML model training, generative AI (LLMs, image generation), blockchain and Web3, cloud gaming, 3D rendering and VFX, and academic research. Pre-configured templates accelerate deployment for each use case." },
    { q: "What are the billing options?", a: "GPU on Cloud offers transparent pay-per-use billing by the hour, minute, or second — no hidden fees, no long-term commitments. Cancel anytime with complete cost visibility through detailed analytics dashboards." },
    { q: "What security measures are in place?", a: "All GPU instances feature PCI-DSS compliance, encrypted storage, isolated compute environments, and bank-grade security. Security audits and compliance reports are included with enterprise plans." },
  ],
};

const colorMap: Record<string, string> = {
  purple: "from-purple to-primary",
  electric: "from-primary to-purple",
  teal: "from-teal to-primary",
};

const relatedLinks: Record<string, { label: string; to: string }[]> = {
  ticketly: [
    { label: "IT Support Services", to: "/services" },
    { label: "Case Studies", to: "/case-studies" },
    { label: "Technology Blog", to: "/blog" },
  ],
  "ai-cloud-insights": [
    { label: "Cloud Infrastructure Services", to: "/services" },
    { label: "Case Studies", to: "/case-studies" },
    { label: "Technology Blog", to: "/blog" },
  ],
  "gpu-on-cloud": [
    { label: "AI & ML Services", to: "/services" },
    { label: "Case Studies", to: "/case-studies" },
    { label: "All Products", to: "/products" },
  ],
};

const trackExternalClick = (productName: string, url: string) => {
  analytics.trackPageView(`/products/external-click/${productName.toLowerCase().replace(/\s+/g, "-")}`, url);
};

const ProductDemoForm = ({ productName }: { productName: string }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const { data, error, message } = await submitLead({
      name: (fd.get("name") as string) || "",
      email: (fd.get("email") as string) || "",
      phone: (fd.get("phone") as string) || null,
      company: (fd.get("company") as string) || null,
      interest: `Product Demo: ${productName}`,
      message: (fd.get("message") as string) || null,
      form_type: "product_demo",
      source_page: window.location.pathname,
      honeypot: (fd.get("website") as string) || null,
    });

    if (error) {
      toast.error(message || "Something went wrong. Please try again.");
    } else {
      toast.success("Demo request received! We'll be in touch within 24 hours.");
      form.reset();
    }
    setLoading(false);
  };

  return (
    <section className="py-20 lg:py-28 bg-background" id="demo">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <div>
            <SectionHeading
              badge="Book a Demo"
              title={`See ${productName} in Action`}
              description={`Get a personalized walkthrough of ${productName} tailored to your team's needs. No commitment required.`}
              align="left"
            />
            <div className="mt-8 space-y-4">
              {[
                { label: "Response Time", value: "Under 24 hours" },
                { label: "Demo Length", value: "30-minute personalized session" },
                { label: "What You'll See", value: "Live platform walkthrough & Q&A" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{item.label}:</strong> {item.value}
                  </span>
                </div>
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
            <div className="px-3 py-2 bg-primary/10 rounded-lg text-center">
              <span className="text-xs font-display font-medium text-primary">Product Demo Request: {productName}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Full Name" name="name" required />
              <Input placeholder="Work Email" type="email" name="email" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Phone" type="tel" name="phone" />
              <Input placeholder="Company" name="company" />
            </div>
            <Textarea placeholder={`Tell us what you'd like to see in the ${productName} demo...`} name="message" rows={3} />
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200" size="lg" disabled={loading}>
              {loading ? "Sending..." : `Request ${productName} Demo`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

const FAQSection = ({ faqs, productName }: { faqs: { q: string; a: string }[]; productName: string }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionHeading badge="FAQ" title={`${productName} — Frequently Asked Questions`} description="Common questions about features, pricing, and getting started." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-display font-medium text-foreground text-sm pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductDetail = () => {
  const { productSlug } = useParams();
  const { data: dbProducts, isLoading } = useProducts();

  const productList = (dbProducts || []).map(p => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
  }));

  const product = productList.find((p: any) => p.slug === productSlug);

  if (isLoading) return <div className="py-32 container mx-auto px-4"><Skeleton className="h-96" /></div>;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Product Not Found</h1>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
          <Button asChild className="mt-4 bg-primary text-white"><Link to="/products">View All Products</Link></Button>
        </div>
      </div>
    );
  }

  const extUrl = product.external_url;
  const useCases = useCaseData[product.slug] || [];
  const faqs = faqData[product.slug] || [];
  const links = relatedLinks[product.slug] || [];
  const gradient = colorMap[product.color || "electric"] || "from-primary to-purple";
  const logo = logoMap[product.slug];
  const screenshot = screenshotMap[product.slug];

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    url: extUrl || `https://ecctechnologies.ai/products/${product.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Cloud",
    provider: {
      "@type": "Organization",
      name: "ECC Technologies",
      url: "https://ecctechnologies.ai",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: extUrl || `https://ecctechnologies.ai/products/${product.slug}`,
    },
    featureList: (product.features as any[]).map((f: any) => typeof f === "string" ? f : f.name).join(", "),
  };

  const otherProducts = productList.filter(p => p.slug !== product.slug);

  return (
    <>
      <SEOHead
        title={(product as any).seo_title || product.name}
        description={(product as any).seo_description || product.description || ""}
        canonical={`/products/${product.slug}`}
        schema={schema}
      />

      <Breadcrumb
        items={[
          { label: "Products", path: "/products" },
          { label: product.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-hero py-20 lg:py-28 relative overflow-hidden">
        <PageHeroBackdrop src={screenshot || pageHeroImages.products.src} position={screenshot ? "center 12%" : pageHeroImages.products.position} />
        <div className="absolute inset-0 opacity-15">
          <div className={`absolute top-20 right-20 w-96 h-96 bg-gradient-to-br ${gradient} rounded-full blur-[150px]`} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/products" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Products
            </Link>
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                {logo && (
                  <img
                    src={logo}
                    alt={`${product.name} logo`}
                    className="w-16 h-16 rounded-xl object-contain bg-white p-2 shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="inline-block px-3 py-1 text-xs font-display font-medium text-primary uppercase tracking-widest rounded-full bg-white/10">
                  {product.tagline}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">{product.name}</h1>
              <p className="mt-5 text-lg text-white/60 leading-relaxed max-w-2xl">{product.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200" asChild>
                  <a href="#demo">Book a Demo</a>
                </Button>
                {extUrl && (
                  <Button
                    size="lg"
                    className="bg-white text-navy hover:bg-white/90 font-semibold transition-all duration-200"
                    asChild
                    onClick={() => trackExternalClick(product.name, extUrl)}
                  >
                    <a href={extUrl} target="_blank" rel="noopener noreferrer">
                      Visit {product.name} <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Features" title={`What ${product.name} Offers`} description="Enterprise-grade capabilities designed for maximum impact and operational efficiency." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {(product.features as any[]).map((f: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm">{typeof f === "string" ? f : f.name || f.title}</h3>
                {typeof f !== "string" && f.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Benefits" title={`Why Choose ${product.name}`} dark description="Measurable outcomes that drive real business value from day one." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(product.benefits as any[]).map((b: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors"
              >
                <div className="text-2xl font-display font-bold text-primary mb-2">0{i + 1}</div>
                <h3 className="font-display font-semibold text-white text-sm mb-2">
                  {typeof b === "string" ? b : b.title}
                </h3>
                {typeof b !== "string" && b.description && (
                  <p className="text-xs text-white/60 leading-relaxed">{b.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      {useCases.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeading badge="Use Cases" title={`Who Uses ${product.name}`} description="Purpose-built for teams and organizations that demand reliability, intelligence, and scale." />
            <div className="mt-14 grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {useCases.map((uc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-6 rounded-xl border border-border bg-card"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 text-white`}>
                    {uc.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{uc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Preview */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Platform Preview" title={`${product.name} at a Glance`} dark />
          <div className="mt-10 max-w-4xl mx-auto">
            {screenshot ? (
              <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src={screenshot}
                  alt={`${product.name} platform screenshot`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-navy-light to-navy flex items-center justify-center border border-white/10 shadow-2xl">
                <span className="text-white font-display font-bold text-3xl">{product.name}</span>
              </div>
            )}
            {extUrl && (
              <div className="mt-6 text-center">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
                  asChild
                  onClick={() => trackExternalClick(product.name, extUrl)}
                >
                  <a href={extUrl} target="_blank" rel="noopener noreferrer">
                    Explore the Live Platform <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} productName={product.name} />

      {/* Book Demo Form */}
      <ProductDemoForm productName={product.name} />

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <section className="py-16 bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-4">
            <SectionHeading badge="Explore More" title="Other Products from ECC Technologies" />
            <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {otherProducts.map((op) => {
                const opLogo = logoMap[op.slug];
                return (
                  <Link
                    key={op.id}
                    to={`/products/${op.slug}`}
                    className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow group"
                  >
                    {opLogo ? (
                      <img
                        src={opLogo}
                        alt={op.name}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-border"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[op.color || "electric"]} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold">{op.name[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{op.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{op.tagline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Links */}
      {links.length > 0 && (
        <section className="py-12 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {links.map((link, i) => (
                <Button key={i} className="bg-navy text-white hover:bg-navy-light font-medium transition-all duration-200" asChild>
                  <Link to={link.to}>{link.label} <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              ))}
              {extUrl && (
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" asChild onClick={() => trackExternalClick(product.name, extUrl)}>
                  <a href={extUrl} target="_blank" rel="noopener noreferrer">
                    Visit {product.name} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetail;
