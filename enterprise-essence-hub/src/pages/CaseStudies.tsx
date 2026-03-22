import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/shared/SEOHead";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import CTASection from "@/components/home/CTASection";
import { useCaseStudies } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { pageHeroImages } from "@/data/pageHeroImages";

const CaseStudies = () => {
  const { data: dbStudies, isLoading } = useCaseStudies();

  return (
    <>
      <SEOHead
        title="Cloud & DevOps Case Studies"
        description="Real-world success stories in AWS, Azure, Kubernetes, and DevOps automation from ECC Technologies."
        canonical="/case-studies"
      />

      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <PageHeroBackdrop src={pageHeroImages.caseStudies.src} position={pageHeroImages.caseStudies.position} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-4">Case Studies</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Real Results. Real Impact.</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <Skeleton className="h-48" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !dbStudies || dbStudies.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Case studies coming soon. Check back shortly!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dbStudies.map((study: any, i: number) => {
                const techs = Array.isArray(study.technologies) ? study.technologies : [];
                const results = Array.isArray(study.results) ? study.results : [];
                return (
                  <motion.div
                    key={study.slug || study.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex flex-col"
                  >
                    <Link
                      to={`/case-studies/${study.slug}`}
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all flex flex-col flex-1"
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden flex items-center justify-center">
                        {study.featured_image ? (
                          <img
                            src={study.featured_image}
                            alt={study.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {study.client_industry && (
                          <span className="inline-block w-fit text-xs font-display font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                            {study.client_industry}
                          </span>
                        )}
                        <h2 className="text-lg font-display font-bold text-foreground mb-2 line-clamp-2">
                          {study.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                          {study.problem || ""}
                        </p>

                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {techs.slice(0, 5).map((t: any, j: number) => (
                              <span key={j} className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {typeof t === "string" ? t : t.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {results.length > 0 && (
                          <div className="mt-auto pt-4 border-t border-border grid grid-cols-2 gap-3">
                            {results.slice(0, 2).map((r: any, j: number) => {
                              const val = typeof r === "string" ? r : r.value;
                              const label = typeof r === "string" ? "" : r.label;
                              return (
                                <div key={j} className="text-center p-2 rounded-lg bg-muted/50">
                                  <div className="font-display font-bold text-primary text-sm">{val}</div>
                                  {label && <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
};

export default CaseStudies;
