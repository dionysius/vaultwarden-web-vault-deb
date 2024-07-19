import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { engine, services, strategies } from "@bitwarden/generator-core";
import { DefaultGeneratorNavigationService } from "@bitwarden/generator-navigation";

import { LegacyUsernameGenerationService } from "./legacy-username-generation.service";
import { UsernameGenerationServiceAbstraction } from "./username-generation.service.abstraction";

const { CryptoServiceRandomizer, UsernameRandomizer, EmailRandomizer, EmailCalculator } = engine;
const DefaultGeneratorService = services.DefaultGeneratorService;
const {
  CatchallGeneratorStrategy,
  SubaddressGeneratorStrategy,
  EffUsernameGeneratorStrategy,
  AddyIoForwarder,
  DuckDuckGoForwarder,
  FastmailForwarder,
  FirefoxRelayForwarder,
  ForwardEmailForwarder,
  SimpleLoginForwarder,
} = strategies;

export function legacyUsernameGenerationServiceFactory(
  apiService: ApiService,
  i18nService: I18nService,
  cryptoService: CryptoService,
  encryptService: EncryptService,
  policyService: PolicyService,
  accountService: AccountService,
  stateProvider: StateProvider,
): UsernameGenerationServiceAbstraction {
  const randomizer = new CryptoServiceRandomizer(cryptoService);
  const usernameRandomizer = new UsernameRandomizer(randomizer);
  const emailRandomizer = new EmailRandomizer(randomizer);
  const emailCalculator = new EmailCalculator();

  const effUsername = new DefaultGeneratorService(
    new EffUsernameGeneratorStrategy(usernameRandomizer, stateProvider),
    policyService,
  );

  const subaddress = new DefaultGeneratorService(
    new SubaddressGeneratorStrategy(emailCalculator, emailRandomizer, stateProvider),
    policyService,
  );

  const catchall = new DefaultGeneratorService(
    new CatchallGeneratorStrategy(emailCalculator, emailRandomizer, stateProvider),
    policyService,
  );

  const addyIo = new DefaultGeneratorService(
    new AddyIoForwarder(apiService, i18nService, encryptService, cryptoService, stateProvider),
    policyService,
  );

  const duckDuckGo = new DefaultGeneratorService(
    new DuckDuckGoForwarder(apiService, i18nService, encryptService, cryptoService, stateProvider),
    policyService,
  );

  const fastmail = new DefaultGeneratorService(
    new FastmailForwarder(apiService, i18nService, encryptService, cryptoService, stateProvider),
    policyService,
  );

  const firefoxRelay = new DefaultGeneratorService(
    new FirefoxRelayForwarder(
      apiService,
      i18nService,
      encryptService,
      cryptoService,
      stateProvider,
    ),
    policyService,
  );

  const forwardEmail = new DefaultGeneratorService(
    new ForwardEmailForwarder(
      apiService,
      i18nService,
      encryptService,
      cryptoService,
      stateProvider,
    ),
    policyService,
  );

  const simpleLogin = new DefaultGeneratorService(
    new SimpleLoginForwarder(apiService, i18nService, encryptService, cryptoService, stateProvider),
    policyService,
  );

  const navigation = new DefaultGeneratorNavigationService(stateProvider, policyService);

  return new LegacyUsernameGenerationService(
    accountService,
    navigation,
    catchall,
    effUsername,
    subaddress,
    addyIo,
    duckDuckGo,
    fastmail,
    firefoxRelay,
    forwardEmail,
    simpleLogin,
  );
}
