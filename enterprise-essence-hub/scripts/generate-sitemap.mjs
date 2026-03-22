import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = (process.env.SITE_URL || "https://ecctechnologies.ai").replace(/\/$/, "");
const apiBase = (process.env.VITE_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "");
const nowIso = new Date().toISOString();

const staticRoutes = [
  "/",
  "/about",
  "/services",
  "/products",
  "/blog",
  "/case-studies",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/careers",
];

const loadTsExport = (relativePath, exportName) => {
  const absolutePath = path.join(rootDir, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const sandbox = {
    module: { exports: {} },
  };
  sandbox.exports = sandbox.module.exports;
  vm.createContext(sandbox);
  vm.runInContext(output.outputText, sandbox);
  const moduleExports = sandbox.module.exports || sandbox.exports;
  return moduleExports?.[exportName] || [];
};

const addUrl = (map, route, lastmod = nowIso) => {
  if (!route.startsWith("/")) {
    return;
  }
  map.set(route, lastmod);
};

const buildUrls = () => {
  const urls = new Map();

  staticRoutes.forEach((route) => addUrl(urls, route));

  const serviceCategories = loadTsExport("src/data/services.ts", "serviceCategories");
  if (Array.isArray(serviceCategories)) {
    serviceCategories.forEach((category) => {
      if (!category?.slug) return;
      addUrl(urls, `/services/${category.slug}`);
      if (Array.isArray(category.subServices)) {
        category.subServices.forEach((sub) => {
          if (!sub?.slug) return;
          addUrl(urls, `/services/${category.slug}/${sub.slug}`);
        });
      }
    });
  }

  const products = loadTsExport("src/data/products.ts", "products");
  if (Array.isArray(products)) {
    products.forEach((product) => {
      if (!product?.slug) return;
      addUrl(urls, `/products/${product.slug}`);
    });
  }

  return urls;
};

const fetchJson = async (endpoint) => {
  const res = await fetch(`${apiBase}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Sitemap fetch failed: ${endpoint} (${res.status})`);
  }
  return res.json();
};

const fetchPaged = async (endpoint, limit = 200) => {
  const all = [];
  let page = 1;
  while (true) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const payload = await fetchJson(`${endpoint}${sep}page=${page}&limit=${limit}`);
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    all.push(...rows);
    if (!payload?.pagination || page >= payload.pagination.pages) break;
    page += 1;
  }
  return all;
};

const fetchApiRoutes = async (urls) => {
  const [posts, caseStudies, services, products] = await Promise.all([
    fetchPaged("/api/blog"),
    fetchJson("/api/case-studies"),
    fetchJson("/api/services"),
    fetchJson("/api/products"),
  ]);

  if (Array.isArray(posts)) {
    posts.forEach((post) => {
      if (!post?.slug) return;
      addUrl(urls, `/blog/${post.slug}`, post.updatedAt || post.publishedAt || nowIso);
    });
  }

  if (Array.isArray(caseStudies)) {
    caseStudies.forEach((study) => {
      if (!study?.slug) return;
      addUrl(urls, `/case-studies/${study.slug}`, study.updatedAt || nowIso);
    });
  }

  if (Array.isArray(services)) {
    services.forEach((service) => {
      if (!service?.slug || !service?.categorySlug) return;
      addUrl(urls, `/services/${service.categorySlug}`);
      addUrl(urls, `/services/${service.categorySlug}/${service.slug}`, service.updatedAt || nowIso);
    });
  }

  if (Array.isArray(products)) {
    products.forEach((product) => {
      if (!product?.slug) return;
      addUrl(urls, `/products/${product.slug}`, product.updatedAt || nowIso);
    });
  }
};

const toXml = (urls) => {
  const entries = Array.from(urls.entries()).sort(([a], [b]) => a.localeCompare(b));
  const lines = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...entries.map(([route, lastmod]) => {
      const loc = `${siteUrl}${route}`;
      const lastmodIso = new Date(lastmod).toISOString();
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmodIso}</lastmod>`,
        "  </url>",
      ].join("\n");
    }),
    "</urlset>",
    "",
  ];
  return lines.join("\n");
};

const run = async () => {
  const urls = buildUrls();
  try {
    await fetchApiRoutes(urls);
  } catch (error) {
    console.warn("Sitemap: API fetch failed, continuing with static routes.");
  }

  const sitemapXml = toXml(urls);
  const outputPath = path.join(rootDir, "public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemapXml, "utf8");
  console.log(`Sitemap generated with ${urls.size} URLs.`);
};

run();
