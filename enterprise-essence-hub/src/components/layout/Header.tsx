import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@/data/services";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState(
    serviceCategories[0]?.slug || ""
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const globalDropdownKey = "global-sites";
  const closeTimeoutRef = useRef<number | null>(null);
  const { openEnquiry } = useQuickEnquiry();

  const globalSites = [
    {
      label: "United States & United Kingdom",
      url: "https://smartdevops.ai",
      domain: "smartdevops.ai",
      flagSrc: "/images/flags/us.svg",
      flagAlt: "United States",
    },
    {
      label: "Germany",
      url: "https://smarttechstack.de",
      domain: "smarttechstack.de",
      flagSrc: "/images/flags/de.svg",
      flagAlt: "Germany",
    },
    {
      label: "UAE",
      url: "https://smarttechstacks.com",
      domain: "smarttechstacks.com",
      flagSrc: "/images/flags/uae.svg",
      flagAlt: "UAE",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    {
      label: "Services",
      path: "/services",
      showViewAll: true,
      children: serviceCategories.map((s) => ({
        label: s.title,
        path: `/services/${s.slug}`,
        description: s.description,
      })),
    },
    {
      label: "Products",
      path: "/products",
      showViewAll: true,
      children: products.map((p) => ({
        label: p.name,
        path: `/products/${p.slug}`,
        description: p.tagline,
      })),
    },
    {
      label: "Company",
      path: "/about",
      showViewAll: false,
      children: [
        { label: "About", path: "/about", description: "Who we are and how we work." },
        { label: "Case Studies", path: "/case-studies", description: "Real-world delivery stories." },
        { label: "Careers", path: "/careers", description: "Join our team and grow." },
      ],
    },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" },
  ];

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const openDropdown = (label: string) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(label);
    if (label === "Services" && !activeServiceCategory && serviceCategories.length > 0) {
      setActiveServiceCategory(serviceCategories[0].slug);
    }
  };

  const scheduleCloseDropdown = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
      closeTimeoutRef.current = null;
    }, 120);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-lg h-14 lg:h-16" 
        : "bg-card/85 backdrop-blur-xl border-b border-border/70 h-16 lg:h-18"
    )}>
      <div className={cn(
        "container mx-auto flex items-center justify-between px-4 transition-all duration-300",
        isScrolled ? "h-14 lg:h-16" : "h-16 lg:h-18"
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={handleLogoClick}>
          <img
            src="/images/ecc-logo.png"
            alt="ECC Technologies"
            className="h-14 w-auto object-contain"
            width={196}
            height={56}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {navItems.map((item) => {
            const isServicesMega = item.label === "Services";
            const activeCategory =
              serviceCategories.find((cat) => cat.slug === activeServiceCategory) || serviceCategories[0];

            return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && openDropdown(item.label)}
              onMouseLeave={item.children ? scheduleCloseDropdown : undefined}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-base font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  location.pathname === item.path ||
                    item.children?.some((child) => location.pathname.startsWith(child.path))
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>

              {/* Dropdown */}
              {item.children && activeDropdown === item.label && !isServicesMega && (
                <div
                  className="absolute top-full left-0 mt-1 w-80 bg-card rounded-xl border border-border shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => openDropdown(item.label)}
                  onMouseLeave={scheduleCloseDropdown}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className="block px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {child.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {child.description}
                      </div>
                    </Link>
                  ))}
                  {item.showViewAll !== false && (
                    <div className="border-t border-border mt-1 pt-1">
                      <Link
                        to={item.path}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-primary font-medium hover:bg-muted rounded-lg transition-colors"
                      >
                        View All {item.label} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {isServicesMega && activeDropdown === item.label && (
                <div
                  className="absolute top-full left-0 mt-1 w-[760px] bg-card rounded-2xl border border-border shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => openDropdown(item.label)}
                  onMouseLeave={scheduleCloseDropdown}
                >
                  <div className="grid grid-cols-[240px_1fr] gap-4">
                    <div className="pr-3 border-r border-border/70">
                      <p className="px-2 pb-2 text-xs font-display font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Service Areas
                      </p>
                      <div className="space-y-1">
                        {serviceCategories.map((category) => {
                          const isActive = category.slug === activeCategory?.slug;
                          return (
                            <Link
                              key={category.slug}
                              to={`/services/${category.slug}`}
                              onMouseEnter={() => setActiveServiceCategory(category.slug)}
                              onFocus={() => setActiveServiceCategory(category.slug)}
                              className={cn(
                                "w-full text-left rounded-xl px-3 py-2 transition-colors block",
                                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                              )}
                            >
                              <div className="text-sm font-medium">{category.title}</div>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-2 border-t border-border/70 pt-2">
                        <Link
                          to="/services"
                          className="flex items-center gap-1 px-3 py-2 text-sm text-primary font-medium hover:bg-muted rounded-lg transition-colors"
                        >
                          View All Services <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="pl-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-display font-semibold text-foreground">
                          {activeCategory?.title}
                        </p>
                        <Link
                          to={`/services/${activeCategory?.slug}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Explore
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-2">
                        {activeCategory?.subServices.map((sub) => (
                          <Link
                            key={sub.slug}
                            to={`/services/${activeCategory.slug}/${sub.slug}`}
                            className="rounded-lg border border-border/70 px-3 py-2 text-sm text-foreground hover:border-primary/40 hover:bg-muted transition-colors"
                          >
                            <div className="font-medium">{sub.title}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )})}
        </nav>

        {/* Global Sites + CTA */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div
            className="relative"
            onMouseEnter={() => openDropdown(globalDropdownKey)}
            onMouseLeave={scheduleCloseDropdown}
            onFocusCapture={() => setActiveDropdown(globalDropdownKey)}
            onBlurCapture={(event) => {
              const next = event.relatedTarget as Node | null;
              if (!next || !event.currentTarget.contains(next)) {
                setActiveDropdown(null);
              }
            }}
          >
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 text-base font-medium rounded-full border border-border/60 bg-background/70 shadow-sm backdrop-blur transition-colors",
                activeDropdown === globalDropdownKey
                  ? "text-primary border-primary/40 bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:border-border"
              )}
              aria-haspopup="menu"
              aria-expanded={activeDropdown === globalDropdownKey}
            >
              <Globe className="h-4 w-4 text-primary" />
              Global Sites
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {activeDropdown === globalDropdownKey && (
              <div
                className="absolute top-full right-0 mt-2 w-72 bg-card/95 rounded-2xl border border-border/70 shadow-2xl p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseEnter={() => openDropdown(globalDropdownKey)}
                onMouseLeave={scheduleCloseDropdown}
              >
                {globalSites.map((site) => (
                  <a
                    key={site.url}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <img
                      src={site.flagSrc}
                      alt={site.flagAlt}
                      className="h-5 w-8 rounded-sm border border-border/60 object-cover shadow-sm"
                      width={32}
                      height={20}
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {site.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {site.domain}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            className="bg-gradient-electric hover:opacity-90 transition-opacity text-white font-semibold px-4 text-base"
            onClick={() => openEnquiry()}
          >
            Get In Touch
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  to={item.path}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="pt-2">
                <div className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Global Sites
                </div>
                <div className="mt-2 space-y-1">
                  {globalSites.map((site) => (
                    <a
                      key={site.url}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <img
                        src={site.flagSrc}
                        alt={site.flagAlt}
                        className="h-5 w-8 rounded-sm border border-border/60 object-cover"
                        width={32}
                        height={20}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>{site.domain}</span>
                    </a>
                  ))}
                </div>
              </div>
              <Button
                className="w-full bg-gradient-electric text-white"
                onClick={() => {
                  openEnquiry({ interest: "assessment" });
                  setMobileOpen(false);
                }}
              >
                Book Assessment
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
