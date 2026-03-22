import SEOHead from "@/components/shared/SEOHead";
import SectionHeading from "@/components/shared/SectionHeading";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { pageHeroImages } from "@/data/pageHeroImages";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";
import {
  ArrowRight, MessageSquare, Briefcase, Users, Clock, Wrench,
  Cloud, Shield, Zap, Globe, Eye, Heart, Lightbulb, Move, Search, ThumbsUp,
  Server, Settings, DollarSign, Headphones
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stats = [
  { icon: Briefcase, value: "200+", label: "Successful Projects" },
  { icon: Users, value: "50+", label: "Satisfied Clients" },
  { icon: Clock, value: "60+", label: "Years of Total Experience" },
  { icon: Wrench, value: "50+", label: "DevOps Tools Expertise" },
];

const cintsValues = [
  { letter: "C", title: "Customer Success", description: "We believe in Customer Success is our Success.", icon: Heart, color: "hsl(var(--amber))" },
  { letter: "I", title: "Innovative", description: "We are committed to catering to technological hunger in us, by continuously upgrading and innovating.", icon: Lightbulb, color: "hsl(142 71% 45%)" },
  { letter: "N", title: "Nimble", description: "We are committed to be agile and flexible to deliver the best.", icon: Move, color: "hsl(var(--electric))" },
  { letter: "T", title: "Transparent", description: "We believe in being transparent is being trustworthy.", icon: Search, color: "hsl(var(--teal))" },
  { letter: "S", title: "Sincere", description: "We earnestly commit to go extra mile in what we do.", icon: ThumbsUp, color: "hsl(var(--purple))" },
];

const whyChoose = [
  { icon: Cloud, title: "Multi-Cloud & DevOps Expertise", description: "Deep proficiency across AWS, Azure, Kubernetes, Terraform, and modern DevOps toolchains." },
  { icon: Server, title: "Enterprise-Grade Architecture", description: "Production-proven designs for high availability, resilience, and regulatory compliance." },
  { icon: Zap, title: "Automation-First Delivery", description: "Infrastructure as Code, CI/CD pipelines, and GitOps workflows from day one." },
  { icon: Eye, title: "Transparent Engagement Model", description: "Clear communication, honest timelines, and full visibility into every engagement." },
  { icon: DollarSign, title: "Cost-Conscious Cloud Strategy", description: "FinOps-driven approach to rightsizing, reserved capacity, and continuous cost optimization." },
  { icon: Headphones, title: "Global Delivery & Support", description: "Distributed teams across multiple time zones with 24x7 managed operations capability." },
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECC Technologies",
  url: "https://ecctechnologies.ai",
  logo: "https://ecctechnologies.ai/images/ecc-logo.png",
  description: "ECC Technologies is a global cloud, DevOps, and managed services company focused on secure architecture, automation, transparency, and business value through next-generation technology.",
  sameAs: [
    "https://www.linkedin.com/company/expertcloudconsulting/",
    "https://www.youtube.com/@expertcloudconsultingakagp3755"
  ],
};

const About = () => {
  const { openEnquiry } = useQuickEnquiry();

  return (
    <>
      <SEOHead
        title="About ECC Technologies | Cloud, DevOps & Managed Services Experts"
        description="Learn about ECC Technologies, a global cloud, DevOps, and managed services company focused on secure architecture, automation, transparency, and business value through next-generation technology."
        canonical="/about"
        schema={organizationSchema}
      />

      {/* ── Hero ── */}
      <section className="relative bg-hero overflow-hidden py-24 lg:py-32">
        <PageHeroBackdrop src={pageHeroImages.about.src} position={pageHeroImages.about.position} />
        <div className="absolute top-10 right-[10%] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-10 left-[5%] w-[300px] h-[300px] rounded-full bg-teal/10 blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-6 border border-white/10">About Us</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
              About <span className="text-gradient">ECC Technologies</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              A global cloud, DevOps, AI, and managed services company delivering enterprise-grade architecture, automation, and digital transformation with engineering precision and transparent execution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-14 font-semibold text-white" asChild>
                <Link to="/services">Explore Services <ArrowRight className="w-5 h-5 ml-1" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 text-base sm:text-lg h-13 sm:h-14 font-semibold"
                onClick={() => openEnquiry({ interest: "consultation" })}
              >
                <MessageSquare className="w-5 h-5 mr-1" /> Contact Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Company Overview ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
            <SectionHeading badge="Who We Are" title="Engineering Cloud Excellence at Scale" />
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              ECC Technologies is a global cloud consulting and DevOps engineering partner helping enterprises architect, migrate, secure, and manage modern cloud infrastructure. We specialize in AWS, Azure, DevOps automation, managed cloud operations, FinOps, cloud security, and platform modernization — delivering measurable business outcomes with an engineering-first mindset.
            </p>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              With distributed delivery capabilities across multiple geographies, we serve startups, mid-market companies, and large enterprises across regulated and high-growth industries. Our approach combines deep technical expertise with a customer-first engagement model — ensuring every solution is built for scalability, resilience, and operational excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission / Purpose / Value Prop ── */}
      <section className="py-20 lg:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { badge: "Company Mission", title: "Unleash Next Generation Technology", text: "For modern yet simplified use, transparent pricing, and value addition to individuals, communities, and corporates." },
              { badge: "Core Purpose", title: "Transform & Simplify", text: "Transform & Simplify human lifestyle by leveraging next generation compute." },
              { badge: "Value Proposition", title: "Unlocking Agility & Efficiency", text: "Unlocking Agility and Efficiency Through Cloud and DevOps Excellence." },
            ].map((item, i) => (
              <motion.div
                key={item.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
              >
                <span className="inline-block px-3 py-1 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-primary/20 text-primary mb-4">{item.badge}</span>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-base text-white/60 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CINTS Core Values ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-6">
            <SectionHeading badge="Our Core Values" title="C I N T S" description="Our Core Values C I N T S help us remain focused on our Core Purpose — aligning us to deliver with integrity, agility, and relentless customer focus." />
          </motion.div>

          <div className="mt-14 grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative p-4 rounded-3xl bg-card border border-border shadow-lg max-w-md w-full">
                <img
                  src="/images/cints-framework.png"
                  alt="ECC Technologies CINTS Core Values Framework — Customer Success, Innovative, Nimble, Transparent, Sincere"
                  className="w-full h-auto rounded-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>

            {/* Value Cards */}
            <div className="grid gap-4">
              {cintsValues.map((v, i) => (
                <motion.div
                  key={v.letter}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${v.color}15` }}>
                    <v.icon className="w-6 h-6" style={{ color: v.color }} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg text-foreground">
                      <span className="font-bold" style={{ color: v.color }}>{v.letter}</span> — {v.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{v.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ECC Technologies ── */}
      <section className="py-20 lg:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Why ECC Technologies" title="Why Clients Trust ECC Technologies" description="Engineering-led execution, transparent engagement, and measurable cloud outcomes." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Presence ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
            <SectionHeading badge="Global Delivery" title="Distributed Engineering. Global Reach." />
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              ECC Technologies operates across multiple time zones with distributed engineering teams delivering cloud consulting, DevOps transformation, and managed operations to startups, enterprises, and regulated industries worldwide. Our scalable delivery model ensures consistent quality, rapid execution, and round-the-clock support capability.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {["India", "United States", "United Kingdom", "UAE", "Saudi Arabia"].map((loc) => (
                <span key={loc} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-display font-medium text-foreground">
                  <Globe className="w-4 h-4 text-primary" /> {loc}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-28 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Ready to Build Secure, Scalable Cloud Solutions with ECC Technologies?
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-white/55">
              Get a free consultation from our team of certified cloud architects and DevOps engineers. No obligations — just actionable insights.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-14 font-semibold text-white" asChild>
                <Link to="/services">Explore Services <ArrowRight className="w-5 h-5 ml-1" /></Link>
              </Button>
              <Button
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20 border border-white/20 text-base sm:text-lg h-13 sm:h-14 font-semibold"
                onClick={() => openEnquiry({ interest: "consultation" })}
              >
                <MessageSquare className="w-5 h-5 mr-1" /> Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
