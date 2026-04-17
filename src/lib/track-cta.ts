declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackCtaClick(page: string, component: string, position: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "cta_click", {
      event_category: "CTA",
      event_label: `${page}_${component}_${position}`,
      page,
      component,
      position,
    });
  }
}
