export default class AddLoginQueueMessage {
    type: string;
    username: string;
    password: string;
    domain: string;
    uri: string;
    tabId: string;
    expires: Date;
    wasVaultLocked: boolean;
}
