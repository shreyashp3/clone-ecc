import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { globalOffices, toTelHref } from "@/data/contactInfo";

const GlobalPresenceSection = () => {
  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(247,250,255,0.96),rgba(240,246,255,0.72))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Global Presence"
          title="Offices Across 5 Countries"
          description="We deliver follow-the-sun support from offices in India, US, UK, UAE, and Germany."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {globalOffices.map((office, index) => (
            <motion.div
              key={office.country}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="home-panel p-6 sm:p-7"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{office.country}</h3>
                  <span className="text-xs text-muted-foreground">{office.city}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{office.address}</p>
              {office.phone && (
                <div className="mt-3 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <a href={toTelHref(office.phone)} className="text-sm text-primary hover:underline">{office.phone}</a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalPresenceSection;
