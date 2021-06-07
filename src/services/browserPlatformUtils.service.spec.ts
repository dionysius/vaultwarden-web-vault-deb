import BrowserPlatformUtilsService from './browserPlatformUtils.service';

import { DeviceType } from 'jslib-common/enums/deviceType';

describe('Browser Utils Service', () => {
    describe('getBrowser', () => {
        const originalUserAgent = navigator.userAgent;
        const originalSafariAppExtension = (window as any).safariAppExtension;
        const originalOpr = (window as any).opr;

        // Reset the userAgent.
        afterAll(() => {
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
            });
            Object.defineProperty(window, 'safari', {
                value: originalSafariAppExtension,
            });
            Object.defineProperty(window, 'opr', {
                value: originalOpr,
            });
        });

        it('should detect chrome', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.ChromeExtension);
        });

        it('should detect firefox', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.FirefoxExtension);
        });

        it('should detect opera', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3175.3 Safari/537.36 OPR/49.0.2695.0 (Edition developer)',
            });

            Object.defineProperty(window, 'opr', {
                configurable: true,
                value: {},
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.OperaExtension);
        });

        it('should detect edge', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43',
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.EdgeExtension);
        });

        it('should detect safari', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8',
            });

            Object.defineProperty(window, 'safariAppExtension', {
                configurable: true,
                value: true,
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.SafariExtension);

            Object.defineProperty(window, 'safariAppExtension', {
                configurable: true,
                value: false,
            });
        });

        it('should detect vivaldi', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.97 Safari/537.36 Vivaldi/1.94.1008.40',
            });

            const browserPlatformUtilsService = new BrowserPlatformUtilsService(null, null, null);
            expect(browserPlatformUtilsService.getDevice()).toBe(DeviceType.VivaldiExtension);
        });
    });
});
