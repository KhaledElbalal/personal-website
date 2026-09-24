// Curated Lucide icons, bundled eagerly into one lazy chunk (a non-eager
// glob over all of lucide-static would emit ~1.6k tiny chunks).
// Keep this brace list in sync with SYSTEM in ./catalog.ts.
export const SYSTEM_FILES = import.meta.glob<string>(
  "../../node_modules/lucide-static/icons/{monitor,smartphone,globe,user,users,earth,satellite-dish,git-fork,waypoints,router,shield-check,lock,key-round,gauge,box,boxes,server,server-cog,cpu,container,cog,calendar-clock,workflow,database,database-zap,zap,layers,hard-drive,archive,folder,inbox,radio,webhook,send,search,brain-circuit,bot,mail,bell,message-square,activity,chart-line,scroll-text,eye,repeat,hourglass,filter,arrow-left-right,cloud,network,code-xml,terminal,git-branch,package,file-json}.svg",
  { eager: true, query: "?raw", import: "default" },
);
