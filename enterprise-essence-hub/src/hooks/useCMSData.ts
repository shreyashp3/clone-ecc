import { useQuery } from "@tanstack/react-query";
import { cms } from "@/integrations/api/client";

// Desired category display order
const CATEGORY_ORDER = ["aws-cloud-services", "azure-cloud-services", "managed-cloud-services", "devops-consulting"];

// Services
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const data = await cms.services.getAll();
      return data as any[];
    },
  });
}

// Group services by category for pages that need category grouping
export function useServiceCategories() {
  const q = useServices();
  const grouped = (q.data || []).reduce<Record<string, {
    title: string; slug: string; description: string; icon: string | null;
    subServices: any[];
  }>>((acc, s: any) => {
    if (!acc[s.category_slug]) {
      acc[s.category_slug] = {
        title: s.category_name,
        slug: s.category_slug,
        description: s.description || "",
        icon: s.icon || null,
        subServices: [],
      };
    }
    acc[s.category_slug].subServices.push(s);
    return acc;
  }, {});

  // Sort categories by defined order
  const sorted = CATEGORY_ORDER
    .filter((slug) => grouped[slug])
    .map((slug) => grouped[slug]);

  // Append any categories not in the predefined order
  Object.keys(grouped).forEach((slug) => {
    if (!CATEGORY_ORDER.includes(slug)) sorted.push(grouped[slug]);
  });

  return { ...q, categories: sorted };
}

// Products
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await cms.products.getAll();
      return data as any[];
    },
  });
}

// Blog posts
export function useBlogPosts(status: "published" | "all" = "published") {
  return useQuery({
    queryKey: ["blog_posts", status],
    queryFn: async () => {
      const payload = await cms.blog.getAll();
      const posts = Array.isArray(payload?.data) ? payload.data : payload;
      if (status === "published") return posts;
      return posts;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const data = await cms.blog.getBySlug(slug);
      return data;
    },
    enabled: !!slug,
  });
}

// Blog categories
export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog_categories"],
    queryFn: async () => {
      const data = await cms.blogCategories.getAll();
      return data as any[];
    },
  });
}

// Case studies
export function useCaseStudies() {
  return useQuery({
    queryKey: ["case_studies"],
    queryFn: async () => {
      const data = await cms.caseStudies.getAll();
      return data as any[];
    },
  });
}

// Single case study by slug
export function useCaseStudy(slug: string) {
  return useQuery({
    queryKey: ["case_study", slug],
    queryFn: async () => {
      const data = await cms.caseStudies.getBySlug(slug);
      return data;
    },
    enabled: !!slug,
  });
}

// Testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const data = await cms.testimonials.getAll();
      return data as any[];
    },
  });
}

// Gallery
export function useGallery(category?: string) {
  return useQuery({
    queryKey: ["gallery", category],
    queryFn: async () => {
      const data = await cms.gallery.getAll(category);
      return data as any[];
    },
  });
}

// Page SEO
export function usePageSEO(pagePath: string) {
  return useQuery({
    queryKey: ["page_seo", pagePath],
    queryFn: async () => {
      const data = await cms.pageSeo.getByPath(pagePath);
      return data ?? null;
    },
    enabled: !!pagePath,
  });
}

// Site settings
export function useSiteSetting(key: string) {
  return useQuery({
    queryKey: ["site_settings", key],
    queryFn: async () => {
      const settings = await cms.siteSettings.getAll();
      return settings?.[key];
    },
  });
}
