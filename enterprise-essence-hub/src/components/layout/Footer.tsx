import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import {
  globalOffices,
  primaryContactMethods,
  salesEmail,
  toTelHref,
} from "@/data/contactInfo";
import { serviceCategories } from "@/data/services";
import { products } from "@/data/products";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/expert_cloud_consulting?igsh=NzEycjA5d2Yxb2h2", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Facebook, href: "https://www.facebook.com/share/1BoffVnXCj/", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/expertcloudconsulting/", label: "LinkedIn", color: "hover:bg-blue-700" },
  { icon: Youtube, href: "https://www.youtube.com/@expertcloudconsultingakagp3755", label: "YouTube", color: "hover:bg-red-600" },
];

const Footer = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <footer className="bg-navy text-white">
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-14">
          <h3 className="mb-8 flex items-center gap-2 font-display text-lg font-bold text-white">
            <MapPin className="h-5 w-5 text-primary" /> Global Offices
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {globalOffices.map((office) => (
              <div key={office.country} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 font-display text-sm font-semibold text-primary">{office.country}</h4>
                {office.lines.map((line, index) => (
                  <p key={index} className="text-xs leading-relaxed text-white/60">{line}</p>
                ))}
                {office.phone && (
                  <a href={toTelHref(office.phone)} className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 transition-colors hover:text-primary">
                    <Phone className="h-3 w-3" /> {office.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-3">
              <img
                src="/images/ecc-logo.png"
                alt="ECC Technologies"
                width="160"
                height="56"
                className="h-14 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/60">
              Enterprise cloud, DevOps, and AI solutions that accelerate digital transformation. AWS Advanced Tier Partner.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <a href={`mailto:${salesEmail}`} className="flex items-center gap-2 transition-colors hover:text-primary">
                <Mail className="h-4 w-4" /> {salesEmail}
              </a>
              {primaryContactMethods.map((contact) => (
                <a key={contact.label} href={toTelHref(contact.phone)} className="flex items-center gap-2 transition-colors hover:text-white">
                  <Phone className="h-4 w-4" /> {contact.label}: {contact.phone}
                </a>
              ))}
              <button
                type="button"
                onClick={() => openEnquiry({ interest: "consultation" })}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <MapPin className="h-4 w-4" /> Contact Us
              </button>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-white/80">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-200 hover:scale-110 ${color}`}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/80">Services</h4>
            <ul className="space-y-2">
              {serviceCategories.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className="text-sm text-white/50 transition-colors hover:text-white">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/80">Products</h4>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link to={`/products/${product.slug}`} className="text-sm text-white/50 transition-colors hover:text-white">
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-4 mt-6 font-display text-sm font-semibold uppercase tracking-wider text-white/80">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-white/50 transition-colors hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-white/50 transition-colors hover:text-white">Careers</Link></li>
              <li><Link to="/case-studies" className="text-sm text-white/50 transition-colors hover:text-white">Case Studies</Link></li>
              <li><Link to="/blog" className="text-sm text-white/50 transition-colors hover:text-white">Blog</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => openEnquiry({ interest: "consultation" })}
                  className="text-sm text-white/50 transition-colors hover:text-white"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white/80">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-white/50 transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-white/50 transition-colors hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/cookie-policy" className="text-sm text-white/50 transition-colors hover:text-white">Cookie Policy</Link></li>
            </ul>

            <div className="mt-6">
              <img
                src="/images/aws-partner-badge.png"
                alt="AWS Advanced Tier Services Partner"
                width="120"
                height="80"
                className="h-20 w-auto rounded-lg bg-white p-3 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="mt-6">
              <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-white/80">Security & Compliance</h4>
              <div className="flex flex-wrap gap-3">
                <img src="/images/soc2-badge.png" alt="SOC 2 Type II Certified" width="56" height="56" className="h-14 w-auto rounded-lg bg-white p-2 object-contain" loading="lazy" decoding="async" />
                <img src="/images/iso27001-badge.png" alt="ISO 27001 Certified" width="56" height="56" className="h-14 w-auto rounded-lg bg-white p-2 object-contain" loading="lazy" decoding="async" />
                <img src="/images/gdpr-badge.png" alt="GDPR Ready" width="56" height="56" className="h-14 w-auto rounded-lg bg-white p-2 object-contain" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 py-5 text-xs text-white/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} ECC Technologies (ASCP GPUonCLOUD Pvt Ltd). All rights reserved.</p>
          <p className="mt-2 md:mt-0">Enterprise Cloud | DevOps | AI Solutions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
