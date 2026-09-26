"use client";

import { useState } from "react";

import { CLAUDE_PATH, PERPLEXITY_PATH } from "@/components/content/read-with-icons";

type ReadWithProps = {
  title: string;
  /** Public Markdown version of the post (…/<slug>.md). */
  markdownUrl: string;
  kind: "post" | "project";
};

// Prefill links. Formats as used by "Open in …" menus across docs sites;
// kept here in one place in case a provider changes them.
const PROVIDERS = [
  { id: "claude", name: "Claude", url: (q: string) => `https://claude.ai/new?q=${q}` },
  { id: "chatgpt", name: "ChatGPT", url: (q: string) => `https://chatgpt.com/?hints=search&q=${q}` },
  { id: "perplexity", name: "Perplexity", url: (q: string) => `https://www.perplexity.ai/search/new?q=${q}` },
] as const;

function teacherPrompt(title: string, url: string, kind: "post" | "project") {
  const thing = kind === "project" ? "project write-up" : "blog post";
  return [
    `I'm reading the ${thing} "${title}" by Khaled Ibrahim. Read it here: ${url}`,
    "",
    "Act as my teacher for it:",
    "1. Start by asking what I already know about the topic, and adapt to my level.",
    "2. Walk me through the key ideas in order. The system diagrams are included as adjacency lists (components, groups, → sync / ⇢ async / ↩ response connections) — explain them hop by hop.",
    "3. Check my understanding with a few short questions, one at a time.",
    "Stay grounded in the post and say when you're going beyond it.",
  ].join("\n");
}

const icon = {
  claude: (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="#D97757" d={CLAUDE_PATH} />
    </svg>
  ),
  chatgpt: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  perplexity: (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="#1FB8CD" d={PERPLEXITY_PATH} />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="14" height="14" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
};

const btn =
  "inline-flex h-8 items-center gap-1.5 rounded-[4px] border-[1.5px] border-[color:var(--color-xiketic)] bg-white px-2.5 font-mono text-xs font-bold text-ink no-underline shadow-[-3px_3px_0_rgba(0,103,168,0.30)] hover:text-accent";

/** "Learn this with …": opens an assistant as a teacher, primed with the post. */
export function ReadWith({ title, markdownUrl, kind }: ReadWithProps) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const q = encodeURIComponent(teacherPrompt(title, markdownUrl, kind));

  const copyMarkdown = async () => {
    try {
      const res = await fetch(markdownUrl);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2500);
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs text-muted">
        <span className="text-accent">$</span> learn with
      </span>
      {PROVIDERS.map((p) => (
        <a
          key={p.id}
          href={p.url(q)}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label={`Learn this ${kind} with ${p.name} (opens in a new tab)`}
        >
          {icon[p.id]}
          {p.name}
        </a>
      ))}
      <button type="button" onClick={copyMarkdown} className={btn} aria-live="polite">
        {icon.copy}
        {copied === "done" ? "Copied!" : copied === "failed" ? "Copy failed" : "Copy as Markdown"}
      </button>
    </div>
  );
}
