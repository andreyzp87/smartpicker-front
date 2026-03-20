import type { APIRoute } from "astro";
import { getCatalogPayload } from "../lib/catalog/server";

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = await getCatalogPayload();

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
