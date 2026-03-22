import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, staffMiddleware, adminMiddleware, hashPassword } from '../utils/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(staffMiddleware);

const ROLE_VALUES = [
  'super_admin',
  'admin',
  'content_manager',
  'support_agent',
  'marketing_manager'
] as const;

type AppRole = typeof ROLE_VALUES[number];

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function normalizeArray(val: any, fallback: any[] = []) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizeJson(val: any, fallback: any = {}) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
}

function normalizeDate(val: any) {
  if (!val) return null;
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date;
}

function mapServicePayload(body: any) {
  return stripUndefined({
    title: body.title,
    slug: body.slug,
    categorySlug: body.category_slug,
    categoryName: body.category_name,
    tagline: body.tagline ?? null,
    description: body.description ?? null,
    content: normalizeJson(body.content, {}),
    icon: body.icon ?? null,
    features: normalizeArray(body.features, []),
    benefits: normalizeArray(body.benefits, []),
    processSteps: normalizeArray(body.process_steps, []),
    technologies: normalizeArray(body.technologies, []),
    faqs: normalizeArray(body.faqs, []),
    seoTitle: body.seo_title ?? null,
    seoDescription: body.seo_description ?? null,
    seoKeywords: normalizeArray(body.seo_keywords, []),
    schemaMarkup: normalizeJson(body.schema_markup, {}),
    sortOrder: body.sort_order ?? 0,
    isPublished: body.is_published ?? false,
    heroSubtitle: body.hero_subtitle ?? null,
    longOverview: body.long_overview ?? null,
    serviceInclusions: normalizeArray(body.service_inclusions, []),
    industryUseCases: normalizeArray(body.industry_use_cases, []),
    comparisonPoints: normalizeArray(body.comparison_points, []),
    relatedBlogs: normalizeArray(body.related_blogs, []),
    relatedServices: normalizeArray(body.related_services, []),
    relatedCaseStudies: normalizeArray(body.related_case_studies, []),
    relatedProducts: normalizeArray(body.related_products, []),
    ctaHeading: body.cta_heading ?? null,
    ctaText: body.cta_text ?? null,
    ogImage: body.og_image ?? null,
    canonicalUrl: body.canonical_url ?? null
  });
}

function mapProductPayload(body: any) {
  return stripUndefined({
    name: body.name,
    slug: body.slug,
    tagline: body.tagline ?? null,
    description: body.description ?? null,
    externalUrl: body.external_url ?? null,
    features: normalizeArray(body.features, []),
    benefits: normalizeArray(body.benefits, []),
    pricing: normalizeJson(body.pricing, {}),
    color: body.color ?? null,
    logoUrl: body.logo_url ?? null,
    screenshots: normalizeArray(body.screenshots, []),
    seoTitle: body.seo_title ?? null,
    seoDescription: body.seo_description ?? null,
    schemaMarkup: normalizeJson(body.schema_markup, {}),
    sortOrder: body.sort_order ?? 0,
    isPublished: body.is_published ?? false
  });
}

function mapBlogPostPayload(body: any, fallbackAuthorId?: string) {
  return stripUndefined({
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    featuredImage: body.featured_image ?? null,
    categoryId: body.category_id ?? null,
    authorId: body.author_id ?? fallbackAuthorId ?? null,
    tags: normalizeArray(body.tags, []),
    status: body.status ?? 'draft',
    publishedAt: normalizeDate(body.published_at),
    scheduledAt: normalizeDate(body.scheduled_at),
    readTimeMinutes: body.read_time_minutes ?? null,
    seoTitle: body.seo_title ?? null,
    seoDescription: body.seo_description ?? null,
    ogImage: body.og_image ?? null,
    schemaMarkup: normalizeJson(body.schema_markup, {})
  });
}

function mapBlogCategoryPayload(body: any) {
  return stripUndefined({
    name: body.name,
    slug: body.slug,
    description: body.description ?? null
  });
}

function mapCaseStudyPayload(body: any) {
  return stripUndefined({
    slug: body.slug,
    title: body.title,
    clientIndustry: body.client_industry ?? null,
    problem: body.problem ?? null,
    solution: body.solution ?? null,
    content: body.content ?? null,
    technologies: normalizeArray(body.technologies, []),
    results: normalizeArray(body.results, []),
    images: normalizeArray(body.images, []),
    featuredImage: body.featured_image ?? null,
    isPublished: body.is_published ?? false,
    seoTitle: body.seo_title ?? null,
    seoDescription: body.seo_description ?? null,
    sortOrder: body.sort_order ?? 0
  });
}

function mapCareerPayload(body: any) {
  return stripUndefined({
    title: body.title,
    slug: body.slug,
    department: body.department ?? null,
    location: body.location ?? null,
    employmentType: body.employment_type ?? null,
    experienceLevel: body.experience_level ?? null,
    summary: body.summary ?? null,
    description: body.description ?? null,
    responsibilities: normalizeArray(body.responsibilities, []),
    requirements: normalizeArray(body.requirements, []),
    benefits: normalizeArray(body.benefits, []),
    applyEmail: body.apply_email ?? null,
    applyLink: body.apply_link ?? null,
    isPublished: body.is_published ?? false,
    sortOrder: body.sort_order ?? 0
  });
}

function mapTestimonialPayload(body: any) {
  return stripUndefined({
    name: body.name,
    role: body.role ?? null,
    company: body.company ?? null,
    content: body.content,
    avatarUrl: body.avatar_url ?? null,
    rating: body.rating ?? null,
    isFeatured: body.is_featured ?? false,
    isPublished: body.is_published ?? true,
    sortOrder: body.sort_order ?? 0
  });
}

function mapGalleryPayload(body: any) {
  return stripUndefined({
    title: body.title ?? null,
    description: body.description ?? null,
    fileUrl: body.file_url,
    fileType: body.file_type ?? null,
    category: body.category ?? null,
    altText: body.alt_text ?? null,
    isPublished: body.is_published ?? true,
    sortOrder: body.sort_order ?? 0,
    uploadedBy: body.uploaded_by ?? null
  });
}

function mapPageSeoPayload(body: any) {
  return stripUndefined({
    pagePath: body.page_path ? `/${String(body.page_path).replace(/^\/+/, '')}` : undefined,
    title: body.title ?? null,
    description: body.description ?? null,
    ogImage: body.og_image ?? null,
    schemaMarkup: normalizeJson(body.schema_markup, {}),
    canonicalUrl: body.canonical_url ?? null,
    noIndex: body.no_index ?? false
  });
}

function mapSiteSettingPayload(body: any) {
  return stripUndefined({
    key: body.key,
    value: normalizeJson(body.value, {})
  });
}

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [
      totalLeads,
      newLeads,
      convertedLeads,
      totalPosts,
      totalViews,
      recentLeads,
      recentConversations
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count({ where: { status: 'won' } }),
      prisma.blogPost.count(),
      prisma.pageView.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, status: true, createdAt: true }
      }),
      prisma.chatConversation.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, visitorName: true, status: true, updatedAt: true }
      })
    ]);

    res.json({
      totalLeads,
      newLeads,
      convertedLeads,
      totalPosts,
      totalViews,
      recentLeads,
      recentConversations
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ==================== USERS ====================
router.get('/users', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        roles: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const payload = users.map(user => ({
      user_id: user.id,
      display_name: user.profile?.displayName || null,
      avatar_url: user.profile?.avatarUrl || null,
      roles: user.roles.map(role => ({
        id: role.id,
        role: role.role
      }))
    }));

    res.json(payload);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const desiredRole = ROLE_VALUES.includes(role) ? role : 'content_manager';

    const requester = (req as any).user;
    if (desiredRole === 'super_admin' && requester?.role !== 'super_admin') {
      res.status(403).json({ error: 'Only super admins can create super admin users' });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash
      }
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: desiredRole
      }
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: full_name || normalizedEmail.split('@')[0]
      }
    });

    res.status(201).json({
      success: true,
      user_id: user.id,
      role: desiredRole
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/users/:id/roles', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!ROLE_VALUES.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const requester = (req as any).user;
    if (role === 'super_admin' && requester?.role !== 'super_admin') {
      res.status(403).json({ error: 'Only super admins can assign super admin role' });
      return;
    }

    const existing = await prisma.userRole.findFirst({
      where: { userId, role }
    });

    if (existing) {
      res.status(409).json({ error: 'User already has this role' });
      return;
    }

    const created = await prisma.userRole.create({
      data: { userId, role }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Add role error:', error);
    res.status(500).json({ error: 'Failed to add role' });
  }
});

router.delete('/users/roles/:roleId', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId;
    await prisma.userRole.delete({ where: { id: roleId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

// ==================== SERVICES ====================
router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(services);
  } catch (error) {
    console.error('List services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/services/:id', async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

router.post('/services', async (req: Request, res: Response) => {
  try {
    const data = mapServicePayload(req.body);
    if (!data.title || !data.slug || !data.categorySlug) {
      res.status(400).json({ error: 'Title, slug, and category_slug are required' });
      return;
    }
    const created = await prisma.service.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/services/:id', async (req: Request, res: Response) => {
  try {
    const data = mapServicePayload(req.body);
    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ==================== PRODUCTS ====================
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', async (req: Request, res: Response) => {
  try {
    const data = mapProductPayload(req.body);
    if (!data.name || !data.slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }
    const created = await prisma.product.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const data = mapProductPayload(req.body);
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== BLOG POSTS ====================
router.get('/blog', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error('List blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

router.get('/blog/:id', async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!post) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

router.post('/blog', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = mapBlogPostPayload(req.body, user?.userId);
    if (!data.title || !data.slug) {
      res.status(400).json({ error: 'Title and slug are required' });
      return;
    }
    const created = await prisma.blogPost.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

router.put('/blog/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = mapBlogPostPayload(req.body, user?.userId);
    const updated = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

router.delete('/blog/:id', async (req: Request, res: Response) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// ==================== BLOG CATEGORIES ====================
router.get('/blog-categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('List blog categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/blog-categories/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.blogCategory.findUnique({
      where: { id: req.params.id }
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/blog-categories', async (req: Request, res: Response) => {
  try {
    const data = mapBlogCategoryPayload(req.body);
    if (!data.name || !data.slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }
    const created = await prisma.blogCategory.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/blog-categories/:id', async (req: Request, res: Response) => {
  try {
    const data = mapBlogCategoryPayload(req.body);
    const updated = await prisma.blogCategory.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/blog-categories/:id', async (req: Request, res: Response) => {
  try {
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== CASE STUDIES ====================
router.get('/case-studies', async (req: Request, res: Response) => {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(caseStudies);
  } catch (error) {
    console.error('List case studies error:', error);
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

router.get('/case-studies/:id', async (req: Request, res: Response) => {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: req.params.id }
    });
    if (!caseStudy) {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    res.json(caseStudy);
  } catch (error) {
    console.error('Get case study error:', error);
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

router.post('/case-studies', async (req: Request, res: Response) => {
  try {
    const data = mapCaseStudyPayload(req.body);
    if (!data.title || !data.slug) {
      res.status(400).json({ error: 'Title and slug are required' });
      return;
    }
    const created = await prisma.caseStudy.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create case study error:', error);
    res.status(500).json({ error: 'Failed to create case study' });
  }
});

router.put('/case-studies/:id', async (req: Request, res: Response) => {
  try {
    const data = mapCaseStudyPayload(req.body);
    const updated = await prisma.caseStudy.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update case study error:', error);
    res.status(500).json({ error: 'Failed to update case study' });
  }
});

router.delete('/case-studies/:id', async (req: Request, res: Response) => {
  try {
    await prisma.caseStudy.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Case study deleted' });
  } catch (error) {
    console.error('Delete case study error:', error);
    res.status(500).json({ error: 'Failed to delete case study' });
  }
});

// ==================== CAREERS ====================
router.get('/careers', async (req: Request, res: Response) => {
  try {
    const careers = await prisma.career.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(careers);
  } catch (error) {
    console.error('List careers error:', error);
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
});

router.get('/careers/:id', async (req: Request, res: Response) => {
  try {
    const career = await prisma.career.findUnique({
      where: { id: req.params.id }
    });
    if (!career) {
      res.status(404).json({ error: 'Career not found' });
      return;
    }
    res.json(career);
  } catch (error) {
    console.error('Get career error:', error);
    res.status(500).json({ error: 'Failed to fetch career' });
  }
});

router.post('/careers', async (req: Request, res: Response) => {
  try {
    const data = mapCareerPayload(req.body);
    if (!data.title || !data.slug) {
      res.status(400).json({ error: 'Title and slug are required' });
      return;
    }
    const created = await prisma.career.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create career error:', error);
    res.status(500).json({ error: 'Failed to create career' });
  }
});

router.put('/careers/:id', async (req: Request, res: Response) => {
  try {
    const data = mapCareerPayload(req.body);
    const updated = await prisma.career.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update career error:', error);
    res.status(500).json({ error: 'Failed to update career' });
  }
});

router.delete('/careers/:id', async (req: Request, res: Response) => {
  try {
    await prisma.career.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Career deleted' });
  } catch (error) {
    console.error('Delete career error:', error);
    res.status(500).json({ error: 'Failed to delete career' });
  }
});

// ==================== TESTIMONIALS ====================
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(testimonials);
  } catch (error) {
    console.error('List testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.get('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: req.params.id }
    });
    if (!testimonial) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

router.post('/testimonials', async (req: Request, res: Response) => {
  try {
    const data = mapTestimonialPayload(req.body);
    if (!data.name || !data.content) {
      res.status(400).json({ error: 'Name and content are required' });
      return;
    }
    const created = await prisma.testimonial.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const data = mapTestimonialPayload(req.body);
    const updated = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// ==================== GALLERY ====================
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    const items = await prisma.gallery.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('List gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.get('/gallery/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.gallery.findUnique({
      where: { id: req.params.id }
    });
    if (!item) {
      res.status(404).json({ error: 'Gallery item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

router.post('/gallery', async (req: Request, res: Response) => {
  try {
    const data = mapGalleryPayload(req.body);
    if (!data.fileUrl) {
      res.status(400).json({ error: 'file_url is required' });
      return;
    }
    const created = await prisma.gallery.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

router.put('/gallery/:id', async (req: Request, res: Response) => {
  try {
    const data = mapGalleryPayload(req.body);
    const updated = await prisma.gallery.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

router.delete('/gallery/:id', async (req: Request, res: Response) => {
  try {
    await prisma.gallery.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// ==================== PAGE SEO ====================
router.get('/page-seo', async (req: Request, res: Response) => {
  try {
    const items = await prisma.pageSeo.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error('List SEO error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO metadata' });
  }
});

router.get('/page-seo/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.pageSeo.findUnique({
      where: { id: req.params.id }
    });
    if (!item) {
      res.status(404).json({ error: 'SEO metadata not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Get SEO error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO metadata' });
  }
});

router.post('/page-seo', async (req: Request, res: Response) => {
  try {
    const data = mapPageSeoPayload(req.body);
    if (!data.pagePath) {
      res.status(400).json({ error: 'page_path is required' });
      return;
    }
    const created = await prisma.pageSeo.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create SEO error:', error);
    res.status(500).json({ error: 'Failed to create SEO metadata' });
  }
});

router.put('/page-seo/:id', async (req: Request, res: Response) => {
  try {
    const data = mapPageSeoPayload(req.body);
    const updated = await prisma.pageSeo.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update SEO error:', error);
    res.status(500).json({ error: 'Failed to update SEO metadata' });
  }
});

router.delete('/page-seo/:id', async (req: Request, res: Response) => {
  try {
    await prisma.pageSeo.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'SEO metadata deleted' });
  } catch (error) {
    console.error('Delete SEO error:', error);
    res.status(500).json({ error: 'Failed to delete SEO metadata' });
  }
});

// ==================== SITE SETTINGS ====================
router.get('/site-settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' }
    });
    res.json(settings);
  } catch (error) {
    console.error('List settings error:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

router.get('/site-settings/:id', async (req: Request, res: Response) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: req.params.id }
    });
    if (!setting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }
    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch site setting' });
  }
});

router.post('/site-settings', async (req: Request, res: Response) => {
  try {
    const data = mapSiteSettingPayload(req.body);
    if (!data.key) {
      res.status(400).json({ error: 'key is required' });
      return;
    }
    const created = await prisma.siteSetting.create({ data: data as any });
    res.status(201).json(created);
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ error: 'Failed to create site setting' });
  }
});

router.put('/site-settings/:id', async (req: Request, res: Response) => {
  try {
    const data = mapSiteSettingPayload(req.body);
    const updated = await prisma.siteSetting.update({
      where: { id: req.params.id },
      data: data as any
    });
    res.json(updated);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update site setting' });
  }
});

router.delete('/site-settings/:id', async (req: Request, res: Response) => {
  try {
    await prisma.siteSetting.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete site setting' });
  }
});

export default router;
