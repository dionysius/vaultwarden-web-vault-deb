export class ForwarderOptions {
  apiKey: string;
  website: string;
  fastmail = new FastmailForwarderOptions();
  anonaddy = new AnonAddyForwarderOptions();
  forwardemail = new ForwardEmailForwarderOptions();
  simplelogin = new SimpleLoginForwarderOptions();
}

export class FastmailForwarderOptions {
  prefix: string;
}

export class AnonAddyForwarderOptions {
  domain: string;
  baseUrl: string;
}

export class ForwardEmailForwarderOptions {
  domain: string;
}

export class SimpleLoginForwarderOptions {
  baseUrl: string;
}
