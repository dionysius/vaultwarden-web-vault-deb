import { parse } from "tldts";

export function isValidRpId(rpId: string, origin: string) {
  const parsedOrigin = parse(origin, { allowPrivateDomains: true });
  const parsedRpId = parse(rpId, { allowPrivateDomains: true });

  return (
    parsedOrigin.domain === parsedRpId.domain &&
    parsedOrigin.subdomain.endsWith(parsedRpId.subdomain)
  );
}
