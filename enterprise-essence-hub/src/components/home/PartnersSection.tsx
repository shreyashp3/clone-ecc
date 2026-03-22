import { motion } from "framer-motion";
import SectionHeading from "@/components/shared/SectionHeading";

const partners = [
  "Amazon Web Services",
  "Microsoft Azure",
  "Google Cloud",
  "HashiCorp",
  "Datadog",
  "GitLab",
  "Kubernetes",
  "Docker",
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-display font-medium uppercase tracking-widest text-muted-foreground mb-8">
          Trusted Technology Partners
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {partners.map((partner, i) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-sm font-display font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
