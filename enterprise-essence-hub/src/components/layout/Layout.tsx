import { ReactNode, Suspense, lazy } from "react";
import Header from "./Header";
import DeferredSection from "@/components/shared/DeferredSection";

const Footer = lazy(() => import("./Footer"));

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-18">{children}</main>
      <DeferredSection minHeight={520}>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </DeferredSection>
    </div>
  );
};

export default Layout;
