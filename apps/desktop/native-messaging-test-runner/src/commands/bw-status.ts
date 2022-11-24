import "module-alias/register";

import { NativeMessagingVersion } from "@bitwarden/common/enums/nativeMessagingVersion";

import { LogUtils } from "../log-utils";
import NativeMessageService from "../native-message.service";
import * as config from "../variables";

(async () => {
  const nativeMessageService = new NativeMessageService(NativeMessagingVersion.One);

  LogUtils.logInfo("Sending Handshake");
  const handshakeResponse = await nativeMessageService.sendHandshake(
    config.testRsaPublicKey,
    config.applicationName
  );
  LogUtils.logSuccess("Received response to handshake request");

  if (!handshakeResponse.status) {
    LogUtils.logError(" Handshake failed. Error was: " + handshakeResponse.error);
    nativeMessageService.disconnect();
    return;
  }
  LogUtils.logSuccess("Handshake success response");
  const status = await nativeMessageService.checkStatus(handshakeResponse.sharedKey);

  LogUtils.logSuccess("Status output is: ", status);
  nativeMessageService.disconnect();
})();
