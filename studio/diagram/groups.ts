// Boundary presets. AWS ones follow the AWS Architecture Icons group
// conventions (colour, dash, corner icon); the rest use the site palette.
import { ACCENT, INK } from "./theme";

export type GroupPreset = {
  id: string;
  label: string;
  stroke: string;
  fill: string;
  dashed: boolean;
  /** Catalog item id for the corner icon (e.g. "aws:architecture-group/Region"). */
  icon?: string;
  /** Tint for monochrome (currentColor) icons. */
  iconColor?: string;
  w: number;
  h: number;
};

export const GROUP_PRESETS: GroupPreset[] = [
  { id: "aws-cloud", label: "AWS Cloud", stroke: "#232F3E", fill: "transparent", dashed: false, icon: "aws:architecture-group/AWSCloudlogo", w: 900, h: 560 },
  { id: "aws-account", label: "AWS Account", stroke: "#E7157B", fill: "transparent", dashed: false, icon: "aws:architecture-group/AWSAccount", w: 860, h: 520 },
  { id: "region", label: "Region", stroke: "#00A4A6", fill: "transparent", dashed: true, icon: "aws:architecture-group/Region", w: 820, h: 480 },
  { id: "az", label: "Availability Zone", stroke: "#00A4A6", fill: "transparent", dashed: true, w: 380, h: 400 },
  { id: "vpc", label: "VPC", stroke: "#8C4FFF", fill: "transparent", dashed: false, icon: "aws:architecture-group/VirtualprivatecloudVPC", w: 760, h: 420 },
  { id: "public-subnet", label: "Public subnet", stroke: "#7AA116", fill: "#F2F6E8", dashed: false, icon: "aws:architecture-group/Publicsubnet", w: 260, h: 320 },
  { id: "private-subnet", label: "Private subnet", stroke: "#00A4A6", fill: "#E6F6F7", dashed: false, icon: "aws:architecture-group/Privatesubnet", w: 420, h: 320 },
  { id: "nacl", label: "Network ACL", stroke: "#8C4FFF", fill: "transparent", dashed: true, icon: "aws:resource/AmazonVPCNetworkAccessControlList", w: 460, h: 360 },
  { id: "security-group", label: "Security group", stroke: "#DD344C", fill: "transparent", dashed: false, w: 360, h: 260 },
  { id: "asg", label: "Auto Scaling group", stroke: "#ED7100", fill: "transparent", dashed: true, icon: "aws:architecture-group/AutoScalinggroup", w: 380, h: 220 },
  { id: "ecs-cluster", label: "ECS cluster", stroke: "#ED7100", fill: "transparent", dashed: true, icon: "aws:architecture-service/AmazonElasticContainerService", w: 420, h: 260 },
  { id: "ec2-contents", label: "EC2 instance", stroke: "#ED7100", fill: "transparent", dashed: false, icon: "aws:architecture-group/EC2instancecontents", w: 320, h: 220 },
  { id: "datacenter", label: "Corporate data center", stroke: "#7D8998", fill: "transparent", dashed: false, icon: "aws:architecture-group/Corporatedatacenter", w: 420, h: 300 },
  { id: "boundary", label: "Boundary", stroke: ACCENT, fill: "transparent", dashed: true, w: 420, h: 280 },
  { id: "service", label: "Service", stroke: INK, fill: "#F7F7F7", dashed: false, icon: "system:box", iconColor: ACCENT, w: 420, h: 280 },
  { id: "k8s", label: "Kubernetes cluster", stroke: "#326CE5", fill: "transparent", dashed: true, icon: "system:container", iconColor: "#326CE5", w: 460, h: 300 },
  { id: "compose", label: "Docker Compose", stroke: INK, fill: "transparent", dashed: true, icon: "system:container", iconColor: ACCENT, w: 460, h: 300 },
];
