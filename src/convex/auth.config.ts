const DOMAIN =
  process.env.CONVEX_SITE_URL ||
  (process.env as any).VITE_CONVEX_SITE_URL ||
  (process.env as any).VITE_PUBLIC_URL ||
  (process.env as any).VITE_APP_URL ||
  (process.env as any).VITE_SITE_URL ||
  "http://localhost:5173";

export default {
  providers: [
    {
      domain: DOMAIN,
      applicationID: "convex",
    },
  ],
};