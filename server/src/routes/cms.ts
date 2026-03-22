import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/services - Get all published services
router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:slug - Get service by slug
router.get('/services/:slug', async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!service || !service.isPublished) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// GET /api/products - Get all published products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug - Get product by slug
router.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!product || !product.isPublished) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/blog - Get all published blog posts
router.get('/blog', async (req: Request, res: Response) => {
  try {
    const { categoryId, page = '1', limit = '10' } = req.query;

    const where: any = {
      status: 'published'
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug - Get blog post by slug
router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug: req.params.slug
      },
      include: {
        category: true
      }
    });

    if (!post || post.status !== 'published') {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    // Increment view count
    await prisma.blogPost.update({
      where: {
        id: post.id
      },
      data: {
        viewCount: (post.viewCount || 0) + 1
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// GET /api/blog-categories - Get all blog categories
router.get('/blog-categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/case-studies - Get all published case studies
router.get('/case-studies', async (req: Request, res: Response) => {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(caseStudies);
  } catch (error) {
    console.error('Get case studies error:', error);
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

// GET /api/case-studies/:slug - Get case study by slug
router.get('/case-studies/:slug', async (req: Request, res: Response) => {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!caseStudy || !caseStudy.isPublished) {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }

    res.json(caseStudy);
  } catch (error) {
    console.error('Get case study error:', error);
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

// GET /api/careers - Get all published careers
router.get('/careers', async (req: Request, res: Response) => {
  try {
    const careers = await prisma.career.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(careers);
  } catch (error) {
    console.error('Get careers error:', error);
    res.status(500).json({ error: 'Failed to fetch careers' });
  }
});

// GET /api/careers/:slug - Get career by slug
router.get('/careers/:slug', async (req: Request, res: Response) => {
  try {
    const career = await prisma.career.findUnique({
      where: {
        slug: req.params.slug
      }
    });

    if (!career || !career.isPublished) {
      res.status(404).json({ error: 'Career not found' });
      return;
    }

    res.json(career);
  } catch (error) {
    console.error('Get career error:', error);
    res.status(500).json({ error: 'Failed to fetch career' });
  }
});

// GET /api/testimonials - Get featured testimonials
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isPublished: true,
        isFeatured: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/gallery - Get gallery items
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = {
      isPublished: true
    };

    if (category) {
      where.category = category;
    }

    const items = await prisma.gallery.findMany({
      where,
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json(items);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// GET /api/page-seo/:path - Get SEO data for page
router.get('/page-seo/:path', async (req: Request, res: Response) => {
  try {
    const pagePath = `/${req.params.path}`.replace(/\/+/g, '/');

    const seo = await prisma.pageSeo.findUnique({
      where: {
        pagePath
      }
    });

    if (!seo) {
      res.status(404).json({ error: 'SEO data not found' });
      return;
    }

    res.json(seo);
  } catch (error) {
    console.error('Get page SEO error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO data' });
  }
});

// GET /api/site-settings - Get site settings
router.get('/site-settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany();

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    res.json(settingsObject);
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
