export default defineNuxtConfig({
  // @ts-ignore
  extends: ["docus"], // Extended from Docus framework (reloading v4)
  // future: {
  //   compatibilityVersion: 5,
  // },
  modules: ["@nuxtjs/i18n", "@nuxt/ui"],
  i18n: {
    langDir: "locales",
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "fr", name: "Français", language: "fr-FR", file: "fr.json" },
    ],
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  compatibilityDate: "2026-01-13",
  css: ["~/assets/css/main.css"],
  content: {
    // @ts-ignore
    documentDriven: true,
  },
  app: {
    baseURL: process.env.NODE_ENV === "production" ? "/docs-beta/" : "/",
  },
  nitro: {
    preset: "github_pages",
  },
  robots: {
    robotsTxt: false,
  },
  llms: {
    domain: "https://digishareinc.github.io",
  },
});
