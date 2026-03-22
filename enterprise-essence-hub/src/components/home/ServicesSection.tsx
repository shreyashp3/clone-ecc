import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, Server, GitBranch, Brain, Shield, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { useServiceCategories } from "@/hooks/useCMSData";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = { Cloud, Server, GitBranch, Brain, Shield };

const ServicesSection = () => {
  const { categories, isLoading } = useServiceCategories();

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="What We Do"
          title="Enterprise-Grade Cloud & DevOps Services"
          description="From migration to managed services, we deliver end-to-end cloud solutions that reduce costs and accelerate innovation."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)
            : categories.map((service: any, i: number) => {
                const Icon = iconMap[service.icon] || Cloud;
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={`/services/${service.slug}`}
                      className="group block h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-lg text-foreground">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{service.description}</p>
                      <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
