/** Set NEXT_PUBLIC_SITE_URL to the real domain in production. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Files uploaded through the admin are served by a route handler, not the image optimizer. */
export const isUpload = (src: string) => src.startsWith("/media/");
