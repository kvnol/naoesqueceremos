"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface LightboxProps {
  item: ContentItem | null;
  onClose: () => void;
}

export function Lightbox({ item, onClose }: LightboxProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.figure
            className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-sm bg-[var(--bg-elevated)] shadow-[var(--shadow-panel)]"
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 12, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-sm bg-black/60 px-2.5 py-1 text-sm text-white"
              aria-label="Fechar imagem"
            >
              Fechar
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="max-h-[70vh] w-full object-contain"
            />
            <figcaption className="space-y-1 border-t border-[var(--line)] px-4 py-3 text-sm">
              <p className="font-medium text-[var(--fg)]">{item.title}</p>
              <p className="text-[var(--fg-muted)]">{item.description}</p>
              <p className="text-xs text-[var(--fg-subtle)]">
                {item.credit ? `${item.credit} · ` : ""}
                {formatDate(item.date)} ·{" "}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-soft)] underline-offset-2 hover:underline"
                >
                  {item.sourceName}
                </a>
              </p>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
