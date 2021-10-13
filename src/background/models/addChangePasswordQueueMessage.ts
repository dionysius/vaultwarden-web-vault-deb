export default class AddChangePasswordQueueMessage {
    type: string;
    cipherId: string;
    newPassword: string;
    domain: string;
    tabId: string;
    expires: Date;
    wasVaultLocked: boolean;
}
