import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/shared/SectionHeading";
import { useProducts } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";

const logoMap: Record<string, string> = {
  ticketly: "/images/ticketly-logo.jpg",
  "ai-cloud-insights": "/images/ai-cloud-insights-logo.png",
  "gpu-on-cloud": "/images/gpuoncloud-logo.png",
};

const colorClasses: Record<string, string> = {
  electric: "from-primary to-purple",
  purple: "from-purple to-primary",
  teal: "from-teal to-primary",
};

const ProductsSection = () => {
  const { data: dbProducts, isLoading } = useProducts();

  if (!isLoading && (!dbProducts || dbProducts.length === 0)) return null;

  const productList = (dbProducts || []).map(p => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
    externalUrl: p.external_url,
  }));

  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white lg:py-24">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_58%)]" aria-hidden="true" />
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Our Products"
          title="AI-Powered Platforms Built for Scale"
          description="Purpose-built SaaS products that solve real infrastructure challenges."
          dark
        />

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {isLoading
            ? [1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl bg-white/10" />)
            : productList.map((product: any, i: number) => {
                const logo = logoMap[product.slug];
                return (
                  <motion.div
                    key={product.id || product.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="home-panel-dark group relative p-8"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${product.name} logo`}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 mb-5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[product.color] || "from-primary to-purple"} flex items-center justify-center mb-5`}>
                        <span className="text-white font-display font-bold text-lg">{product.name[0]}</span>
                      </div>
                    )}
                    <h3 className="font-display font-bold text-xl text-white">{product.name}</h3>
                    <p className="text-sm text-white/40 font-medium mt-1">{product.tagline}</p>
                    <p className="text-sm text-white/60 mt-4 leading-relaxed">{(product.description || "").slice(0, 120)}...</p>

                    <ul className="mt-5 space-y-2">
                      {(product.features as any[]).slice(0, 3).map((f: any, j: number) => (
                        <li key={j} className="text-xs text-white/50 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {typeof f === "string" ? f : f.name || f.title}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex gap-3">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200" asChild>
                        <Link to={`/products/${product.slug}`}>Learn More <ArrowRight className="w-3 h-3 ml-1" /></Link>
                      </Button>
                      {product.external_url && (
                        <Button size="sm" className="bg-white/10 text-white hover:bg-white/20 font-semibold transition-all duration-200" asChild>
                          <a href={product.external_url} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
