import { Text } from "@sanity/ui";
import { useEffect, useState } from "react";
import { useFormValue, type StringInputProps } from "sanity";

import { SITE_ORIGIN } from "../lib/siteOrigin";

type Found = { label: string; title?: string; detail?: string; url: string } | null;

/** Identifier input + a live check against the source (via the site's /api/citation). */
export function CitationIdInput(props: StringInputProps) {
  const kind = useFormValue([...props.path.slice(0, -1), "kind"]) as string | undefined;
  const id = props.value?.trim();
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing" | "offline">("idle");
  const [found, setFound] = useState<Found>(null);

  useEffect(() => {
    if (!id || !kind || kind === "link") return setState("idle");
    const ctl = new AbortController();
    setState("loading");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${SITE_ORIGIN}/api/citation?kind=${kind}&id=${encodeURIComponent(id)}`, { signal: ctl.signal });
        if (res.status === 404) return (setFound(null), setState("missing"));
        if (!res.ok) return setState("offline");
        setFound(await res.json());
        setState("found");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("offline");
      }
    }, 500);
    return () => (clearTimeout(t), ctl.abort());
  }, [id, kind]);

  return (
    <>
      {props.renderDefault(props)}
      {state === "loading" && <Text size={1} muted style={{ marginTop: 6 }}>Looking up…</Text>}
      {state === "found" && found && (
        <Text size={1} style={{ marginTop: 6 }}>
          ✓ {found.label}
          {found.title ? ` — ${found.title}` : ""}
          {found.detail ? ` (${found.detail})` : ""}
        </Text>
      )}
      {state === "missing" && (
        <Text size={1} style={{ marginTop: 6 }}>⚠ Not found — check the identifier.</Text>
      )}
      {state === "offline" && (
        <Text size={1} muted style={{ marginTop: 6 }}>Couldn’t reach {SITE_ORIGIN} to verify.</Text>
      )}
    </>
  );
}
