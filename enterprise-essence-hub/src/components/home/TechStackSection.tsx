import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";

const techStack = [
  { category: "Cloud", items: ["AWS", "Azure", "GCP", "DigitalOcean"] },
  { category: "DevOps", items: ["Kubernetes", "Docker", "Terraform", "Ansible"] },
  { category: "CI/CD", items: ["Jenkins", "GitLab CI", "GitHub Actions", "ArgoCD"] },
  { category: "Monitoring", items: ["Prometheus", "Grafana", "Datadog", "ELK Stack"] },
  { category: "AI/ML", items: ["TensorFlow", "PyTorch", "OpenAI", "SageMaker"] },
  { category: "Security", items: ["Vault", "Snyk", "Trivy", "CloudTrail"] },
];

const TechStackSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Technology Stack"
          title="Battle-Tested Technologies"
          description="We work with industry-leading tools and platforms to deliver enterprise-grade solutions."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wider mb-4">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
