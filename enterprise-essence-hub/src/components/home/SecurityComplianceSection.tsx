import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const badges = [
  {
    src: "/images/aws-partner-badge.png",
    alt: "AWS Advanced Tier Services Partner",
    label: "AWS Advanced Tier",
    description: "Services Partner",
    cardClassName: "bg-white",
    imageClassName: "max-h-20",
  },
  {
    src: "/images/soc2-badge.png",
    alt: "SOC 2 Type II Certified",
    label: "SOC 2",
    description: "Type II Certified",
    cardClassName: "bg-white",
    imageClassName: "max-h-16",
  },
  {
    src: "/images/iso27001-badge.png",
    alt: "ISO 27001 Certified",
    label: "ISO 27001",
    description: "Certified",
    cardClassName: "bg-slate-50",
    imageClassName: "max-h-20",
  },
  {
    src: "/images/gdpr-badge.png",
    alt: "GDPR Ready",
    label: "GDPR",
    description: "Compliant",
    cardClassName: "bg-white",
    imageClassName: "max-h-16",
  },
];

const SecurityComplianceSection = () => {
  return (
    <section className="bg-navy py-16 text-white lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1.5 font-display text-xs font-medium uppercase tracking-wider text-white/80 sm:text-sm">
            Security & Compliance
          </span>
          <h2 className="text-3xl font-display font-bold text-white sm:text-4xl md:text-5xl">
            Enterprise Trust & Compliance
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/55 sm:text-lg">
            We adhere to the highest security standards and hold industry-recognized certifications.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center gap-4 rounded-3xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
            >
              <div
                className={cn(
                  "flex h-[128px] w-full items-center justify-center rounded-2xl border border-slate-200/70 px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)]",
                  badge.cardClassName,
                )}
              >
                <img
                  src={badge.src}
                  alt={badge.alt}
                  loading="lazy"
                  decoding="async"
                  className={cn("w-auto object-contain", badge.imageClassName)}
                />
              </div>
              <div className="text-center">
                <span className="block font-display text-sm font-semibold text-white sm:text-base">
                  {badge.label}
                </span>
                <span className="text-xs text-white/55 sm:text-sm">{badge.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityComplianceSection;
