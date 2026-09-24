// Official AWS Architecture Icons (via the aws-icons package), bundled into
// one lazy chunk loaded only when the AWS tab opens.
export const AWS_FILES = import.meta.glob<string>(
  [
    "../../node_modules/aws-icons/icons/architecture-service/*.svg",
    "../../node_modules/aws-icons/icons/architecture-group/*.svg",
    "../../node_modules/aws-icons/icons/resource/*.svg",
  ],
  { eager: true, query: "?raw", import: "default" },
);
