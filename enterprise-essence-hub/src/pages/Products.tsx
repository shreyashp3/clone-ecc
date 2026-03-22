import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, Shield, Cpu, Cloud, Headphones, BarChart3, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/shared/SEOHead";
import SectionHeading from "@/components/shared/SectionHeading";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import CTASection from "@/components/home/CTASection";
import { useProducts } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { analytics } from "@/integrations/api/client";
import { pageHeroImages } from "@/data/pageHeroImages";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const colorMap: Record<string, string> = {
  purple: "from-purple to-primary",
  electric: "from-primary to-purple",
  teal: "from-teal to-primary",
};

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

const ecosystemPillars = [
  { icon: <Shield className="w-5 h-5" />, title: "Security-First", desc: "Enterprise-grade protection across every platform" },
  { icon: <BarChart3 className="w-5 h-5" />, title: "AI-Driven Analytics", desc: "Intelligent insights powering smarter decisions" },
  { icon: <Zap className="w-5 h-5" />, title: "Instant Deployment", desc: "Launch production workloads in minutes, not weeks" },
  { icon: <Cloud className="w-5 h-5" />, title: "Multi-Cloud Ready", desc: "Seamless integration with AWS, Azure, and beyond" },
];

const comparisonFeatures = [
  { feature: "AI-Powered Automation", ticketly: true, aicloud: true, gpu: false },
  { feature: "Real-Time Monitoring", ticketly: true, aicloud: true, gpu: true },
  { feature: "Multi-Cloud Support", ticketly: false, aicloud: true, gpu: true },
  { feature: "SLA Compliance Tracking", ticketly: true, aicloud: false, gpu: true },
  { feature: "Enterprise Security", ticketly: true, aicloud: true, gpu: true },
  { feature: "Pay-Per-Use Billing", ticketly: false, aicloud: true, gpu: true },
  { feature: "Knowledge Base / Docs", ticketly: true, aicloud: true, gpu: true },
  { feature: "API & Integrations", ticketly: true, aicloud: true, gpu: true },
  { feature: "Free Tier Available", ticketly: false, aicloud: true, gpu: true },
  { feature: "24/7 Expert Support", ticketly: true, aicloud: true, gpu: true },
];

const trackExternalClick = (productName: string, url: string) => {
  analytics.trackPageView(`/products/external-click/${productName.toLowerCase().replace(/\s+/g, "-")}`, url);
};

const Products = () => {
  const { data: dbProducts, isLoading } = useProducts();
  const { openEnquiry } = useQuickEnquiry();
  const productList = (dbProducts || []).map(p => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
  }));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ECC Technologies Product Suite",
    description: "AI-powered SaaS platforms for cloud optimization, GPU infrastructure, and IT service management",
    numberOfItems: productList.length,
    itemListElement: productList.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.name,
        description: p.description,
        url: p.external_url || `https://ecctechnologies.ai/products/${p.slug}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="AI SaaS Products | Cloud Cost, GPU & ITSM"
        description="Explore ECC Technologies' AI SaaS ecosystem: cloud cost optimization, on-demand GPU infrastructure, and intelligent IT service management."
        canonical="/products"
        schema={productSchema}
      />

      {/* Hero */}
      <section className="bg-hero py-20 lg:py-28 relative overflow-hidden">
        <PageHeroBackdrop src={pageHeroImages.products.src} position={pageHeroImages.products.position} />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-5">
              Our Product Ecosystem
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white max-w-4xl mx-auto leading-tight">
              AI-Powered Platforms for <span className="text-gradient">Modern Infrastructure</span>
            </h1>
            <p className="mt-5 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Purpose-built SaaS products solving real enterprise challenges — from cloud cost optimization
              and GPU computing to intelligent IT service management.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
                onClick={() => openEnquiry({ interest: "product_demo" })}
              >
                Book a Product Demo
              </Button>
              <Button size="lg" className="bg-white text-navy hover:bg-white/90 font-semibold transition-all duration-200" asChild>
                <Link to="/services">Explore Our Services <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Pillars */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemPillars.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-5 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="Product Suite"
            title="Three Platforms, One Mission"
            description="Each product in the ECC Technologies ecosystem addresses a critical enterprise infrastructure need — powered by AI, built for reliability."
          />

          <div className="mt-16 space-y-20">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)
            ) : productList.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Products coming soon.</p>
            ) : (
              productList.map((product: any, i: number) => {
                const isReversed = i % 2 !== 0;
                const logo = logoMap[product.slug];
                const screenshot = screenshotMap[product.slug];
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-2 gap-12 items-center"
                  >
                    <div className={isReversed ? "lg:order-2" : ""}>
                      <div className="flex items-center gap-4 mb-4">
                        {logo ? (
                          <img
                            src={logo}
                            alt={`${product.name} logo`}
                            className="w-14 h-14 rounded-xl object-contain bg-white p-1.5 border border-border shadow-sm"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[product.color] || "from-primary to-purple"} flex items-center justify-center`}>
                            <span className="text-white font-bold text-xl">{product.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-display font-medium text-primary uppercase tracking-widest">{product.tagline}</span>
                          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{product.name}</h2>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                      <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                        {(product.features as any[]).slice(0, 6).map((f: any, j: number) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{typeof f === "string" ? f : f.name || f.title}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200" asChild>
                          <Link to={`/products/${product.slug}`}>
                            Learn More <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                        {product.external_url && (
                          <Button
                            className="bg-navy text-white hover:bg-navy-light font-semibold transition-all duration-200"
                            asChild
                            onClick={() => trackExternalClick(product.name, product.external_url!)}
                          >
                            <a href={product.external_url} target="_blank" rel="noopener noreferrer">
                              Visit {product.name} <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className={isReversed ? "lg:order-1" : ""}>
                      {screenshot ? (
                        <div className="aspect-[4/3] rounded-2xl border border-border overflow-hidden shadow-2xl">
                          <img
                            src={screenshot}
                            alt={`${product.name} platform preview`}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center border border-border shadow-2xl">
                          <span className="text-white font-display font-bold text-3xl">{product.name}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      {!isLoading && productList.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <SectionHeading
              badge="Compare"
              title="Product Comparison"
              description="See how each product in the ECC Technologies ecosystem addresses different enterprise needs."
            />
            <div className="mt-12 max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-display font-semibold text-foreground">Capability</th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <img src="/images/ticketly-logo.jpg" alt="Ticketly" className="w-8 h-8 rounded-lg object-contain" loading="lazy" decoding="async" />
                        <span>Ticketly</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <img src="/images/ai-cloud-insights-logo.png" alt="AI Cloud Insights" className="w-8 h-8 rounded-lg object-contain" loading="lazy" decoding="async" />
                        <span>AI Cloud Insights</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <img src="/images/gpuoncloud-logo.png" alt="GPU on Cloud" className="w-8 h-8 rounded-lg object-contain" loading="lazy" decoding="async" />
                        <span>GPU on Cloud</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={i} className={`border-b border-border ${i % 2 === 0 ? "bg-card" : ""}`}>
                      <td className="p-4 text-foreground font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.ticketly ? <CheckCircle className="w-4 h-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {row.aicloud ? <CheckCircle className="w-4 h-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {row.gpu ? <CheckCircle className="w-4 h-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Cross-links & SEO content */}
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="The ECC Technologies Advantage"
            title="An Integrated Product Ecosystem"
            description="Our products work together to provide end-to-end infrastructure intelligence — from cloud cost management and GPU computing to automated IT support."
            dark
          />
          <div className="mt-12 max-w-3xl mx-auto space-y-6 text-white/70 text-sm leading-relaxed">
            <p>
              ECC Technologies builds AI-powered SaaS platforms that address the most pressing challenges in modern enterprise infrastructure.
              Whether you need to optimize your <strong className="text-white">AWS and Azure cloud spending</strong> with{" "}
              <a href="https://aicloudinsights.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI Cloud Insights</a>, access{" "}
              <strong className="text-white">on-demand GPU infrastructure</strong> for AI/ML workloads via{" "}
              <a href="https://gpuoncloud.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GPU on Cloud</a>, or transform your{" "}
              <strong className="text-white">IT helpdesk operations</strong> with{" "}
              <a href="https://ticketly.support/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ticketly</a>'s
              intelligent automation — our products deliver measurable results from day one.
            </p>
            <p>
              Each platform is built on the same principles: <strong className="text-white">AI-driven intelligence</strong>,{" "}
              <strong className="text-white">enterprise-grade security</strong>, and <strong className="text-white">instant time-to-value</strong>.
              Our products integrate seamlessly with existing workflows and are backed by our{" "}
              <Link to="/services" className="text-primary hover:underline">expert consulting services</Link>.
            </p>
            <p>
              Explore our <Link to="/case-studies" className="text-primary hover:underline">case studies</Link> to see how enterprises
              have achieved 40% cloud cost reduction, 10x support productivity, and sub-minute GPU deployment times. Read the latest insights
              on our <Link to="/blog" className="text-primary hover:underline">technology blog</Link>.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
              onClick={() => openEnquiry({ interest: "product_demo" })}
            >
              Schedule a Product Demo
            </Button>
            <Button className="bg-white/10 text-white hover:bg-white/20 font-semibold border border-white/20" asChild>
              <Link to="/case-studies">View Case Studies</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Products;
