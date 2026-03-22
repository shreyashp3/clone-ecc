import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import {
  Stack,
  ShieldCheckered,
  Gear,
  Trophy,
  Globe,
  Package,
} from "phosphor-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { PremiumIcon } from "@/components/shared/PremiumIcon";
import BrandLogo from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

type VisualKey =
  | "multiCloud"
  | "security"
  | "automation"
  | "certified"
  | "global"
  | "ecosystem";

const cards = [
  {
    icon: Stack,
    title: "Tailored Multi-Cloud Solutions",
    desc: "Custom architecture for AWS and Azure â€” never one-size-fits-all.",
    visual: "multiCloud" as const,
  },
  {
    icon: ShieldCheckered,
    title: "Enterprise-Grade Security",
    desc: "SOC 2, ISO 27001, GDPR compliant practices baked into every solution.",
    visual: "security" as const,
  },
  {
    icon: Gear,
    title: "Automation-First Delivery",
    desc: "100% IaC, CI/CD pipelines, and GitOps from day one.",
    visual: "automation" as const,
  },
  {
    icon: Trophy,
    title: "Certified Cloud & DevOps Experts",
    desc: "Team certified in AWS, Azure, Kubernetes, Terraform, and more.",
    visual: "certified" as const,
  },
  {
    icon: Globe,
    title: "Global Presence & Support",
    desc: "Offices in 5 countries with 24/7 follow-the-sun support.",
    visual: "global" as const,
  },
  {
    icon: Package,
    title: "Product + Services Ecosystem",
    desc: "Purpose-built SaaS products complement our consulting services.",
    visual: "ecosystem" as const,
  },
];

function VisualShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LogoTile({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-14 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/92 px-4 py-3 shadow-[0_14px_35px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BadgeTile({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-20 items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-3 py-2 shadow-[0_14px_35px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn("max-h-full w-auto object-contain", imageClassName)}
      />
    </div>
  );
}

function DifferentiatorVisual({ visual }: { visual: VisualKey }) {
  switch (visual) {
    case "multiCloud":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(140deg,_#f8fbff,_#eef4ff_42%,_#f8fafc_100%)]">
          <div className="grid w-full grid-cols-2 gap-3 p-5">
            <LogoTile>
              <BrandLogo logoKey="aws" name="AWS" className="h-9" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="azure" name="Azure" className="h-9" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="googlecloud" name="Google Cloud" className="h-8" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="digitalocean" name="DigitalOcean" className="h-8" />
            </LogoTile>
          </div>
        </VisualShell>
      );
    case "security":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_top_right,_rgba(234,179,8,0.18),_transparent_35%),linear-gradient(145deg,_#f9fafb,_#eef2ff_45%,_#f8fafc_100%)]">
          <div className="grid w-full grid-cols-3 gap-3 p-5">
            <BadgeTile src="/images/soc2-badge.png" alt="SOC 2 Type II Certified" imageClassName="max-h-12" />
            <BadgeTile src="/images/iso27001-badge.png" alt="ISO 27001 Certified" imageClassName="max-h-14" />
            <BadgeTile src="/images/gdpr-badge.png" alt="GDPR Ready" imageClassName="max-h-12" />
          </div>
        </VisualShell>
      );
    case "automation":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(145deg,_#eff6ff,_#eef2ff_52%,_#f8fafc_100%)]">
          <div className="grid w-full grid-cols-2 gap-3 p-5">
            <LogoTile>
              <BrandLogo logoKey="terraform" name="Terraform" className="h-8" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="githubactions" name="GitHub Actions" className="h-8" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="argocd" name="ArgoCD" className="h-8" />
            </LogoTile>
            <LogoTile>
              <BrandLogo logoKey="kubernetes" name="Kubernetes" className="h-9" />
            </LogoTile>
          </div>
        </VisualShell>
      );
    case "certified":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_32%),linear-gradient(150deg,_#fffdf6,_#f8fafc_48%,_#eff6ff_100%)]">
          <div className="flex w-full flex-col gap-3 p-5">
            <BadgeTile
              src="/images/aws-partner-badge.png"
              alt="AWS Advanced Tier Services Partner"
              className="h-[84px] justify-start px-4"
              imageClassName="max-h-16"
            />
            <div className="grid grid-cols-3 gap-3">
              <LogoTile className="h-12 px-2">
                <BrandLogo logoKey="azure" name="Azure" className="h-7" />
              </LogoTile>
              <LogoTile className="h-12 px-2">
                <BrandLogo logoKey="kubernetes" name="Kubernetes" className="h-7" />
              </LogoTile>
              <LogoTile className="h-12 px-2">
                <BrandLogo logoKey="terraform" name="Terraform" className="h-7" />
              </LogoTile>
            </div>
          </div>
        </VisualShell>
      );
    case "global":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.16),_transparent_40%),linear-gradient(140deg,_#eff6ff,_#f8fafc_50%,_#eef2ff_100%)]">
          <div className="absolute inset-5 rounded-[28px] border border-white/70 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />
          <div className="absolute left-[18%] top-[38%] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow-lg">
            <MapPin className="h-2.5 w-2.5" />
          </div>
          <div className="absolute left-[30%] top-[28%] flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg">
            <MapPin className="h-2.5 w-2.5" />
          </div>
          <div className="absolute left-[48%] top-[42%] flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
            <MapPin className="h-2.5 w-2.5" />
          </div>
          <div className="absolute left-[63%] top-[34%] flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <MapPin className="h-2.5 w-2.5" />
          </div>
          <div className="absolute left-[73%] top-[40%] flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg">
            <MapPin className="h-2.5 w-2.5" />
          </div>
          <div className="absolute inset-x-10 bottom-9 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="absolute inset-x-16 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
          <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4),_transparent_62%)]" />
        </VisualShell>
      );
    case "ecosystem":
      return (
        <VisualShell className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_38%),linear-gradient(145deg,_#f8fafc,_#eef2ff_46%,_#f8fafc_100%)]">
          <div className="grid w-full grid-cols-3 gap-3 p-5">
            <LogoTile className="h-[72px]">
                <img
                  src="/images/ai-cloud-insights-logo.png"
                  alt="AI Cloud Insights"
                  loading="lazy"
                  decoding="async"
                  className="max-h-12 w-auto object-contain"
                />
            </LogoTile>
            <LogoTile className="h-[72px] bg-slate-950">
                <img
                  src="/images/gpuoncloud-logo.png"
                  alt="GPU on Cloud"
                  loading="lazy"
                  decoding="async"
                  className="max-h-8 w-auto object-contain"
                />
            </LogoTile>
            <LogoTile className="h-[72px]">
                <img
                  src="/images/ticketly-logo.jpg"
                  alt="Ticketly"
                  loading="lazy"
                  decoding="async"
                  className="max-h-12 w-auto object-contain"
                />
            </LogoTile>
          </div>
        </VisualShell>
      );
  }
}

const DifferentiatorsSection = () => {
  return (
    <section className="home-section bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(240,246,255,0.76))]">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Why Choose ECC Technologies"
          title="What Sets Us Apart"
          description="Enterprise trust, global delivery, and deep technical expertise in every engagement."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="home-panel group"
            >
              <DifferentiatorVisual visual={card.visual} />

              <div className="p-6 sm:p-8">
                <div className="mb-4">
                  <PremiumIcon
                    icon={<card.icon weight="duotone" size={24} />}
                    size="lg"
                    gradient
                    color="primary"
                    animated
                  />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;
