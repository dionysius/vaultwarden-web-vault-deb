export class ForwarderOptions {
  apiKey: string;
  website: string;
  fastmail = new FastmailForwarderOptions();
  anonaddy = new AnonAddyForwarderOptions();
}

export class FastmailForwarderOptions {
  prefix: string;
}

export class AnonAddyForwarderOptions {
  domain: string;
}
