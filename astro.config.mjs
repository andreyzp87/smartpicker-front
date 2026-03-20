// @ts-check
import "dotenv/config";

import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://smartpicker.io",
  integrations: [react(), partytown()],
  vite: {
    plugins: [tailwindcss()],
  },
});
