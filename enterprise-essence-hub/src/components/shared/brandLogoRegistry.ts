import type { SimpleIcon } from "simple-icons";
import {
  siAnsible,
  siApache,
  siArgo,
  siChef,
  siCircleci,
  siCloudflare,
  siDatadog,
  siDigitalocean,
  siDocker,
  siElasticsearch,
  siGithub,
  siGithubactions,
  siGitlab,
  siGooglecloud,
  siGrafana,
  siHelm,
  siIstio,
  siJenkins,
  siKubernetes,
  siMongodb,
  siMysql,
  siNewrelic,
  siNginx,
  siPostgresql,
  siPrometheus,
  siPulumi,
  siRancher,
  siRedis,
  siTerraform,
  siTraefikproxy,
} from "simple-icons";
import awsLogo from "@/assets/brand-logos/aws.svg";
import azureLogo from "@/assets/brand-logos/azure.svg";
import haproxyLogo from "@/assets/brand-logos/haproxy.png";

type SvgLogoDefinition = {
  type: "svg";
  icon: SimpleIcon;
};

type AssetLogoDefinition = {
  type: "asset";
  src: string;
};

export type LogoDefinition = SvgLogoDefinition | AssetLogoDefinition;

export const brandLogoMap = {
  ansible: { type: "svg", icon: siAnsible },
  apache: { type: "svg", icon: siApache },
  argocd: { type: "svg", icon: siArgo },
  aws: { type: "asset", src: awsLogo },
  azure: { type: "asset", src: azureLogo },
  chef: { type: "svg", icon: siChef },
  circleci: { type: "svg", icon: siCircleci },
  cloudflare: { type: "svg", icon: siCloudflare },
  cloudformation: { type: "asset", src: awsLogo },
  datadog: { type: "svg", icon: siDatadog },
  digitalocean: { type: "svg", icon: siDigitalocean },
  docker: { type: "svg", icon: siDocker },
  dynamodb: { type: "asset", src: awsLogo },
  elk: { type: "svg", icon: siElasticsearch },
  github: { type: "svg", icon: siGithub },
  githubactions: { type: "svg", icon: siGithubactions },
  gitlab: { type: "svg", icon: siGitlab },
  googlecloud: { type: "svg", icon: siGooglecloud },
  grafana: { type: "svg", icon: siGrafana },
  haproxy: { type: "asset", src: haproxyLogo },
  helm: { type: "svg", icon: siHelm },
  istio: { type: "svg", icon: siIstio },
  jenkins: { type: "svg", icon: siJenkins },
  kubernetes: { type: "svg", icon: siKubernetes },
  mongodb: { type: "svg", icon: siMongodb },
  mysql: { type: "svg", icon: siMysql },
  newrelic: { type: "svg", icon: siNewrelic },
  nginx: { type: "svg", icon: siNginx },
  postgresql: { type: "svg", icon: siPostgresql },
  prometheus: { type: "svg", icon: siPrometheus },
  pulumi: { type: "svg", icon: siPulumi },
  rancher: { type: "svg", icon: siRancher },
  redis: { type: "svg", icon: siRedis },
  terraform: { type: "svg", icon: siTerraform },
  traefik: { type: "svg", icon: siTraefikproxy },
} satisfies Record<string, LogoDefinition>;

export type BrandLogoKey = keyof typeof brandLogoMap;

export function hasBrandLogo(key: string): key is BrandLogoKey {
  return key in brandLogoMap;
}
