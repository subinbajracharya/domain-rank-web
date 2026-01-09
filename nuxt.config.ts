export default defineNuxtConfig({
  css: ["bootstrap/dist/css/bootstrap.min.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      title: "Domain Ranking Application",
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3002",
    },
  },
});
