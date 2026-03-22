import { motion } from "framer-motion";
import { Landmark, Code2, HeartPulse, Factory, ShoppingCart, Truck, Building2, ArrowRight } from "lucide-react";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const industries = [
  { icon: Landmark, title: "FinTech", desc: "Secure, compliant cloud infrastructure for financial services and payment platforms." },
  { icon: Code2, title: "SaaS", desc: "Scalable multi-tenant architectures, CI/CD, and cloud-native deployment." },
  { icon: HeartPulse, title: "Healthcare", desc: "HIPAA-compliant cloud solutions for health data management and telemedicine." },
  { icon: Factory, title: "Manufacturing", desc: "IoT-integrated cloud platforms for smart manufacturing and supply chain." },
  { icon: ShoppingCart, title: "Retail", desc: "High-availability e-commerce infrastructure with auto-scaling." },
  { icon: Truck, title: "Supply Chain", desc: "Real-time logistics tracking and cloud-based ERP modernization." },
  { icon: Building2, title: "Enterprise IT", desc: "Large-scale cloud transformation and hybrid cloud strategies." },
];

const IndustrySolutionsSection = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(241,247,255,0.88),rgba(249,251,255,0.96))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full mb-4 font-display uppercase tracking-wider bg-primary/10 text-primary">
            Industry Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            Cloud Solutions for Every Industry
          </h2>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tailored cloud, DevOps, and AI solutions purpose-built for your industry's unique challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                type="button"
                className="home-panel group block h-full w-full text-left p-6 sm:p-7"
                onClick={() => openEnquiry({ interest: "consultation" })}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <ind.icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{ind.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{ind.desc}</p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Solutions <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutionsSection;
