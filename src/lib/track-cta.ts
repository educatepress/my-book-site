declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props: Record<string, string> }) => void;
  }
}

export function trackCtaClick(page: string, component: string, position: string) {
  if (typeof window === "undefined") return;

  const label = `${page}_${component}_${position}`;

  if (window.gtag) {
    window.gtag("event", "cta_click", {
      event_category: "CTA",
      event_label: label,
      page,
      component,
      position,
    });
  }

  if (window.plausible) {
    window.plausible("CTA Click", { props: { label, page, position } });
  }
}
