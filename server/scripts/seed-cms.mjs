import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "ai-cloud-insights",
    name: "AI Cloud Insights",
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
    slug: "gpu-on-cloud",
    name: "GPU on Cloud",
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
    slug: "ticketly",
    name: "Ticketly Support",
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

const serviceCategories = [
  {
    title: "AWS Cloud Services",
    slug: "aws-cloud-services",
    description:
      "End-to-end AWS cloud solutions from consulting to managed services, migration, security, cost optimization, and modernization.",
    icon: "Cloud",
    subServices: [
      {
        title: "AWS Consulting Services",
        slug: "aws-consulting-services",
        description:
          "Expert AWS consulting for cloud architecture, landing zone design, and modernization strategy.",
      },
      {
        title: "AWS Cloud Migration Services",
        slug: "aws-cloud-migration-services",
        description:
          "Structured migration of workloads to AWS with zero-downtime cutover strategies.",
      },
      {
        title: "AWS Managed Services",
        slug: "aws-managed-services",
        description:
          "24/7 managed AWS operations with proactive monitoring and enterprise SLAs.",
      },
      {
        title: "AWS Cost Optimization Services",
        slug: "aws-cost-optimization-services",
        description: "FinOps-driven cost governance, rightsizing, and continuous optimization.",
      },
      {
        title: "AWS Cloud Security Services",
        slug: "aws-cloud-security-services",
        description: "IAM design, threat detection, encryption, and compliance alignment.",
      },
      {
        title: "AWS Well-Architected Review",
        slug: "aws-well-architected-review",
        description: "Assessment against all six AWS Well-Architected Framework pillars.",
      },
      {
        title: "AWS Data Lake & Warehouse Services",
        slug: "aws-data-lake-and-warehouse-services",
        description:
          "Scalable data platforms with S3, Redshift, Athena, and modern pipelines.",
      },
      {
        title: "AWS Serverless & AI/ML Services",
        slug: "aws-serverless-and-ai-ml-services",
        description:
          "Event-driven architectures, serverless APIs, and machine learning solutions.",
      },
    ],
  },
  {
    title: "Azure Cloud Services",
    slug: "azure-cloud-services",
    description:
      "Microsoft Azure expertise for consulting, migration, managed services, DevOps, security, and cost optimization.",
    icon: "Server",
    subServices: [
      {
        title: "Microsoft Azure Consulting Services",
        slug: "microsoft-azure-consulting-services",
        description:
          "Expert Azure consulting for enterprise cloud architecture and hybrid deployment.",
      },
      {
        title: "Azure Cloud Migration Services",
        slug: "azure-cloud-migration-services",
        description:
          "Structured migration to Azure with minimal disruption and post-migration optimization.",
      },
      {
        title: "Azure Managed Services",
        slug: "azure-managed-services",
        description:
          "24/7 managed Azure operations with monitoring, patching, and cost governance.",
      },
      {
        title: "Azure DevOps Services",
        slug: "azure-devops-services",
        description: "CI/CD pipelines, release management, and infrastructure as code on Azure.",
      },
      {
        title: "Azure Cost Optimization Services",
        slug: "azure-cost-optimization-services",
        description: "Rightsizing, hybrid benefit, and FinOps governance for Azure environments.",
      },
      {
        title: "Azure Cloud Security Services",
        slug: "azure-cloud-security-services",
        description: "Zero-trust architecture, Defender, Sentinel, and compliance alignment.",
      },
    ],
  },
  {
    title: "DevOps Consulting",
    slug: "devops-consulting",
    description:
      "Accelerate delivery with CI/CD, Infrastructure as Code, Kubernetes, DevSecOps, and container orchestration.",
    icon: "GitBranch",
    subServices: [
      {
        title: "DevOps Consulting Services",
        slug: "devops-consulting-services",
        description:
          "End-to-end DevOps transformation with CI/CD, automation, and culture enablement.",
      },
      {
        title: "CI/CD Pipeline Automation",
        slug: "ci-cd-pipeline-automation",
        description: "Automated build, test, and deployment pipelines for faster releases.",
      },
      {
        title: "Kubernetes Consulting Services",
        slug: "kubernetes-consulting-services",
        description: "Production-grade Kubernetes clusters on EKS, AKS, or self-managed.",
      },
      {
        title: "Infrastructure as Code Services",
        slug: "infrastructure-as-code-services",
        description: "Terraform, Ansible, and CloudFormation for repeatable infrastructure.",
      },
      {
        title: "DevSecOps Services",
        slug: "devsecops-services",
        description: "Security scanning, compliance checks, and security-first CI/CD pipelines.",
      },
      {
        title: "Containerization & Orchestration Services",
        slug: "containerization-and-orchestration-services",
        description: "Docker containerization and Kubernetes orchestration at scale.",
      },
    ],
  },
  {
    title: "Managed Cloud Services",
    slug: "managed-cloud-services",
    description:
      "Comprehensive managed infrastructure, monitoring, backup, disaster recovery, and cloud governance.",
    icon: "HardDrive",
    subServices: [
      {
        title: "Managed Infrastructure Services",
        slug: "managed-infrastructure-services",
        description: "24/7 managed infrastructure with monitoring and performance optimization.",
      },
      {
        title: "Managed IT Infrastructure Services",
        slug: "managed-it-infrastructure-services",
        description: "End-to-end managed IT including servers, networking, and security.",
      },
      {
        title: "24x7 Cloud Monitoring & Support",
        slug: "24x7-cloud-monitoring-and-support",
        description: "Round-the-clock cloud monitoring, alerting, and incident response.",
      },
      {
        title: "Cloud Backup & Disaster Recovery",
        slug: "cloud-backup-and-disaster-recovery",
        description:
          "Automated backup, replication, and DR solutions for business continuity.",
      },
      {
        title: "Cloud Operations & Governance",
        slug: "cloud-operations-and-governance",
        description: "Governance frameworks, cost controls, and operational excellence.",
      },
    ],
  },
];

async function seedProducts() {
  let created = 0;
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        externalUrl: product.externalUrl,
        features: product.features,
        benefits: product.benefits,
        color: product.color,
        sortOrder: i + 1,
        isPublished: true,
      },
    });
    created += 1;
  }
  return created;
}

async function seedServices() {
  let created = 0;
  let sortOrder = 0;
  for (const category of serviceCategories) {
    for (const subService of category.subServices) {
      sortOrder += 1;
      const existing = await prisma.service.findUnique({ where: { slug: subService.slug } });
      if (existing) continue;
      await prisma.service.create({
        data: {
          title: subService.title,
          slug: subService.slug,
          description: subService.description,
          categoryName: category.title,
          categorySlug: category.slug,
          icon: category.icon,
          sortOrder,
          isPublished: true,
        },
      });
      created += 1;
    }
  }
  return created;
}

async function main() {
  const createdProducts = await seedProducts();
  const createdServices = await seedServices();

  console.log(`Seeded ${createdProducts} products and ${createdServices} services.`);
}

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
