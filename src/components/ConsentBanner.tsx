"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  readStoredConsent,
  updateAnalyticsConsent,
  writeStoredConsent,
  type GaConsent,
} from "@/lib/analytics";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "ga_consent" || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyConsentChange() {
  listeners.forEach((l) => l());
}

function getClientConsent(): GaConsent | null {
  return readStoredConsent();
}

function getServerConsent(): GaConsent | null | "ssr" {
  return "ssr";
}

export function ConsentBanner() {
  const stored = useSyncExternalStore(
    subscribe,
    getClientConsent,
    getServerConsent,
  );
  const [dismissed, setDismissed] = useState(false);

  const choose = useCallback((value: GaConsent) => {
    writeStoredConsent(value);
    updateAnalyticsConsent(value === "granted");
    notifyConsentChange();
    setDismissed(true);
  }, []);

  if (stored === "ssr" || dismissed || stored !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies e analytics"
      className="fixed inset-x-0 bottom-14 z-[60] px-3 sm:bottom-16 sm:px-5"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 rounded-sm border border-[var(--line)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-panel)] sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--fg-muted)]">
          Usamos analytics anônimos (Google Analytics 4) para entender o uso do
          mapa. Sem consentimento, não armazenamos cookies de medição.{" "}
          <Link
            href="/privacidade"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Política de privacidade
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-sm border border-[var(--line)] px-3 py-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-sm bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
