import SEOHead from "@/components/shared/SEOHead";
import ContactFormSection from "@/components/home/ContactFormSection";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  globalOffices,
  primaryContactMethods,
  salesEmail,
  toTelHref,
} from "@/data/contactInfo";
import { pageHeroImages } from "@/data/pageHeroImages";

const Contact = () => {
  return (
    <>
      <SEOHead
        title="Contact ECC Technologies | Cloud & DevOps Experts"
        description="Talk with ECC Technologies about cloud consulting, DevOps automation, managed services, or product demos."
        canonical="/contact"
      />

      <section className="relative overflow-hidden bg-hero py-20 lg:py-28">
        <div className="absolute inset-0 hero-aurora opacity-70" aria-hidden="true" />
        <div className="absolute -top-32 right-[6%] h-[360px] w-[360px] rounded-full bg-primary/20 blur-[120px]" aria-hidden="true" />
        <div className="absolute -bottom-24 left-[4%] h-[320px] w-[320px] rounded-full bg-teal/20 blur-[110px]" aria-hidden="true" />
        <PageHeroBackdrop src={pageHeroImages.contact.src} position={pageHeroImages.contact.position} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-display font-bold text-white md:text-5xl">Get In Touch</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
              Ready to transform your infrastructure? Our team is here to help.
            </p>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <a
              href={`mailto:${salesEmail}`}
              className="group relative block overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.8)] backdrop-blur transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/15"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="mb-1 text-xs text-white/40">Email</div>
              <div className="text-sm font-medium text-white/80">{salesEmail}</div>
            </a>
            {primaryContactMethods.map((contact) => (
              <a
                key={contact.label}
                href={toTelHref(contact.phone)}
                className="group relative block overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.8)] backdrop-blur transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/15"
              >
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="mb-1 text-xs text-white/40">{contact.label}</div>
                <div className="text-sm font-medium text-white/80">{contact.phone}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(248,250,255,0.96),rgba(236,243,255,0.88))] py-16">
        <div className="absolute inset-0 hero-grid opacity-10" aria-hidden="true" />
        <div className="absolute -top-24 right-[12%] h-[240px] w-[240px] rounded-full bg-primary/10 blur-[90px]" aria-hidden="true" />
        <div className="absolute -bottom-24 left-[8%] h-[220px] w-[220px] rounded-full bg-teal/10 blur-[90px]" aria-hidden="true" />
        <div className="container mx-auto px-4">
          <h2 className="mb-10 flex items-center justify-center gap-2 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
            <MapPin className="h-6 w-6 text-primary" /> Global Offices
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {globalOffices.map((office) => (
              <div key={office.country} className="home-panel group rounded-2xl p-6 text-center sm:text-left">
                <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">{office.country}</h3>
                </div>
                {office.lines.map((line, index) => (
                  <p key={index} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
                ))}
                {office.phone && (
                  <a href={toTelHref(office.phone)} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {office.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactFormSection />
    </>
  );
};

export default Contact;
