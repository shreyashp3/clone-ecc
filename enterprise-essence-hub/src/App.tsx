import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { QuickEnquiryProvider } from "@/components/shared/QuickEnquiryContext";

import PageTracker from "./components/PageTracker";
import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import BlogManager from "./pages/admin/BlogManager";
import LeadsManager from "./pages/admin/LeadsManager";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import TestimonialsManager from "./pages/admin/TestimonialsManager";
import CaseStudiesManager from "./pages/admin/CaseStudiesManager";
import GalleryManager from "./pages/admin/GalleryManager";
import ProductsManager from "./pages/admin/ProductsManager";
import ServicesManager from "./pages/admin/ServicesManager";
import SEOManager from "./pages/admin/SEOManager";
import ChatManager from "./pages/admin/ChatManager";
import SettingsManager from "./pages/admin/SettingsManager";
import CareersManager from "./pages/admin/CareersManager";
import UserManagement from "./pages/admin/UserManagement";
const ChatWidget = lazy(() => import("@/components/chat/ChatWidget"));
import AdminProviders from "./components/admin/AdminProviders";

const queryClient = new QueryClient();

const withLayout = (page: React.ReactNode) => <Layout>{page}</Layout>;

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <AdminProviders>
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  </AdminProviders>
);

const App = () => {
  const [loadChat, setLoadChat] = useState(false);

  useEffect(() => {
    let didLoad = false;
    const load = () => {
      if (didLoad) return;
      didLoad = true;
      setLoadChat(true);
    };

    const onInteract = () => load();

    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("scroll", onInteract, { once: true, passive: true });

    const idleCallback = (window as any).requestIdleCallback as
      | ((cb: () => void, options?: { timeout: number }) => number)
      | undefined;
    const cancelIdleCallback = (window as any).cancelIdleCallback as
      | ((handle: number) => void)
      | undefined;

    let idleHandle: number | null = null;
    if (idleCallback) {
      idleHandle = idleCallback(load, { timeout: 5000 });
    }

    const timeout = window.setTimeout(load, 5000);

    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onInteract);
      if (idleHandle !== null) {
        cancelIdleCallback?.(idleHandle);
      }
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <QuickEnquiryProvider>
              <PageTracker />
              <ScrollToTop />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={withLayout(<Index />)} />
              <Route path="/about" element={withLayout(<About />)} />
              <Route path="/services" element={withLayout(<Services />)} />
              <Route path="/services/:categorySlug" element={withLayout(<ServiceDetail />)} />
              <Route path="/services/:categorySlug/:serviceSlug" element={withLayout(<ServiceDetail />)} />
              <Route path="/products" element={withLayout(<Products />)} />
              <Route path="/products/:productSlug" element={withLayout(<ProductDetail />)} />
              <Route path="/blog" element={withLayout(<Blog />)} />
              <Route path="/blog/:slug" element={withLayout(<BlogPost />)} />
              <Route path="/case-studies" element={withLayout(<CaseStudies />)} />
              <Route path="/case-studies/:slug" element={withLayout(<CaseStudyDetail />)} />
              <Route path="/contact" element={withLayout(<Contact />)} />
              <Route path="/privacy-policy" element={withLayout(<PrivacyPolicy />)} />
              <Route path="/terms" element={withLayout(<Terms />)} />
              <Route path="/cookie-policy" element={withLayout(<CookiePolicy />)} />
              <Route path="/careers" element={withLayout(<Careers />)} />

              {/* Admin routes */}
              <Route
                path="/admin/login"
                element={
                  <AdminProviders>
                    <AdminLogin />
                  </AdminProviders>
                }
              />
              <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><BlogManager /></AdminRoute>} />
              <Route path="/admin/leads" element={<AdminRoute><LeadsManager /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} />
              <Route path="/admin/testimonials" element={<AdminRoute><TestimonialsManager /></AdminRoute>} />
              <Route path="/admin/case-studies" element={<AdminRoute><CaseStudiesManager /></AdminRoute>} />
              <Route path="/admin/gallery" element={<AdminRoute><GalleryManager /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><ProductsManager /></AdminRoute>} />
              <Route path="/admin/services" element={<AdminRoute><ServicesManager /></AdminRoute>} />
              <Route path="/admin/seo" element={<AdminRoute><SEOManager /></AdminRoute>} />
              <Route path="/admin/chat" element={<AdminRoute><ChatManager /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SettingsManager /></AdminRoute>} />
              <Route path="/admin/careers" element={<AdminRoute><CareersManager /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />

              <Route path="*" element={withLayout(<NotFound />)} />
              </Routes>
            </QuickEnquiryProvider>
            {/* Chat widget on all public pages */}
            {loadChat && (
              <Suspense fallback={null}>
                <ChatWidget />
              </Suspense>
            )}
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

