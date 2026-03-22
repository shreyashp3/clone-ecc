export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  externalUrl: string;
  features: string[];
  benefits: string[];
  color: string;
}

export const products: Product[] = [
  {
    id: "ai-cloud-insights",
    name: "AI Cloud Insights",
    slug: "ai-cloud-insights",
    tagline: "AI-Powered Cloud Intelligence",
    description:
      "Real-time AI-driven insights for cloud infrastructure optimization, cost management, and security compliance across multi-cloud environments.",
    externalUrl: "https://aicloudinsights.ai/",
    features: [
      "Real-time cloud cost analytics",
      "AI-powered anomaly detection",
      "Multi-cloud dashboard",
      "Automated compliance reporting",
      "Resource right-sizing recommendations",
      "Predictive capacity planning",
    ],
    benefits: [
      "Reduce cloud costs by up to 40%",
      "Detect security threats in real-time",
      "Unified view across AWS, Azure, GCP",
      "Automate compliance workflows",
    ],
    color: "electric",
  },
  {
    id: "gpu-on-cloud",
    name: "GPU on Cloud",
    slug: "gpu-on-cloud",
    tagline: "High-Performance GPU Computing",
    description:
      "On-demand GPU infrastructure for AI/ML training, rendering, and high-performance computing workloads at scale.",
    externalUrl: "https://gpuoncloud.com/",
    features: [
      "NVIDIA A100 & H100 GPUs",
      "Auto-scaling GPU clusters",
      "Pre-configured ML environments",
      "Low-latency global deployment",
      "Pay-per-second billing",
      "Jupyter & VS Code integration",
    ],
    benefits: [
      "Launch GPU instances in seconds",
      "Save 60% vs. major cloud providers",
      "Scale from 1 to 1000+ GPUs",
      "No long-term commitments",
    ],
    color: "purple",
  },
  {
    id: "ticketly",
    name: "Ticketly Support",
    slug: "ticketly",
    tagline: "Modern IT Service Management",
    description:
      "AI-enhanced helpdesk and ticketing platform for IT teams. Streamline support operations with intelligent routing and automation.",
    externalUrl: "https://ticketly.support/",
    features: [
      "AI ticket classification & routing",
      "SLA tracking & automation",
      "Multi-channel support (email, chat, portal)",
      "Knowledge base builder",
      "Asset management integration",
      "Custom workflow engine",
    ],
    benefits: [
      "Resolve tickets 50% faster",
      "Automate repetitive support tasks",
      "Improve customer satisfaction scores",
      "Full visibility into support metrics",
    ],
    color: "teal",
  },
];
