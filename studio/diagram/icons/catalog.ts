// Icon packs for the diagram palette. Each pack is a lazy chunk so the
// Studio only downloads it when that tab is opened.
import type { SimpleIcon } from "simple-icons";

import { ACCENT, INK } from "../theme";

export type IconPackId = "system" | "brands" | "aws";

export type IconItem = {
  id: string;
  label: string;
  /** Default card label when dropped on the canvas. */
  name: string;
  keywords: string;
  /** Full SVG markup, used for the palette thumbnail. */
  raw: string;
  /** Default icon colour for this item (applied via `currentColor`). */
  color: string;
  pack: IconPackId;
};

/** Normalised icon stored on the node shape — self-contained, no catalog lookup needed. */
export type NodeIcon = { body: string; viewBox: string; color: string };

// ── System design (Lucide, restroked to match the site's 1.5px ink) ──

const SYSTEM: [file: string, name: string, keywords?: string][] = [
  ["monitor", "Client", "web desktop frontend"],
  ["smartphone", "Mobile app", "ios android phone"],
  ["globe", "Internet", "www public web"],
  ["user", "User", "person actor"],
  ["users", "Users", "people actors"],
  ["earth", "DNS", "domain resolve route"],
  ["satellite-dish", "CDN", "edge cache static"],
  ["git-fork", "Load balancer", "lb balance distribute"],
  ["waypoints", "API gateway", "gateway ingress router proxy"],
  ["router", "Reverse proxy", "nginx proxy"],
  ["shield-check", "Firewall / WAF", "security waf"],
  ["lock", "Auth", "authentication login identity"],
  ["key-round", "Secrets", "vault kms keys"],
  ["gauge", "Rate limiter", "throttle quota"],
  ["box", "Service", "microservice app"],
  ["boxes", "Services", "microservices fleet"],
  ["server", "Server", "host vm instance"],
  ["server-cog", "App server", "backend api"],
  ["cpu", "Compute", "cpu worker processor"],
  ["container", "Container", "docker pod kubernetes"],
  ["cog", "Worker", "background job consumer"],
  ["calendar-clock", "Scheduler", "cron job timer"],
  ["workflow", "Workflow", "orchestration saga pipeline"],
  ["database", "Database", "sql postgres mysql rdbms"],
  ["database-zap", "Cache", "redis memcached"],
  ["zap", "In-memory", "fast hot cache"],
  ["layers", "Replica / shard", "partition shard replica"],
  ["hard-drive", "Disk", "volume block storage"],
  ["archive", "Object storage", "blob s3 bucket files"],
  ["folder", "File system", "nfs files"],
  ["inbox", "Message queue", "queue sqs kafka rabbitmq"],
  ["radio", "Pub/Sub", "broadcast topic events stream"],
  ["webhook", "Webhook", "callback event"],
  ["send", "Producer", "publish emit"],
  ["search", "Search index", "elasticsearch opensearch full-text"],
  ["brain-circuit", "ML model", "ai inference llm"],
  ["bot", "Agent", "ai llm bot"],
  ["mail", "Email", "smtp notification"],
  ["bell", "Notifications", "push alert"],
  ["message-square", "Chat", "messages websocket"],
  ["activity", "Monitoring", "health observability"],
  ["chart-line", "Metrics", "analytics dashboard"],
  ["scroll-text", "Logs", "logging audit"],
  ["eye", "Tracing", "observability apm"],
  ["repeat", "Retry", "backoff idempotent"],
  ["hourglass", "Timeout", "latency wait"],
  ["filter", "Filter", "validation"],
  ["arrow-left-right", "Sync", "replication two-way"],
  ["cloud", "Cloud", "region provider"],
  ["network", "Network", "vpc subnet"],
  ["code-xml", "API", "rest grpc graphql"],
  ["terminal", "CLI", "shell"],
  ["git-branch", "CI/CD", "deploy pipeline git"],
  ["package", "Artifact", "build release"],
  ["file-json", "Config", "json settings"],
];

async function loadSystem(): Promise<IconItem[]> {
  const { SYSTEM_FILES } = await import("./systemFiles");
  return SYSTEM.map(([file, name, keywords = ""]) => {
    const raw = SYSTEM_FILES[`../../node_modules/lucide-static/icons/${file}.svg`];
    if (!raw) throw new Error(`Missing Lucide icon: ${file} (add it to systemFiles.ts)`);
    return {
      id: `system:${file}`,
      label: name,
      name,
      keywords: `${file} ${keywords}`,
      raw,
      color: ACCENT,
      pack: "system" as const,
    };
  });
}

// ── Tech logos (Simple Icons, CC0) ──

async function loadBrands(): Promise<IconItem[]> {
  const mod = await import("simple-icons");
  return (Object.values(mod) as unknown[])
    .filter((v): v is SimpleIcon => typeof v === "object" && v !== null && "path" in v && "slug" in v)
    .map((icon) => ({
      id: `brands:${icon.slug}`,
      label: icon.title,
      name: icon.title,
      keywords: icon.slug,
      raw: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="${icon.path}"/></svg>`,
      color: INK,
      pack: "brands" as const,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── AWS (official Architecture Icons, kept unmodified per AWS guidelines) ──

// Short names people actually write on diagrams.
const AWS_SHORT_NAMES: Record<string, string> = {
  AmazonSimpleStorageService: "S3",
  AmazonEC2: "EC2",
  AWSLambda: "Lambda",
  AmazonDynamoDB: "DynamoDB",
  AmazonRDS: "RDS",
  AmazonAurora: "Aurora",
  AmazonCloudFront: "CloudFront",
  AmazonAPIGateway: "API Gateway",
  AmazonSimpleQueueService: "SQS",
  AmazonSimpleNotificationService: "SNS",
  AmazonElastiCache: "ElastiCache",
  AmazonElasticKubernetesService: "EKS",
  AmazonElasticContainerService: "ECS",
  AWSFargate: "Fargate",
  AmazonRoute53: "Route 53",
  AmazonKinesis: "Kinesis",
  AmazonKinesisDataStreams: "Kinesis Data Streams",
  AmazonCognito: "Cognito",
  AmazonCloudWatch: "CloudWatch",
  AWSStepFunctions: "Step Functions",
  AmazonEventBridge: "EventBridge",
  AmazonVirtualPrivateCloud: "VPC",
  AWSIdentityandAccessManagement: "IAM",
  ElasticLoadBalancing: "ELB",
  AmazonRedshift: "Redshift",
  AmazonAthena: "Athena",
  AWSGlue: "Glue",
  AmazonOpenSearchService: "OpenSearch",
  AmazonBedrock: "Bedrock",
  AmazonSageMaker: "SageMaker",
  AmazonSageMakerAI: "SageMaker AI",
  AmazonManagedStreamingforApacheKafka: "MSK",
  AWSWAF: "WAF",
  AWSSecretsManager: "Secrets Manager",
  AWSKeyManagementService: "KMS",
  AmazonElasticBlockStore: "EBS",
  AmazonElasticFileSystem: "EFS",
  AmazonECR: "ECR",
  AmazonElasticContainerRegistry: "ECR",
  AWSAppSync: "AppSync",
  AWSAmplify: "Amplify",
  AmazonSimpleEmailService: "SES",
};

const humanize = (file: string) =>
  file
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();

async function loadAws(): Promise<IconItem[]> {
  const { AWS_FILES } = await import("./awsFiles");
  return Object.entries(AWS_FILES)
    .map(([path, raw]) => {
      const [, folder, file] = path.match(/icons\/([^/]+)\/([^/]+)\.svg$/)!;
      const full = humanize(file);
      const name =
        AWS_SHORT_NAMES[file] ?? full.replace(/^(Amazon|AWS)\s+/, "");
      const kind = folder === "architecture-group" ? "Group" : folder === "resource" ? "Resource" : "Service";
      return {
        id: `aws:${folder}/${file}`,
        label: name === full ? full : `${name} · ${full}`,
        name,
        keywords: `${file} ${full} ${kind}`,
        raw,
        color: INK,
        pack: "aws" as const,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const loaders: Record<IconPackId, () => Promise<IconItem[]>> = {
  system: loadSystem,
  brands: loadBrands,
  aws: loadAws,
};
const cache = new Map<IconPackId, Promise<IconItem[]>>();

export function loadPack(pack: IconPackId): Promise<IconItem[]> {
  let p = cache.get(pack);
  if (!p) {
    p = loaders[pack]();
    cache.set(pack, p);
    p.catch(() => cache.delete(pack));
  }
  return p;
}

/** Turn a catalog SVG into the self-contained `{body, viewBox}` a node stores. */
export function toNodeIcon(item: IconItem): NodeIcon {
  const doc = new DOMParser().parseFromString(item.raw, "image/svg+xml");
  const svg = doc.documentElement;
  svg.querySelectorAll("title, desc").forEach((el) => el.remove());
  const viewBox =
    svg.getAttribute("viewBox") ??
    `0 0 ${svg.getAttribute("width") ?? 24} ${svg.getAttribute("height") ?? 24}`;
  let body = svg.innerHTML.trim();
  if (item.pack === "system") {
    // Lucide sets stroke styling on the root <svg>; carry it onto a group
    // (at the site's 1.5px weight) so the body renders standalone.
    body = `<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
  }
  return { body, viewBox, color: item.color };
}
