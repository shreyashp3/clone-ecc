import { ShieldCheck, Award, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: ShieldCheck, label: "AWS Advanced Tier Partner" },
  { icon: Award, label: "200+ Projects Delivered" },
  { icon: Globe, label: "Global Delivery" },
  { icon: Lock, label: "Secure & Compliant" },
];

const TrustStripSection = () => {
  return (
    <section className="py-8 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm sm:text-base font-display font-semibold text-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStripSection;
