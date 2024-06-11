import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

/** a mock {@link ApiService} that returns a fetch-like response with a given status and body */
export function mockApiService(status: number, body: any, statusText?: string) {
  return {
    nativeFetch: jest.fn().mockImplementation((r: Request) => {
      return {
        status,
        statusText,
        json: jest.fn().mockImplementation(() => Promise.resolve(body)),
      };
    }),
  } as unknown as ApiService;
}

/**  a mock {@link I18nService} that returns the translation key */
export function mockI18nService() {
  return {
    t: jest.fn().mockImplementation((key: string) => key),
  } as unknown as I18nService;
}
