export const SITE_URL = "https://rexxon.ai";

export type Crumb = { name: string; path: string };

/**
 * Returns a TanStack head scripts[] entry containing BreadcrumbList JSON-LD.
 * Always start the list with { name: "Home", path: "/" }.
 */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    }),
  };
}
