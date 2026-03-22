import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import SEOHead from "@/components/shared/SEOHead";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { useBlogPosts, useBlogCategories } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { pageHeroImages } from "@/data/pageHeroImages";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: posts, isLoading } = useBlogPosts();
  const { data: categories } = useBlogCategories();

  const filtered = activeCategory
    ? posts?.filter((p: any) => p.blog_categories?.slug === activeCategory)
    : posts;

  return (
    <>
      <SEOHead
        title="Cloud & DevOps Blog"
        description="Expert insights on AWS, Azure, Kubernetes, DevOps automation, FinOps, and AI for enterprise infrastructure."
        canonical="/blog"
      />

      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <PageHeroBackdrop src={pageHeroImages.blog.src} position={pageHeroImages.blog.position} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-4">Blog</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Engineering Insights</h1>
            <p className="mt-4 text-lg text-white/60 max-w-xl mx-auto">Deep dives into cloud, DevOps, and AI from our team of engineers.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${activeCategory === cat.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <Skeleton className="h-36" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post: any, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="h-auto bg-gradient-to-br from-navy to-navy-light flex items-center justify-center overflow-hidden min-h-40">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-auto object-contain max-h-48"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="text-xs font-display text-white/40 uppercase tracking-widest">
                          {(post as any).blog_categories?.name || "Article"}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        {post.published_at && <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>}
                        {post.read_time_minutes && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time_minutes} min</span>
                        )}
                      </div>
                      <h2 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                      {post.excerpt && <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No posts yet. Check back soon!</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
