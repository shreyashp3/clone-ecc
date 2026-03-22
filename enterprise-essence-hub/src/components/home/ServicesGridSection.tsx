import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cloud, Server, GitBranch, DollarSign, ShieldCheck, Headset, Brain, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const services = [
  { icon: Cloud, title: "AWS Cloud Services", desc: "End-to-end AWS solutions from migration to managed services and cost optimization.", slug: "aws-cloud-services", id: "aws" },
  { icon: Server, title: "Azure Cloud Services", desc: "Microsoft Azure expertise for migration, DevOps, and managed infrastructure.", slug: "azure-cloud-services", id: "azure" },
  { icon: Headset, title: "Managed Cloud Services", desc: "24/7 managed services with proactive monitoring and enterprise SLAs.", slug: "managed-cloud-services", id: "managed" },
  { icon: GitBranch, title: "DevOps Consulting & Automation", desc: "CI/CD, IaC, container orchestration, and complete SDLC automation.", slug: "devops-consulting", id: "devops" },
  { icon: DollarSign, title: "FinOps & Cloud Cost Optimization", desc: "Optimize cloud spend with FinOps practices, rightsizing, and cost governance.", slug: "aws-cloud-services", id: "finops" },
  { icon: ShieldCheck, title: "Cloud Security & Compliance", desc: "Security audits, compliance automation, and threat detection.", slug: "aws-cloud-services", id: "security" },
  { icon: Brain, title: "AI & Cloud-Native Solutions", desc: "Custom AI/ML solutions, intelligent automation, and cloud-native apps.", slug: "aws-cloud-services", id: "ai" },
];

const ServicesGridSection = () => {
  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(241,247,255,0.84),rgba(248,251,255,0.96))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="What We Do"
          title="End-to-End Cloud & DevOps Services"
          description="From migration to managed services, we deliver enterprise-grade cloud solutions that reduce costs and accelerate innovation."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="home-panel group block h-full p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{service.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">{service.desc}</p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Service <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGridSection;
