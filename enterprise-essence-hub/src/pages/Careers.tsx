import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Briefcase, MapPin, Clock, Users, Heart, Zap, Globe,
  Building2, GraduationCap, Rocket, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/shared/SEOHead";
import SectionHeading from "@/components/shared/SectionHeading";
import PageHeroBackdrop from "@/components/shared/PageHeroBackdrop";
import { pageHeroImages } from "@/data/pageHeroImages";
import { cms } from "@/integrations/api/client";
import { useQuickEnquiry } from "@/components/shared/QuickEnquiryContext";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const benefits = [
  { icon: Rocket, title: "Career Growth", description: "Clear growth paths with mentorship, certifications, and leadership opportunities." },
  { icon: GraduationCap, title: "Learning & Development", description: "Sponsored AWS, Azure, Kubernetes certifications and conference attendance." },
  { icon: Globe, title: "Remote-First Culture", description: "Work from anywhere with flexible schedules and async-friendly workflows." },
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health insurance, wellness programs, and mental health support." },
  { icon: Users, title: "Collaborative Team", description: "Work alongside certified cloud architects and DevOps engineers globally." },
  { icon: Zap, title: "Cutting-Edge Tech", description: "Hands-on with AWS, Azure, Kubernetes, Terraform, and AI/ML platforms." },
];

const values = [
  { title: "Customer Success", description: "Every project is a partnership — your success is our success." },
  { title: "Innovation", description: "We continuously push boundaries with emerging cloud and DevOps technologies." },
  { title: "Transparency", description: "Open communication, honest timelines, and full visibility in everything we do." },
  { title: "Engineering Excellence", description: "We take pride in writing clean, scalable, production-ready infrastructure." },
];

interface Job {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  summary: string | null;
  slug: string;
}

const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { openEnquiry } = useQuickEnquiry();

  useEffect(() => {
    const fetchJobs = async () => {
      const data = await cms.careers.getAll();
      setJobs((data as any[]) || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <>
      <SEOHead
        title="Careers at ECC Technologies | Join Our Cloud & DevOps Team"
        description="Join ECC Technologies and build your career in cloud computing, DevOps, and AI. Explore open positions across our global offices."
        canonical="/careers"
      />

      {/* Hero */}
      <section className="relative bg-hero overflow-hidden py-24 lg:py-32">
        <PageHeroBackdrop src={pageHeroImages.careers.src} position={pageHeroImages.careers.position} />
        <div className="absolute top-10 right-[10%] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-10 left-[5%] w-[300px] h-[300px] rounded-full bg-teal/10 blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 text-xs font-display font-medium uppercase tracking-widest rounded-full bg-white/10 text-white/80 mb-6 border border-white/10">Careers</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
              Build the Future of <span className="text-gradient">Cloud Computing</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Join a global team of cloud architects, DevOps engineers, and technology leaders building enterprise-grade infrastructure for the world's most ambitious companies.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-14 font-semibold text-white" asChild>
                <a href="#openings">View Open Positions <ArrowRight className="w-5 h-5 ml-1" /></a>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 text-base sm:text-lg h-13 sm:h-14 font-semibold" asChild>
                <Link to="/about">Learn About Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Why Join Us" title="Why ECC Technologies?" description="We're building a company where engineers thrive — with meaningful work, global impact, and a culture that values growth." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-lg">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-20 lg:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeading badge="Our Culture" title="Engineering-Led, People-First" description="We foster a culture of ownership, continuous learning, and transparent collaboration." dark />
          <div className="mt-14 grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={v.title} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10">
                  <h3 className="font-display font-semibold text-white text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{v.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20 lg:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <SectionHeading badge="Open Positions" title="Current Openings" description="Explore our open roles and find where you fit in our growing team." />
          <div className="mt-14 max-w-4xl mx-auto space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading positions...</div>
            ) : jobs.length === 0 ? (
              <motion.div {...fadeUp} className="text-center py-16 px-6 rounded-2xl border border-border bg-card">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Open Positions Right Now</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're always looking for talented engineers. Send your resume and we'll reach out when a matching role opens up.
                </p>
                <Button className="mt-6 bg-gradient-electric hover:opacity-90 text-white" asChild>
                  <a href="mailto:careers@expertcloudconsulting.in">Send Your Resume <ArrowRight className="w-4 h-4 ml-1" /></a>
                </Button>
              </motion.div>
            ) : (
              jobs.map((job, i) => (
                <motion.div key={job.id} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <Link
                    to={`/careers/${job.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                      {job.summary && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{job.summary}</p>}
                      <div className="mt-3 flex flex-wrap gap-3">
                        {job.department && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" /> {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {job.employment_type && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {job.employment_type}
                          </span>
                        )}
                        {job.experience_level && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <GraduationCap className="w-3 h-3" /> {job.experience_level}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-3 sm:mt-0 shrink-0" />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-teal blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Don't See a Perfect Fit?
            </h2>
            <p className="mt-5 text-lg text-white/55 max-w-xl mx-auto">
              We're always looking for exceptional cloud and DevOps engineers. Send us your resume and we'll keep you in mind for future openings.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-base sm:text-lg px-8 sm:px-10 h-13 sm:h-14 font-semibold text-white" asChild>
                <a href="mailto:careers@expertcloudconsulting.in">
                  Send Resume <ArrowRight className="w-5 h-5 ml-1" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 text-base sm:text-lg h-13 sm:h-14 font-semibold"
                onClick={() => openEnquiry({ interest: "other", message: "Career opportunity enquiry" })}
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Careers;
