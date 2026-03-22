import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/shared/SectionHeading";
import { useCaseStudies } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";

const CaseStudiesSection = () => {
  const { data: dbStudies, isLoading } = useCaseStudies();

  if (!isLoading && (!dbStudies || dbStudies.length === 0)) return null;

  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,248,255,0.78))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Case Studies"
          title="Real Results for Real Businesses"
          description="See how we've helped enterprises transform their infrastructure."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3].map(i => (
                <div key={i} className="home-panel overflow-hidden">
                  <Skeleton className="h-48" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
            : (dbStudies || []).slice(0, 3).map((study: any, i: number) => (
                <motion.div
                  key={study.slug || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/case-studies/${study.slug}`}
                    className="home-panel group block h-full overflow-hidden"
                  >
                    <div className="aspect-video bg-muted overflow-hidden">
                      {study.featured_image ? (
                        <img
                          src={study.featured_image}
                          alt={study.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-muted">
                          <Building2 className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {study.client_industry && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          {study.client_industry}
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-foreground mt-3 text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">{study.title}</h3>
                      <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Case Study <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/case-studies" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All Case Studies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
