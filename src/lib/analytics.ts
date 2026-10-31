export const GA_CONSENT_KEY = "ga_consent";

export type GaConsent = "granted" | "denied";

export type SuggestLocation = "header" | "drawer_empty" | "footer" | "sobre";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_GA_DEBUG === "true";
  }
  return Boolean(process.env.NEXT_PUBLIC_GA_ID);
}

/**
 * Envia evento ao GA4 via gtag. No-op no servidor, em dev (salvo debug)
 * e se o gtag estiver ausente/bloqueado.
 */
export function trackEvent(name: string, params?: EventParams): void {
  if (!canTrack()) return;
  try {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params ?? {});
  } catch {
    // adblock / consent / gtag indisponível
  }
}

export function trackOpenState(uf: string): void {
  trackEvent("open_state", { uf });
}

export function trackChangeCategory(uf: string, category: string): void {
  trackEvent("change_category", { uf, category });
}

export function trackClickSource(params: {
  uf: string;
  category: string;
  source_name: string;
}): void {
  trackEvent("click_source", params);
}

export function trackClickSuggest(
  location: SuggestLocation,
  uf?: string | null,
): void {
  trackEvent("click_suggest", {
    location,
    ...(uf ? { uf } : {}),
  });
}

export function trackCopyLink(uf: string): void {
  trackEvent("copy_link", { uf });
}

/** Reservado: UI de filtro de data ainda não existe. */
export function trackApplyDateFilter(from: string, to: string): void {
  trackEvent("apply_date_filter", { from, to });
}

let dateFilterTimer: ReturnType<typeof setTimeout> | null = null;

/** Helper com debounce para quando o filtro de data voltar à UI. */
export function trackApplyDateFilterDebounced(
  from: string,
  to: string,
  ms = 400,
): void {
  if (dateFilterTimer) clearTimeout(dateFilterTimer);
  dateFilterTimer = setTimeout(() => {
    trackApplyDateFilter(from, to);
    dateFilterTimer = null;
  }, ms);
}

export function readStoredConsent(): GaConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(GA_CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* private mode */
  }
  return null;
}

export function writeStoredConsent(value: GaConsent): void {
  try {
    localStorage.setItem(GA_CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

export function updateAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  } catch {
    /* ignore */
  }
}
