import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/shared/SEOHead";
import Breadcrumb from "@/components/shared/Breadcrumb";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { useBlogPost } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pageHeroImages } from "@/data/pageHeroImages";
import { enhanceHtmlImages } from "@/lib/htmlImages";

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = useBlogPost(slug || "");

  if (isLoading) {
    return (
      <div className="py-32 container mx-auto px-4 max-w-3xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Post Not Found</h1>
          <Button asChild className="mt-4"><Link to="/blog">Back to Blog</Link></Button>
        </div>
      </div>
    );
  }

  const category = (post as any).blog_categories;

  // Detect if content is HTML (from Tiptap) or plain markdown
  const isHTML = post.content?.startsWith("<") || post.content?.includes("</");

  return (
    <>
      <SEOHead
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt || ""}
        canonical={`/blog/${post.slug}`}
        ogImage={post.og_image || post.featured_image || undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          publisher: { "@type": "Organization", name: "ECC Technologies" },
        }}
      />

      <Breadcrumb
        items={[
          { label: "Blog", path: "/blog" },
          { label: post.title },
        ]}
      />

      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <PageHeroBackdrop src={post.featured_image || pageHeroImages.blog.src} position={post.featured_image ? "center 35%" : pageHeroImages.blog.position} />
        <div className="container relative z-10 mx-auto max-w-3xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            {category?.name && (
              <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-4 ml-4">
                {category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(post.published_at), "MMM d, yyyy")}
                </span>
              )}
              {post.read_time_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.read_time_minutes} min read
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {post.featured_image && (
        <div className="container mx-auto px-4 max-w-3xl -mt-8 relative z-10">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full rounded-2xl border border-border shadow-lg"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <article className="py-16 container mx-auto px-4 max-w-3xl">
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary">
          {isHTML ? (
            <div dangerouslySetInnerHTML={{ __html: enhanceHtmlImages(post.content || "") }} />
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
};

export default BlogPost;
