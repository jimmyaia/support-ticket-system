/**
 * Detects if the current page is being served from a tenant subdomain.
 * e.g. onetouch.aia-supportdesk.com → returns "onetouch"
 * Returns null on the root domain or localhost.
 */

export function useSubdomain(): string | null {
  const hostname = window.location.hostname;
  // Extract subdomain: anything before the first dot that is not "www"
  const parts = hostname.split(".");
  if (parts.length < 3) return null; // no subdomain
  const sub = parts[0];
  if (sub === "www") return null;
  // Make sure we are on aia-supportdesk.com (not manus.space dev URL)
  const rootDomain = parts.slice(1).join(".");
  if (rootDomain !== "aia-supportdesk.com") return null;
  return sub;
}
