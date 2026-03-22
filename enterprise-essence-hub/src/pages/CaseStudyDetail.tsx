import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/shared/SEOHead";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { useCaseStudy } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { pageHeroImages } from "@/data/pageHeroImages";
import { enhanceHtmlImages } from "@/lib/htmlImages";

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const { data: study, isLoading } = useCaseStudy(slug || "");

  if (isLoading) {
    return (
      <div className="py-32 container mx-auto px-4 max-w-4xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Case Study Not Found</h1>
          <Button asChild className="mt-4"><Link to="/case-studies">Back to Case Studies</Link></Button>
        </div>
      </div>
    );
  }

  const techs = Array.isArray(study.technologies) ? study.technologies : [];
  const results = Array.isArray(study.results) ? study.results : [];
  const isHTML = study.content?.startsWith("<") || study.content?.includes("</");

  return (
    <>
      <SEOHead
        title={study.seo_title || study.title}
        description={study.seo_description || study.problem || ""}
        canonical={`/case-studies/${study.slug}`}
        ogImage={study.featured_image || undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: study.title,
          description: study.problem,
          publisher: { "@type": "Organization", name: "ECC Technologies" },
        }}
      />

      <Breadcrumb
        items={[
          { label: "Case Studies", path: "/case-studies" },
          { label: study.title },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <PageHeroBackdrop src={study.featured_image || pageHeroImages.caseStudies.src} position={study.featured_image ? "center 35%" : pageHeroImages.caseStudies.position} />
        <div className="container relative z-10 mx-auto max-w-4xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/case-studies" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Case Studies
            </Link>
            {study.client_industry && (
              <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-4 ml-4">
                {study.client_industry}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{study.title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {study.featured_image && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
          <img
            src={study.featured_image}
            alt={study.title}
            className="w-full rounded-2xl border border-border shadow-lg"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* Content */}
      <article className="py-16 container mx-auto px-4 max-w-4xl">
        {/* Results Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {results.map((r: any, j: number) => {
              const val = typeof r === "string" ? r : r.value;
              const label = typeof r === "string" ? "" : r.label;
              return (
                <div key={j} className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="font-display font-bold text-primary text-xl">{val}</div>
                  {label && <div className="text-xs text-muted-foreground mt-1">{label}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Technologies */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {techs.map((t: any, j: number) => (
              <span key={j} className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-lg">
                {typeof t === "string" ? t : t.name}
              </span>
            ))}
          </div>
        )}

        {/* Rich Content Body */}
        {study.content ? (
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-xl">
            {isHTML ? (
              <div dangerouslySetInnerHTML={{ __html: enhanceHtmlImages(study.content || "") }} />
            ) : (
              <div style={{ whiteSpace: "pre-wrap" }}>{study.content}</div>
            )}
          </div>
        ) : (
          <>
            {/* Fallback: render problem/solution fields */}
            {study.problem && (
              <div className="mb-8">
                <h2 className="text-xl font-display font-bold text-foreground mb-3">The Challenge</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{study.problem}</div>
              </div>
            )}
            {study.solution && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Our Solution</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{study.solution}</div>
              </div>
            )}
          </>
        )}
      </article>
    </>
  );
};

export default CaseStudyDetail;
