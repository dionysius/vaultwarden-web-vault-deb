import MainBackground from './main.background';
import NotificationBackground from './notification.background';

export default class TabsBackground {
    constructor(private main: MainBackground, private notificationBackground: NotificationBackground) {
    }

    async init() {
        if (!chrome.tabs) {
            return;
        }

        chrome.tabs.onActivated.addListener(async (activeInfo: chrome.tabs.TabActiveInfo) => {
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabActivated');
            this.main.messagingService.send('tabChanged');
        });

        chrome.tabs.onReplaced.addListener(async (addedTabId: number, removedTabId: number) => {
            if (this.main.onReplacedRan) {
                return;
            }
            this.main.onReplacedRan = true;
            await this.notificationBackground.checkNotificationQueue();
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabReplaced');
            this.main.messagingService.send('tabChanged');
        });

        chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
            if (this.main.onUpdatedRan) {
                return;
            }
            this.main.onUpdatedRan = true;
            await this.notificationBackground.checkNotificationQueue(tab);
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabUpdated');
            this.main.messagingService.send('tabChanged');
        });
    }
}
