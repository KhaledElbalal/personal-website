// Shiki's in-code annotations (`// [!code ++]`, `# [!code highlight]`, …)
// rendered as plain text, for places that show code without Shiki.

const NOTATION = /\s*(?:\/\/|#|--|;|\/\*|<!--)\s*\[!code [^\]]+\](?:\s*(?:\*\/|-->))?\s*$/;

/**
 * Plain-text view of an annotated cell (Markdown export, copy): drops the
 * `[!code …]` markers and turns diff lines into `+`/`-` prefixes.
 */
export function stripNotation(code: string): { code: string; isDiff: boolean } {
  let isDiff = false;
  const out = code.split("\n").map((line) => {
    const m = line.match(/\[!code (\+\+|--)\]/);
    const bare = line.replace(NOTATION, "");
    if (!m) return bare;
    isDiff = true;
    return `${m[1] === "++" ? "+" : "-"} ${bare}`;
  });
  return {
    code: isDiff ? out.map((l) => (/^[+-] /.test(l) ? l : `  ${l}`)).join("\n") : out.join("\n"),
    isDiff,
  };
}
