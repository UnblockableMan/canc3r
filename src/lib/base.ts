// Resolve an asset path against the deploy base (GitHub Pages project subpath).
// `/logo.svg` alone 404s when the site lives at /C3/ — this fixes that.

// Build-time basePath (set via NEXT_PUBLIC_BASE_PATH env var). On the live
// GitHub Pages deploy this is "/C3". On localhost dev it's empty.
const BUILD_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function getBasePath(): string {
  // Prefer the build-time basePath — it's reliable on both SSR and client.
  if (BUILD_BASE_PATH) return BUILD_BASE_PATH.endsWith("/") ? BUILD_BASE_PATH : BUILD_BASE_PATH + "/";
  if (typeof window === "undefined") return "/";
  const p = window.location.pathname.replace(/[^/]*$/, "");
  return p.endsWith("/") ? p : p + "/";
}

export function withBase(path: string): string {
  return getBasePath() + path.replace(/^\//, "");
}
