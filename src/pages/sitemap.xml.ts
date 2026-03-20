import type { APIRoute } from "astro";

import { getSitemapEntries } from "../lib/sitemap";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toCanonicalUrl(path: string, site: URL): string {
  const pathname = path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
  return new URL(pathname, site).toString();
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl =
    site ??
    new URL(import.meta.env.PUBLIC_SITE_URL || "https://smartpicker.io");
  const entries = await getSitemapEntries();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => {
      const fields = [
        `<loc>${escapeXml(toCanonicalUrl(entry.path, baseUrl))}</loc>`,
        entry.lastModified
          ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `<url>${fields}</url>`;
    }),
    "</urlset>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
