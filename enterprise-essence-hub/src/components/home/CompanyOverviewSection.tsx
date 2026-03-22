import { Check } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const highlights = [
  "Consultancy for simple to complex Cloud & DevOps solutions",
  "Enterprise-grade secure, highly available, scalable cloud design & support",
  "FinOps for multi-cloud cost optimization",
  "End-to-end automation using IaC, DevOps, CI/CD, and complete SDLC",
  "Global delivery across India, US, UK, UAE, and Germany",
  "Multi-cloud expertise: AWS & Azure",
];

const CompanyOverviewSection = () => {
  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,246,255,0.7))]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="hero-fade-up" style={{ animationDelay: "0.1s" }}>
            <SectionHeading
              badge="Why ECC Technologies"
              title="Cloud-First. Engineering-Led. Results-Driven."
              description="We are a team of experts with a global presence and strong expertise in IT, Cloud, and DevOps. We provide end-to-end cloud & DevOps solutions for AWS and Azure."
              align="left"
            />
            <ul className="mt-8 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hero-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: "8+", label: "Years in Business" },
                { value: "50+", label: "Certified Engineers" },
                { value: "200+", label: "Projects Delivered" },
                { value: "15+", label: "Countries Served" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="home-panel p-6 sm:p-8 text-center hero-fade-up"
                  style={{ animationDelay: `${0.25 + i * 0.08}s` }}
                >
                  <div className="text-3xl sm:text-4xl font-display font-bold text-primary">{stat.value}</div>
                  <div className="text-sm sm:text-base text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyOverviewSection;
