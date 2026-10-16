// Starter diagrams, dropped at the viewport centre and fully editable.
// Coordinates are page units relative to the template's own origin.
import type { Editor, TLShapeId } from "tldraw";

import { getFlows, setFlows } from "./behavior";
import type { FlowKind } from "./flows";
import { GROUP_PRESETS } from "./groups";
import { connect, createGroup, createNode, loadSiteFonts, NODE_H, NODE_W, resolveItems, safeReparent } from "./insert";

type TGroup = { key: string; preset: string; label?: string; x: number; y: number; w: number; h: number; in?: string };
type TNode = { key: string; icon?: string; label?: string; sub?: string; x: number; y: number; in?: string };
type TEdge = [from: string, to: string, kind: FlowKind, label?: string];
/** A recorded flow: edges by "from->to", each with the walkthrough note. */
type TFlow = { name: string; steps: [edge: string, note?: string][] };

export type Template = {
  id: string;
  title: string;
  description: string;
  groups?: TGroup[];
  nodes: TNode[];
  edges: TEdge[];
  /** Added to the diagram's Flows; the first becomes the default if none exists. */
  flows?: TFlow[];
};

const AWS = (path: string) => `aws:${path}`;
const SVC = (file: string) => AWS(`architecture-service/${file}`);
const RES = (file: string) => AWS(`resource/${file}`);
const SYS = (file: string) => `system:${file}`;

export const TEMPLATES: Template[] = [
  {
    id: "three-tier",
    title: "3-tier web app",
    description: "ALB → app servers → Postgres + Redis, in a VPC with public/private subnets.",
    groups: [
      { key: "cloud", preset: "aws-cloud", x: 200, y: 0, w: 980, h: 560 },
      { key: "vpc", preset: "vpc", x: 230, y: 50, w: 920, h: 480, in: "cloud" },
      { key: "pub", preset: "public-subnet", x: 260, y: 100, w: 230, h: 400, in: "vpc" },
      { key: "app", preset: "private-subnet", label: "Private subnet · app", x: 520, y: 100, w: 300, h: 400, in: "vpc" },
      { key: "data", preset: "private-subnet", label: "Private subnet · data", x: 850, y: 100, w: 270, h: 400, in: "vpc" },
    ],
    nodes: [
      { key: "users", icon: "system:users", label: "Users", x: 0, y: 240 },
      { key: "alb", icon: RES("ElasticLoadBalancingApplicationLoadBalancer"), x: 300, y: 240, in: "pub" },
      { key: "app1", icon: RES("AmazonEC2Instance"), label: "App server", sub: "Django", x: 595, y: 150, in: "app" },
      { key: "app2", icon: RES("AmazonEC2Instance"), label: "App server", sub: "Django", x: 595, y: 330, in: "app" },
      { key: "db", icon: RES("AmazonAuroraPostgreSQLInstanceAlternate"), x: 910, y: 150, in: "data" },
      { key: "cache", icon: RES("AmazonElastiCacheElastiCacheforRedis"), x: 910, y: 330, in: "data" },
    ],
    edges: [
      ["users", "alb", "request", "HTTPS"],
      ["alb", "app1", "request"],
      ["alb", "app2", "request"],
      ["app1", "db", "request", "SQL"],
      ["app2", "cache", "request", "cache"],
    ],
  },
  {
    id: "fanout",
    title: "Event-driven fan-out",
    description: "SNS topic fanning out to SQS queues, workers, and a dead-letter queue.",
    nodes: [
      { key: "api", icon: "brands:fastapi", label: "Orders API", sub: "FastAPI", x: 0, y: 200 },
      { key: "sns", icon: SVC("AmazonSimpleNotificationService"), label: "SNS", sub: "order-events", x: 300, y: 200 },
      { key: "q1", icon: RES("AmazonSimpleQueueServiceQueue"), label: "SQS", sub: "fulfilment", x: 600, y: 60 },
      { key: "q2", icon: RES("AmazonSimpleQueueServiceQueue"), label: "SQS", sub: "analytics", x: 600, y: 340 },
      { key: "dlq", icon: RES("AmazonSimpleQueueServiceQueue"), label: "DLQ", sub: "fulfilment-dlq", x: 600, y: -170 },
      { key: "w1", icon: "brands:celery", label: "Worker", sub: "Celery", x: 900, y: 60 },
      { key: "w2", icon: SVC("AWSLambda"), label: "Lambda", sub: "aggregate", x: 900, y: 340 },
      { key: "db", icon: SVC("AmazonDynamoDB"), label: "DynamoDB", x: 1200, y: 60 },
      { key: "s3", icon: SVC("AmazonSimpleStorageService"), label: "S3", sub: "data lake", x: 1200, y: 340 },
    ],
    edges: [
      ["api", "sns", "request", "publish"],
      ["sns", "q1", "async"],
      ["sns", "q2", "async"],
      ["q1", "w1", "async", "poll"],
      ["q2", "w2", "async", "trigger"],
      ["w1", "db", "request", "write"],
      ["w2", "s3", "request", "put"],
      ["q1", "dlq", "response", "3 retries"],
    ],
  },
  {
    id: "django-celery",
    title: "Django + Celery",
    description: "Next.js front end, Django API, Postgres, Redis broker, Celery worker and beat.",
    groups: [{ key: "compose", preset: "compose", label: "Docker Compose", x: 300, y: -30, w: 830, h: 580 }],
    nodes: [
      { key: "next", icon: "brands:nextdotjs", label: "Next.js", sub: "frontend", x: 0, y: 160 },
      { key: "django", icon: "brands:django", label: "Django API", sub: "gunicorn", x: 330, y: 160, in: "compose" },
      { key: "pg", icon: "brands:postgresql", label: "Postgres", x: 640, y: 20, in: "compose" },
      { key: "redis", icon: "brands:redis", label: "Redis", sub: "broker + cache", x: 640, y: 300, in: "compose" },
      { key: "worker", icon: "brands:celery", label: "Celery worker", x: 950, y: 300, in: "compose" },
      { key: "beat", icon: "brands:celery", label: "Celery beat", sub: "scheduler", x: 330, y: 390, in: "compose" },
    ],
    edges: [
      ["next", "django", "request", "REST"],
      ["django", "pg", "request", "ORM"],
      ["django", "redis", "async", "enqueue"],
      ["redis", "worker", "async", "consume"],
      ["worker", "pg", "request", "write"],
      ["beat", "redis", "async", "schedule"],
    ],
  },
  {
    id: "bedrock-rag",
    title: "RAG on Bedrock",
    description: "FastAPI chat backend retrieving from S3 Vectors and generating with Bedrock.",
    nodes: [
      { key: "next", icon: "brands:nextdotjs", label: "Next.js", sub: "chat UI", x: 0, y: 140 },
      { key: "api", icon: "brands:fastapi", label: "FastAPI", sub: "/chat", x: 320, y: 140 },
      { key: "bedrock", icon: SVC("AmazonBedrock"), label: "Bedrock", sub: "LLM + embeddings", x: 660, y: -60 },
      { key: "vec", icon: RES("AmazonSimpleStorageServiceS3Vectors"), label: "S3 Vectors", sub: "index", x: 660, y: 320 },
      { key: "ingest", icon: SVC("AWSLambda"), label: "Ingest", sub: "Lambda", x: 990, y: 320 },
      { key: "docs", icon: SVC("AmazonSimpleStorageService"), label: "S3", sub: "source docs", x: 1310, y: 320 },
    ],
    edges: [
      ["next", "api", "request", "SSE"],
      ["api", "vec", "request", "retrieve"],
      ["api", "bedrock", "request", "generate"],
      ["docs", "ingest", "async", "on upload"],
      ["ingest", "bedrock", "request", "embed"],
      ["ingest", "vec", "request", "upsert"],
    ],
  },
  {
    id: "ecs-fargate",
    title: "Containers on ECS",
    description: "CI pushes to ECR; Fargate tasks in private subnets behind an ALB.",
    groups: [
      { key: "cloud", preset: "aws-cloud", x: 220, y: -60, w: 960, h: 640 },
      { key: "vpc", preset: "vpc", x: 250, y: 170, w: 900, h: 380, in: "cloud" },
      { key: "pub", preset: "public-subnet", x: 280, y: 220, w: 230, h: 300, in: "vpc" },
      { key: "priv", preset: "private-subnet", x: 540, y: 220, w: 580, h: 300, in: "vpc" },
      { key: "ecs", preset: "ecs-cluster", label: "ECS cluster · Fargate", x: 570, y: 270, w: 520, h: 220, in: "priv" },
    ],
    nodes: [
      { key: "gh", icon: "brands:githubactions", label: "GitHub Actions", sub: "CI", x: 0, y: -10 },
      { key: "users", icon: "system:users", label: "Users", x: 0, y: 320 },
      { key: "ecr", icon: SVC("AmazonElasticContainerRegistry"), label: "ECR", x: 300, y: -10, in: "cloud" },
      { key: "alb", icon: RES("ElasticLoadBalancingApplicationLoadBalancer"), x: 320, y: 320, in: "pub" },
      { key: "t1", icon: RES("AmazonElasticContainerServiceTask"), label: "Task", sub: "api", x: 620, y: 330, in: "ecs" },
      { key: "t2", icon: RES("AmazonElasticContainerServiceTask"), label: "Task", sub: "worker", x: 880, y: 330, in: "ecs" },
    ],
    edges: [
      ["gh", "ecr", "request", "docker push"],
      ["ecr", "t1", "async", "pull"],
      ["users", "alb", "request", "HTTPS"],
      ["alb", "t1", "request"],
      ["t1", "t2", "async", "jobs"],
    ],
  },
  {
    id: "await-epoll",
    title: "await → epoll → resume",
    description: "A Python task suspends on a socket read; the loop waits in epoll_wait until the kernel wakes it. Includes a narrated flow.",
    groups: [
      { key: "user", preset: "user-space", x: 0, y: 0, w: 1000, h: 480 },
      { key: "proc", preset: "process", label: "Process · python3", x: 30, y: 50, w: 940, h: 400, in: "user" },
      { key: "kernel", preset: "kernel-space", x: 0, y: 560, w: 1000, h: 240 },
      { key: "hw", preset: "hardware", x: 0, y: 860, w: 1000, h: 200 },
    ],
    nodes: [
      { key: "task", icon: SYS("list-todo"), label: "Task", sub: "handler()", x: 100, y: 110, in: "proc" },
      { key: "loop", icon: SYS("iteration-cw"), label: "Event loop", sub: "asyncio", x: 560, y: 110, in: "proc" },
      { key: "ready", icon: SYS("list-ordered"), label: "Ready queue", sub: "call_soon", x: 330, y: 310, in: "proc" },
      { key: "epoll", icon: SYS("binoculars"), label: "epoll", sub: "epoll_wait()", x: 560, y: 640, in: "kernel" },
      { key: "sock", icon: SYS("plug"), label: "Socket", sub: "fd 7 · rx buffer", x: 820, y: 640, in: "kernel" },
      { key: "nic", icon: SYS("ethernet-port"), label: "NIC", x: 820, y: 910, in: "hw" },
    ],
    edges: [
      ["task", "loop", "async", "await"],
      ["loop", "epoll", "request", "epoll_wait()"],
      ["nic", "sock", "async", "IRQ · packet"],
      ["sock", "epoll", "async", "wakeup"],
      ["epoll", "loop", "response", "fd 7 ready"],
      ["loop", "ready", "async", "schedule"],
      ["ready", "task", "request", "resume"],
    ],
    flows: [
      {
        name: "await → resume",
        steps: [
          ["task->loop", "The task awaits a read on a socket with no data yet, so it suspends and hands control back to the loop."],
          ["loop->epoll", "Nothing else is runnable, so the loop blocks in epoll_wait() on every fd it watches."],
          ["nic->sock", "A packet arrives: the NIC raises an interrupt and the kernel queues the bytes on the socket."],
          ["sock->epoll", "The socket's wakeup callback puts fd 7 on epoll's ready list."],
          ["epoll->loop", "epoll_wait() returns the ready fds to user space."],
          ["loop->ready", "The loop schedules the waiting task's callback."],
          ["ready->task", "On the next tick the task resumes right after its await, and the data is there."],
        ],
      },
    ],
  },
  {
    id: "io-uring",
    title: "io_uring rings",
    description: "Submission and completion rings shared with the kernel: push SQEs, one syscall, reap CQEs. Includes a narrated flow.",
    groups: [
      { key: "user", preset: "user-space", x: 0, y: 0, w: 900, h: 640 },
      { key: "shm", preset: "shared-memory", label: "Shared rings (mmap)", x: 150, y: 340, w: 600, h: 270, in: "user" },
      { key: "kernel", preset: "kernel-space", x: 0, y: 700, w: 900, h: 240 },
      { key: "hw", preset: "hardware", x: 0, y: 1000, w: 900, h: 200 },
    ],
    nodes: [
      { key: "app", icon: SYS("iteration-cw"), label: "App", sub: "event loop", x: 375, y: 50, in: "user" },
      { key: "sq", icon: SYS("circle-dashed"), label: "SQ", sub: "submission ring", x: 220, y: 430, in: "shm" },
      { key: "cq", icon: SYS("circle-dashed"), label: "CQ", sub: "completion ring", x: 530, y: 430, in: "shm" },
      { key: "uring", icon: SYS("arrow-down-up"), label: "io_uring", sub: "kernel side", x: 220, y: 780, in: "kernel" },
      { key: "dev", icon: SYS("hard-drive"), label: "Device", sub: "NVMe / NIC", x: 530, y: 1050, in: "hw" },
    ],
    edges: [
      ["app", "sq", "async", "push SQE"],
      ["sq", "uring", "request", "io_uring_enter()"],
      ["uring", "dev", "request", "submit I/O"],
      ["dev", "uring", "async", "IRQ · done"],
      ["uring", "cq", "async", "post CQE"],
      ["cq", "app", "response", "reap CQE"],
    ],
    flows: [
      {
        name: "Submit → complete",
        steps: [
          ["app->sq", "The app writes a submission entry (op, fd, buffer) into the shared SQ ring — plain memory, no syscall."],
          ["sq->uring", "One io_uring_enter() hands the kernel every queued SQE at once (or none, with SQPOLL)."],
          ["uring->dev", "The kernel issues the I/O to the device."],
          ["dev->uring", "The device signals completion."],
          ["uring->cq", "The kernel writes a completion entry with the result into the CQ ring."],
          ["cq->app", "The app reaps CQEs from shared memory and resumes whatever was waiting on each one."],
        ],
      },
    ],
  },
  {
    id: "to-thread",
    title: "Offload to a thread pool",
    description: "asyncio.to_thread / run_in_executor: blocking work runs on a worker thread while the loop keeps serving. Includes a narrated flow.",
    groups: [
      { key: "proc", preset: "process", label: "Process · python3", x: 0, y: 0, w: 1180, h: 460 },
      { key: "loopg", preset: "event-loop", label: "Event loop · main thread", x: 30, y: 60, w: 420, h: 370, in: "proc" },
      { key: "pool", preset: "thread", label: "Thread pool · executor", x: 500, y: 60, w: 650, h: 370, in: "proc" },
    ],
    nodes: [
      { key: "task", icon: SYS("list-todo"), label: "Task", sub: "await to_thread()", x: 70, y: 120, in: "loopg" },
      { key: "fut", icon: SYS("ticket"), label: "Future", sub: "pending", x: 70, y: 290, in: "loopg" },
      { key: "worker", icon: SYS("spline"), label: "Worker thread", x: 560, y: 130, in: "pool" },
      { key: "idle", icon: SYS("spline"), label: "Worker thread", sub: "idle", x: 560, y: 290, in: "pool" },
      { key: "call", icon: SYS("hourglass"), label: "Blocking call", sub: "open().read()", x: 930, y: 130, in: "pool" },
    ],
    edges: [
      ["task", "worker", "async", "submit fn"],
      ["worker", "call", "request", "read()"],
      ["call", "worker", "response", "bytes"],
      ["worker", "fut", "async", "call_soon_threadsafe"],
      ["fut", "task", "request", "resume"],
    ],
    flows: [
      {
        name: "Offload → resume",
        steps: [
          ["task->worker", "The task hands the blocking function to the executor and awaits a future; the loop is free to run other tasks."],
          ["worker->call", "A worker thread makes the blocking call (the GIL is released while it waits on I/O)."],
          ["call->worker", "The call returns on the worker thread."],
          ["worker->fut", "The worker can't touch the loop directly, so it resolves the future via call_soon_threadsafe."],
          ["fut->task", "Back on the loop thread, the future completes and the task resumes."],
        ],
      },
    ],
  },
];

/** Drop a template centred in the viewport, then select and frame it. */
export async function insertTemplate(editor: Editor, tpl: Template) {
  const groups = tpl.groups ?? [];
  const presets = new Map(GROUP_PRESETS.map((p) => [p.id, p]));
  const iconIds = [
    ...tpl.nodes.map((n) => n.icon),
    ...groups.map((g) => presets.get(g.preset)?.icon),
  ].filter((id): id is string => Boolean(id));
  const [items] = await Promise.all([resolveItems(iconIds), loadSiteFonts(editor)]);

  // Centre the template's bounding box on the viewport.
  const boxes = [
    ...groups.map((g) => ({ x: g.x, y: g.y, r: g.x + g.w, b: g.y + g.h })),
    ...tpl.nodes.map((n) => ({ x: n.x, y: n.y, r: n.x + NODE_W, b: n.y + NODE_H })),
  ];
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.r));
  const maxY = Math.max(...boxes.map((b) => b.b));
  const c = editor.getViewportPageBounds().center;
  const dx = c.x - (minX + maxX) / 2;
  const dy = c.y - (minY + maxY) / 2;

  const ids = new Map<string, TLShapeId>();
  editor.run(() => {
    for (const g of groups) {
      const preset = presets.get(g.preset)!;
      ids.set(
        g.key,
        createGroup(editor, preset, preset.icon ? items.get(preset.icon) : undefined, { x: g.x + dx, y: g.y + dy }, {
          w: g.w,
          h: g.h,
          label: g.label,
        }),
      );
    }
    for (const n of tpl.nodes) {
      ids.set(
        n.key,
        createNode(editor, n.icon ? items.get(n.icon) : undefined, { x: n.x + dx, y: n.y + dy }, {
          label: n.label,
          sublabel: n.sub,
        }),
      );
    }
    // Parent after creation: reparenting keeps page positions and stacks
    // children above their container.
    for (const g of groups) if (g.in) safeReparent(editor, [ids.get(g.key)!], ids.get(g.in)!);
    for (const n of tpl.nodes) if (n.in) safeReparent(editor, [ids.get(n.key)!], ids.get(n.in)!);
    // A pair drawn both ways (request + response) gets curved apart; the same
    // bend on opposite directions lands on opposite sides.
    const keys = new Set(tpl.edges.map(([from, to]) => `${from}->${to}`));
    for (const [from, to, kind, label] of tpl.edges) {
      const bend = keys.has(`${to}->${from}`) ? 70 : 0;
      ids.set(`${from}->${to}`, connect(editor, ids.get(from)!, ids.get(to)!, kind, label, bend));
    }

    if (tpl.flows?.length) {
      const existing = getFlows(editor);
      const added = tpl.flows.map((f, i) => ({
        id: Math.random().toString(36).slice(2, 10),
        name: f.name,
        isDefault: !existing.some((e) => e.isDefault) && i === 0,
        steps: f.steps
          .map(([edge, note]) => ({ arrowId: ids.get(edge)!, note }))
          .filter((step) => step.arrowId),
      }));
      setFlows(editor, [...existing, ...added]);
    }
  });

  editor.select(...ids.values());
  editor.zoomToSelection({ animation: { duration: 250 } });
}
