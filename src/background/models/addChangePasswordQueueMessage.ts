export default class addChangePasswordQueueMessage {
    type: string;
    cipherId: string;
    newPassword: string;
    domain: string;
    tabId: string;
    expires: Date;
    wasVaultLocked: boolean;
}
