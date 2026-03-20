import type { APIRoute } from "astro";
import { getSearchPayload } from "../lib/search/server";

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = await getSearchPayload();

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
