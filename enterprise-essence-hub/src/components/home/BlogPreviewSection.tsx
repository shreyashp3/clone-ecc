import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import SectionHeading from "@/components/shared/SectionHeading";
import { useBlogPosts } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPreviewSection = () => {
  const { data: dbPosts, isLoading } = useBlogPosts();

  if (!isLoading && (!dbPosts || dbPosts.length === 0)) return null;

  const posts = (dbPosts || []).slice(0, 3);

  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(241,247,255,0.84),rgba(249,251,255,0.98))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Blog"
          title="Insights & Engineering Deep Dives"
          description="Expert perspectives on cloud, DevOps, and AI from our engineering team."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)
            : posts.map((post: any, i: number) => (
                <motion.div
                  key={post.slug || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="home-panel group block h-full overflow-hidden"
                  >
                    <div className="aspect-video bg-muted overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-muted">
                          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        {post.published_at && <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>}
                        {post.read_time_minutes && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time_minutes} min</span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All Posts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
