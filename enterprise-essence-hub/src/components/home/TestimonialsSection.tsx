import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { useTestimonials } from "@/hooks/useCMSData";

const TestimonialsSection = () => {
  const { data: dbTestimonials, isLoading } = useTestimonials();

  if (!isLoading && (!dbTestimonials || dbTestimonials.length === 0)) return null;

  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(240,246,255,0.82),rgba(249,251,255,0.98))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Testimonials"
          title="Trusted by Engineering Leaders"
          description="Hear from the teams we've helped transform their cloud infrastructure."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {(dbTestimonials || []).map((t: any, i: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="home-panel p-7"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t.content}</p>
              <div className="flex gap-0.5 mt-4">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber text-amber" />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="font-display font-semibold text-sm text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}, {t.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
