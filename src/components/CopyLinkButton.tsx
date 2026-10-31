"use client";

import { useState } from "react";
import { trackCopyLink } from "@/lib/analytics";
import type { UfCode } from "@/lib/types";

interface CopyLinkButtonProps {
  path: string;
  uf: UfCode;
}

export function CopyLinkButton({ path, uf }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackCopyLink(uf);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-sm border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline"
      aria-live="polite"
    >
      {copied ? "Link copiado" : "Copiar link"}
    </button>
  );
}
