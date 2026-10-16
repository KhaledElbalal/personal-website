// Server-side syntax highlighting (Shiki) for Portable Text code cells.
// Runs at render time only — no highlighting JS ships to the browser.
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { createJavaScriptRegexEngine, getSingletonHighlighter, type ThemeRegistration } from "shiki";

// Built from the site palette on the code cell's Xiketic background; every
// token colour clears WCAG AA (lowest: comments at 7.1:1).
const SITE_THEME: ThemeRegistration = {
  name: "site-dark",
  type: "dark",
  colors: { "editor.background": "#121420", "editor.foreground": "#f7f7ff" },
  tokenColors: [
    { settings: { foreground: "#f7f7ff" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#9da0b3", fontStyle: "italic" } },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.logical", "keyword.operator.new", "variable.language"],
      settings: { foreground: "#38b6ff" },
    },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic"], settings: { foreground: "#9fdcff" } },
    { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: "#ffcf8b" } },
    { scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"], settings: { foreground: "#ffab86" } },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class", "support.type", "entity.other.inherited-class"],
      settings: { foreground: "#7ee0c3" },
    },
    { scope: ["entity.name.function.decorator", "meta.decorator", "punctuation.decorator"], settings: { foreground: "#d6b4ff" } },
    { scope: ["punctuation", "keyword.operator", "meta.brace"], settings: { foreground: "#c7c9d6" } },
    { scope: ["variable.parameter", "variable.other.property", "support.variable.property"], settings: { foreground: "#f7f7ff" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#38b6ff" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#9fdcff" } },
  ],
};

// Languages the posts use; anything else renders as plain text.
const LANGS = [
  "python", "bash", "shellscript", "typescript", "tsx", "javascript", "jsx", "json", "yaml",
  "sql", "ruby", "html", "css", "dockerfile", "toml", "markdown", "diff",
  // Systems: C/C++, assembly, Rust/Go/Zig, LLVM IR, build files, raw logs
  // (strace / perf / dmesg output reads well as "log").
  "c", "cpp", "asm", "riscv", "rust", "go", "zig", "llvm", "make", "cmake", "log", "ini",
] as const;

const ALIASES: Record<string, string> = {
  py: "python", sh: "bash", shell: "bash", zsh: "bash", console: "bash", ts: "typescript",
  js: "javascript", yml: "yaml", rb: "ruby", md: "markdown", docker: "dockerfile",
  h: "c", "c++": "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", hh: "cpp",
  s: "asm", gas: "asm", x86: "asm", x86asm: "asm", nasm: "asm", assembly: "asm",
  rs: "rust", golang: "go", ll: "llvm", makefile: "make",
  strace: "log", perf: "log", dmesg: "log", output: "log", text: "log",
};

// In-code annotations, written as a trailing comment in the cell's own
// comment syntax: `# [!code highlight]`, `// [!code ++]` / `[!code --]`,
// `[!code focus]`, `[!code error]` / `[!code warning]`,
// `[!code word:await]`. Shiki strips the marker and tags the line.
const TRANSFORMERS = [
  transformerNotationHighlight({ matchAlgorithm: "v3" }),
  transformerNotationDiff({ matchAlgorithm: "v3" }),
  transformerNotationFocus({ matchAlgorithm: "v3" }),
  transformerNotationErrorLevel({ matchAlgorithm: "v3" }),
  transformerNotationWordHighlight({ matchAlgorithm: "v3" }),
  transformerMetaHighlight(),
];

/** Language id the highlighter will use, or null if it isn't loaded. */
export function resolveLanguage(language?: string | null): string | null {
  const lang = language ? (ALIASES[language.toLowerCase()] ?? language.toLowerCase()) : null;
  return lang && (LANGS as readonly string[]).includes(lang) ? lang : null;
}

const highlighter = () =>
  getSingletonHighlighter({
    themes: [SITE_THEME],
    langs: [...LANGS],
    // Pure-JS regex engine: no WASM to bundle for the server runtime.
    engine: createJavaScriptRegexEngine(),
  });

/**
 * Highlighted `<pre>` HTML for a code cell, or null for unknown languages.
 * `lines` is a range list like "3, 5-7" (the cell's "Highlight lines" field).
 */
export async function highlight(
  code: string,
  language?: string | null,
  lines?: string | null,
): Promise<string | null> {
  // Cached per (code, language, lines): highlighting runs once, and Shiki's
  // internal Date.now() stays inside a cache scope, which Cache Components
  // requires.
  "use cache";
  const lang = resolveLanguage(language);
  if (!lang) return null;
  const h = await highlighter();
  const range = lines?.replace(/\s+/g, "");
  return h.codeToHtml(code, {
    lang,
    theme: "site-dark",
    meta: range ? { __raw: `{${range}}` } : undefined,
    transformers: TRANSFORMERS,
  });
}
