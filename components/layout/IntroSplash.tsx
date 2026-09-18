"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/ui";

const SESSION_KEY = "intro-seen";

/** One-time boot splash — the [K▮] wordmark, its cursor already blinking via
 * CSS. Shown once per browser session (sessionStorage-gated), skippable on
 * click, and skipped entirely under prefers-reduced-motion. */
export function IntroSplash() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    if (reduceMotion) return;

    // sessionStorage can't be read during SSR/first paint without a
    // hydration mismatch, so this has to be decided post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="presentation"
          aria-hidden="true"
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-page"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-[56px] sm:text-[72px]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Wordmark />
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
