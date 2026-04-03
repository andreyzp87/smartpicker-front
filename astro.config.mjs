// @ts-check
import "dotenv/config";

import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// Temporarily disabled; keep this handy in case we re-enable workerized scripts later.
// import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://smartpicker.io",
  integrations: [
    react(),
    // partytown(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
