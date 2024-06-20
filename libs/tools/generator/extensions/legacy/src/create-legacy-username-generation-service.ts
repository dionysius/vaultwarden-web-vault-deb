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

const DefaultGeneratorService = services.DefaultGeneratorService;
const CryptoServiceRandomizer = engine.CryptoServiceRandomizer;
const CatchallGeneratorStrategy = strategies.CatchallGeneratorStrategy;
const SubaddressGeneratorStrategy = strategies.SubaddressGeneratorStrategy;
const EffUsernameGeneratorStrategy = strategies.EffUsernameGeneratorStrategy;
const AddyIoForwarder = strategies.AddyIoForwarder;
const DuckDuckGoForwarder = strategies.DuckDuckGoForwarder;
const FastmailForwarder = strategies.FastmailForwarder;
const FirefoxRelayForwarder = strategies.FirefoxRelayForwarder;
const ForwardEmailForwarder = strategies.ForwardEmailForwarder;
const SimpleLoginForwarder = strategies.SimpleLoginForwarder;

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

  const effUsername = new DefaultGeneratorService(
    new EffUsernameGeneratorStrategy(randomizer, stateProvider),
    policyService,
  );

  const subaddress = new DefaultGeneratorService(
    new SubaddressGeneratorStrategy(randomizer, stateProvider),
    policyService,
  );

  const catchall = new DefaultGeneratorService(
    new CatchallGeneratorStrategy(randomizer, stateProvider),
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
