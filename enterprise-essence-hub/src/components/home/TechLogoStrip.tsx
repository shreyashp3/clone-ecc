import BrandLogo from "@/components/shared/BrandLogo";
import { hasBrandLogo } from "@/components/shared/brandLogoRegistry";

const techCategories = [
  {
    label: "Cloud & Platforms",
    items: [
      { name: "AWS", key: "aws" },
      { name: "Azure", key: "azure" },
      { name: "Google Cloud", key: "googlecloud" },
      { name: "DigitalOcean", key: "digitalocean" },
    ],
  },
  {
    label: "DevOps & Automation",
    items: [
      { name: "Kubernetes", key: "kubernetes" },
      { name: "Docker", key: "docker" },
      { name: "Terraform", key: "terraform" },
      { name: "Jenkins", key: "jenkins" },
      { name: "GitHub", key: "github" },
      { name: "Ansible", key: "ansible" },
    ],
  },
  {
    label: "Monitoring & Observability",
    items: [
      { name: "Prometheus", key: "prometheus" },
      { name: "Grafana", key: "grafana" },
    ],
  },
];

const TechLogoStrip = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-[linear-gradient(180deg,rgba(244,249,255,0.9),rgba(238,244,255,0.82))] py-14 lg:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground mb-3">
          Trusted Technology Ecosystem
        </h2>
        <p className="text-center text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Our team holds certifications across leading cloud and DevOps platforms.
        </p>

        <div className="space-y-8">
          {techCategories.map((category, ci) => (
            <div key={category.label}>
              <p className="text-[11px] font-display font-semibold uppercase tracking-[0.2em] text-primary mb-4 text-center">
                {category.label}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {category.items.map((item, i) => {
                  return (
                    <div
                      key={item.name}
                      className="home-panel flex h-[72px] w-[132px] items-center justify-center px-4 py-3 sm:h-[78px] sm:w-[148px] hero-fade-up"
                      style={{ animationDelay: `${(ci * category.items.length + i) * 0.04 + 0.1}s` }}
                    >
                      {hasBrandLogo(item.key) ? (
                        <div className="flex h-11 w-full items-center justify-center sm:h-12">
                          <BrandLogo
                            logoKey={item.key}
                            name={item.name}
                            className="drop-shadow-[0_6px_14px_rgba(15,23,42,0.08)]"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-display font-semibold text-muted-foreground">
                          {item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechLogoStrip;
