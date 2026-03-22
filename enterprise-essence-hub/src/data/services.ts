export interface SubService {
  title: string;
  slug: string;
  description: string;
}

export interface ServiceCategory {
  title: string;
  slug: string;
  description: string;
  icon: string;
  subServices: SubService[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    title: "AWS Cloud Services",
    slug: "aws-cloud-services",
    description: "End-to-end AWS cloud solutions from consulting to managed services, migration, security, cost optimization, and modernization.",
    icon: "Cloud",
    subServices: [
      { title: "AWS Consulting Services", slug: "aws-consulting-services", description: "Expert AWS consulting for cloud architecture, landing zone design, and modernization strategy." },
      { title: "AWS Cloud Migration Services", slug: "aws-cloud-migration-services", description: "Structured migration of workloads to AWS with zero-downtime cutover strategies." },
      { title: "AWS Managed Services", slug: "aws-managed-services", description: "24/7 managed AWS operations with proactive monitoring and enterprise SLAs." },
      { title: "AWS Cost Optimization Services", slug: "aws-cost-optimization-services", description: "FinOps-driven cost governance, rightsizing, and continuous optimization." },
      { title: "AWS Cloud Security Services", slug: "aws-cloud-security-services", description: "IAM design, threat detection, encryption, and compliance alignment." },
      { title: "AWS Well-Architected Review", slug: "aws-well-architected-review", description: "Assessment against all six AWS Well-Architected Framework pillars." },
      { title: "AWS Data Lake & Warehouse Services", slug: "aws-data-lake-and-warehouse-services", description: "Scalable data platforms with S3, Redshift, Athena, and modern pipelines." },
      { title: "AWS Serverless & AI/ML Services", slug: "aws-serverless-and-ai-ml-services", description: "Event-driven architectures, serverless APIs, and machine learning solutions." },
    ],
  },
  {
    title: "Azure Cloud Services",
    slug: "azure-cloud-services",
    description: "Microsoft Azure expertise for consulting, migration, managed services, DevOps, security, and cost optimization.",
    icon: "Server",
    subServices: [
      { title: "Microsoft Azure Consulting Services", slug: "microsoft-azure-consulting-services", description: "Expert Azure consulting for enterprise cloud architecture and hybrid deployment." },
      { title: "Azure Cloud Migration Services", slug: "azure-cloud-migration-services", description: "Structured migration to Azure with minimal disruption and post-migration optimization." },
      { title: "Azure Managed Services", slug: "azure-managed-services", description: "24/7 managed Azure operations with monitoring, patching, and cost governance." },
      { title: "Azure DevOps Services", slug: "azure-devops-services", description: "CI/CD pipelines, release management, and infrastructure as code on Azure." },
      { title: "Azure Cost Optimization Services", slug: "azure-cost-optimization-services", description: "Rightsizing, hybrid benefit, and FinOps governance for Azure environments." },
      { title: "Azure Cloud Security Services", slug: "azure-cloud-security-services", description: "Zero-trust architecture, Defender, Sentinel, and compliance alignment." },
    ],
  },
  {
    title: "DevOps Consulting",
    slug: "devops-consulting",
    description: "Accelerate delivery with CI/CD, Infrastructure as Code, Kubernetes, DevSecOps, and container orchestration.",
    icon: "GitBranch",
    subServices: [
      { title: "DevOps Consulting Services", slug: "devops-consulting-services", description: "End-to-end DevOps transformation with CI/CD, automation, and culture enablement." },
      { title: "CI/CD Pipeline Automation", slug: "ci-cd-pipeline-automation", description: "Automated build, test, and deployment pipelines for faster releases." },
      { title: "Kubernetes Consulting Services", slug: "kubernetes-consulting-services", description: "Production-grade Kubernetes clusters on EKS, AKS, or self-managed." },
      { title: "Infrastructure as Code Services", slug: "infrastructure-as-code-services", description: "Terraform, Ansible, and CloudFormation for repeatable infrastructure." },
      { title: "DevSecOps Services", slug: "devsecops-services", description: "Security scanning, compliance checks, and security-first CI/CD pipelines." },
      { title: "Containerization & Orchestration Services", slug: "containerization-and-orchestration-services", description: "Docker containerization and Kubernetes orchestration at scale." },
    ],
  },
  {
    title: "Managed Cloud Services",
    slug: "managed-cloud-services",
    description: "Comprehensive managed infrastructure, monitoring, backup, disaster recovery, and cloud governance.",
    icon: "HardDrive",
    subServices: [
      { title: "Managed Infrastructure Services", slug: "managed-infrastructure-services", description: "24/7 managed infrastructure with monitoring and performance optimization." },
      { title: "Managed IT Infrastructure Services", slug: "managed-it-infrastructure-services", description: "End-to-end managed IT including servers, networking, and security." },
      { title: "24x7 Cloud Monitoring & Support", slug: "24x7-cloud-monitoring-and-support", description: "Round-the-clock cloud monitoring, alerting, and incident response." },
      { title: "Cloud Backup & Disaster Recovery", slug: "cloud-backup-and-disaster-recovery", description: "Automated backup, replication, and DR solutions for business continuity." },
      { title: "Cloud Operations & Governance", slug: "cloud-operations-and-governance", description: "Governance frameworks, cost controls, and operational excellence." },
    ],
  },
];
