import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Cloud,
  CurrencyDollar,
  GitBranch as PhosphorGit,
  Package as PhosphorPackage,
  Shield as PhosphorShield,
  ChartBar,
  Gear,
  Headphones as PhosphorHeadphones,
} from "phosphor-react";
import { PremiumIcon } from "@/components/shared/PremiumIcon";

const featured = [
  { icon: Cloud, title: "AWS Migration Services", slug: "aws-cloud-services/aws-cloud-migration-services", id: "aws-migration", color: "primary" as const },
  { icon: CurrencyDollar, title: "AWS Cost Optimization", slug: "aws-cloud-services/aws-cost-optimization-services", id: "aws-cost", color: "amber" as const },
  { icon: PhosphorGit, title: "DevOps Consulting", slug: "devops-consulting/devops-consulting-services", id: "devops", color: "teal" as const },
  { icon: PhosphorPackage, title: "Kubernetes Consulting", slug: "devops-consulting/kubernetes-consulting-services", id: "k8s", color: "purple" as const },
  { icon: PhosphorShield, title: "Cloud Security Services", slug: "aws-cloud-services/aws-cloud-security-services", id: "security", color: "primary" as const },
  { icon: ChartBar, title: "FinOps Services", slug: "aws-cloud-services/aws-finops-services", id: "finops", color: "amber" as const },
  { icon: Gear, title: "CI/CD Automation", slug: "devops-consulting/ci-cd-pipeline-automation", id: "cicd", color: "teal" as const },
  { icon: PhosphorHeadphones, title: "Managed Cloud Operations", slug: "managed-cloud-services/managed-infrastructure-services", id: "managed", color: "purple" as const },
];

const FeaturedServicesSection = () => {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white lg:py-24">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_60%)]" aria-hidden="true" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full mb-4 font-display uppercase tracking-wider bg-white/10 text-white/80">
            High-Impact Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Services That Drive Business Value
          </h2>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/55 max-w-2xl mx-auto">
            Our most sought-after services for enterprises looking to modernize, optimize, and scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/services/${item.slug}`}
                className="home-panel-dark group flex items-center gap-3 p-4 sm:p-5"
              >
                <PremiumIcon
                  icon={<item.icon weight="duotone" size={20} />}
                  size="md"
                  gradient
                  color={item.color}
                  animated
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-display font-semibold text-white block truncate">{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-primary mt-1 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServicesSection;
