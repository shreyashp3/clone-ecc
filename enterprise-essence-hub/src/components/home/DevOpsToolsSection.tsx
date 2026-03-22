import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";
import BrandLogo from "@/components/shared/BrandLogo";
import { hasBrandLogo } from "@/components/shared/brandLogoRegistry";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const toolGroups = [
  { 
    label: "Containers & Orchestration", 
    tools: [
      { name: "Docker", key: "docker" },
      { name: "Kubernetes", key: "kubernetes" },
      { name: "Helm", key: "helm" },
      { name: "Istio", key: "istio" },
      { name: "Rancher", key: "rancher" },
    ],
  },
  { 
    label: "Infrastructure as Code", 
    tools: [
      { name: "Terraform", key: "terraform" },
      { name: "CloudFormation", key: "cloudformation" },
      { name: "Pulumi", key: "pulumi" },
      { name: "Ansible", key: "ansible" },
      { name: "Chef", key: "chef" },
    ],
  },
  { 
    label: "CI/CD Pipelines", 
    tools: [
      { name: "Jenkins", key: "jenkins" },
      { name: "GitHub Actions", key: "githubactions" },
      { name: "GitLab CI", key: "gitlab" },
      { name: "ArgoCD", key: "argocd" },
      { name: "CircleCI", key: "circleci" },
    ],
  },
  { 
    label: "Monitoring & Observability", 
    tools: [
      { name: "Prometheus", key: "prometheus" },
      { name: "Grafana", key: "grafana" },
      { name: "ELK Stack", key: "elk" },
      { name: "Datadog", key: "datadog" },
      { name: "New Relic", key: "newrelic" },
    ],
  },
  { 
    label: "Databases", 
    tools: [
      { name: "PostgreSQL", key: "postgresql" },
      { name: "MySQL", key: "mysql" },
      { name: "MongoDB", key: "mongodb" },
      { name: "Redis", key: "redis" },
      { name: "DynamoDB", key: "dynamodb" },
    ],
  },
  { 
    label: "Web & Networking", 
    tools: [
      { name: "Nginx", key: "nginx" },
      { name: "Apache", key: "apache" },
      { name: "HAProxy", key: "haproxy" },
      { name: "Traefik", key: "traefik" },
      { name: "Cloudflare", key: "cloudflare" },
    ],
  },
];

const DevOpsToolsSection = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,247,255,0.82))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="50+ DevOps Tools Expertise"
          title="Battle-Tested DevOps & Platform Stack"
          description="We work with industry-leading tools and platforms to deliver enterprise-grade infrastructure and automation."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolGroups.map((group, ci) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.08 }}
              className="home-panel p-6 sm:p-8"
            >
              <h3 className="font-display font-semibold text-xs sm:text-sm text-primary uppercase tracking-[0.15em] mb-5">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {group.tools.map((tool, i) => {
                  return (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (ci * group.tools.length + i) * 0.02 }}
                      className="group flex min-h-[112px] flex-col items-center justify-between gap-3 rounded-xl border border-border/60 bg-white/70 px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:bg-white"
                      title={tool.name}
                    >
                      {hasBrandLogo(tool.key) ? (
                        <div className="flex h-14 w-full items-center justify-center sm:h-16">
                          <BrandLogo
                            logoKey={tool.key}
                            name={tool.name}
                            className="drop-shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {tool.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors sm:text-xs">
                        {tool.name.split(" ")[0]}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="home-panel mt-10 p-6">
          <p className="text-sm sm:text-base text-foreground text-center">
            <strong>Not seeing your required tools?</strong> We work with 100+ additional platforms and can integrate any technology stack. 
            <button
              type="button"
              onClick={() => openEnquiry({ interest: "consultation" })}
              className="text-primary font-semibold hover:underline ml-1"
            >
              Let's discuss your needs.
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default DevOpsToolsSection;
