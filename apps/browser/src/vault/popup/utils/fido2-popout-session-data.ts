import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

/**
 * Function to retrieve FIDO2 session data from query parameters.
 * Expected to be used within components tied to routes with these query parameters.
 */
export function fido2PopoutSessionData$() {
  const route = inject(ActivatedRoute);

  return route.queryParams.pipe(
    map((queryParams) => ({
      isFido2Session: queryParams.sessionId != null,
      sessionId: queryParams.sessionId as string,
      fallbackSupported: queryParams.fallbackSupported === "true",
      userVerification: queryParams.userVerification === "true",
      senderUrl: queryParams.senderUrl as string,
    })),
  );
}
