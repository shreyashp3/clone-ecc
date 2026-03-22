import { Link } from "react-router-dom";
import { Cloud, Server, GitBranch, Brain, Shield, HardDrive, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "@/components/shared/SEOHead";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import CTASection from "@/components/home/CTASection";
import { useServiceCategories } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { pageHeroImages } from "@/data/pageHeroImages";

const iconMap: Record<string, any> = { Cloud, Server, GitBranch, Brain, Shield, HardDrive };

const Services = () => {
  const { categories, isLoading } = useServiceCategories();

  return (
    <>
      <SEOHead
        title="Cloud & DevOps Services | AWS, Azure, Kubernetes"
        description="Enterprise cloud and DevOps services for AWS and Azure: migration, managed services, CI/CD pipelines, Kubernetes, security, and FinOps optimization."
        canonical="/services"
      />

      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <PageHeroBackdrop src={pageHeroImages.services.src} position={pageHeroImages.services.position} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-4">Our Services</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white max-w-3xl mx-auto">
              End-to-End Cloud & DevOps Solutions
            </h1>
            <p className="mt-5 text-lg text-white/60 max-w-xl mx-auto">
              From strategy to execution — we help enterprises build, migrate, and manage cloud infrastructure at scale.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 space-y-16">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Services coming soon. Check back shortly!</p>
          ) : (
            categories.map((cat: any, i: number) => {
              const Icon = iconMap[cat.icon] || Cloud;
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-xl text-foreground">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.subServices.map((sub: any) => (
                      <Link
                        key={sub.slug}
                        to={`/services/${cat.slug}/${sub.slug}`}
                        className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
                      >
                        <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{sub.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{sub.description}</p>
                        <div className="mt-2 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Learn More <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default Services;
