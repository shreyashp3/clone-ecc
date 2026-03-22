import { motion } from "framer-motion";
import { Search, PenTool, Rocket, Settings, HeadphonesIcon } from "lucide-react";

const steps = [
  { icon: Search, step: "01", title: "Assess", desc: "Deep-dive into your current infrastructure, identify gaps, and define objectives." },
  { icon: PenTool, step: "02", title: "Architect", desc: "Design scalable, secure, cost-optimized cloud architecture tailored to your needs." },
  { icon: Rocket, step: "03", title: "Implement", desc: "Execute migration, deployment, and automation with zero-downtime strategies." },
  { icon: Settings, step: "04", title: "Optimize", desc: "Continuous performance tuning, cost optimization, and security hardening." },
  { icon: HeadphonesIcon, step: "05", title: "Support", desc: "24/7 managed operations, monitoring, and proactive incident response." },
];

const DeliveryMethodologySection = () => {
  return (
    <section className="py-20 lg:py-28 bg-navy text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full mb-4 font-display uppercase tracking-wider bg-white/10 text-white/80">
            How We Work
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Enterprise Delivery Methodology
          </h2>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/55 max-w-2xl mx-auto">
            A proven 5-step process to take you from assessment to fully managed operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 sm:p-7 rounded-2xl border border-white/10 bg-white/5 text-center hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
            >
              <div className="text-xs font-display font-bold text-primary/60 mb-3">{step.step}</div>
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-white text-xl">{step.title}</h3>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-5 h-px bg-white/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeliveryMethodologySection;
