import { zip, firstValueFrom, map, concatMap } from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { AccountService } from "../../auth/abstractions/account.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { StateProvider } from "../../platform/state";

import { GeneratorService, GeneratorNavigationService } from "./abstractions";
import { UsernameGenerationServiceAbstraction } from "./abstractions/username-generation.service.abstraction";
import { DefaultGeneratorService } from "./default-generator.service";
import { DefaultGeneratorNavigationService } from "./navigation/default-generator-navigation.service";
import { GeneratorNavigation } from "./navigation/generator-navigation";
import { NoPolicy } from "./no-policy";
import {
  CatchallGeneratorStrategy,
  SubaddressGeneratorStrategy,
  EffUsernameGeneratorStrategy,
} from "./username";
import { CatchallGenerationOptions } from "./username/catchall-generator-options";
import { EffUsernameGenerationOptions } from "./username/eff-username-generator-options";
import { AddyIoForwarder } from "./username/forwarders/addy-io";
import { DuckDuckGoForwarder } from "./username/forwarders/duck-duck-go";
import { FastmailForwarder } from "./username/forwarders/fastmail";
import { FirefoxRelayForwarder } from "./username/forwarders/firefox-relay";
import { ForwardEmailForwarder } from "./username/forwarders/forward-email";
import { SimpleLoginForwarder } from "./username/forwarders/simple-login";
import { Forwarders } from "./username/options/constants";
import {
  ApiOptions,
  EmailDomainOptions,
  EmailPrefixOptions,
  RequestOptions,
  SelfHostedApiOptions,
} from "./username/options/forwarder-options";
import { SubaddressGenerationOptions } from "./username/subaddress-generator-options";
import { UsernameGeneratorOptions } from "./username/username-generation-options";
import { UsernameGenerationService } from "./username/username-generation.service";

type MappedOptions = {
  generator: GeneratorNavigation;
  algorithms: {
    catchall: CatchallGenerationOptions;
    effUsername: EffUsernameGenerationOptions;
    subaddress: SubaddressGenerationOptions;
  };
  forwarders: {
    addyIo: SelfHostedApiOptions & EmailDomainOptions & RequestOptions;
    duckDuckGo: ApiOptions & RequestOptions;
    fastmail: ApiOptions & EmailPrefixOptions & RequestOptions;
    firefoxRelay: ApiOptions & RequestOptions;
    forwardEmail: ApiOptions & EmailDomainOptions & RequestOptions;
    simpleLogin: SelfHostedApiOptions & RequestOptions;
  };
};

export function legacyPasswordGenerationServiceFactory(
  apiService: ApiService,
  i18nService: I18nService,
  cryptoService: CryptoService,
  encryptService: EncryptService,
  policyService: PolicyService,
  accountService: AccountService,
  stateProvider: StateProvider,
): UsernameGenerationServiceAbstraction {
  // FIXME: Once the username generation service is replaced with this service
  // in the clients, factor out the deprecated service in its entirety.
  const deprecatedService = new UsernameGenerationService(cryptoService, null, null);

  const effUsername = new DefaultGeneratorService(
    new EffUsernameGeneratorStrategy(deprecatedService, stateProvider),
    policyService,
  );

  const subaddress = new DefaultGeneratorService(
    new SubaddressGeneratorStrategy(deprecatedService, stateProvider),
    policyService,
  );

  const catchall = new DefaultGeneratorService(
    new CatchallGeneratorStrategy(deprecatedService, stateProvider),
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

/** Adapts the generator 2.0 design to 1.0 angular services. */
export class LegacyUsernameGenerationService implements UsernameGenerationServiceAbstraction {
  constructor(
    private readonly accountService: AccountService,
    private readonly navigation: GeneratorNavigationService,
    private readonly catchall: GeneratorService<CatchallGenerationOptions, NoPolicy>,
    private readonly effUsername: GeneratorService<EffUsernameGenerationOptions, NoPolicy>,
    private readonly subaddress: GeneratorService<SubaddressGenerationOptions, NoPolicy>,
    private readonly addyIo: GeneratorService<SelfHostedApiOptions & EmailDomainOptions, NoPolicy>,
    private readonly duckDuckGo: GeneratorService<ApiOptions, NoPolicy>,
    private readonly fastmail: GeneratorService<ApiOptions & EmailPrefixOptions, NoPolicy>,
    private readonly firefoxRelay: GeneratorService<ApiOptions, NoPolicy>,
    private readonly forwardEmail: GeneratorService<ApiOptions & EmailDomainOptions, NoPolicy>,
    private readonly simpleLogin: GeneratorService<SelfHostedApiOptions, NoPolicy>,
  ) {}

  generateUsername(options: UsernameGeneratorOptions) {
    if (options.type === "catchall") {
      return this.generateCatchall(options);
    } else if (options.type === "subaddress") {
      return this.generateSubaddress(options);
    } else if (options.type === "forwarded") {
      return this.generateForwarded(options);
    } else {
      return this.generateWord(options);
    }
  }

  generateWord(options: UsernameGeneratorOptions) {
    return this.effUsername.generate(options);
  }

  generateSubaddress(options: UsernameGeneratorOptions) {
    return this.subaddress.generate(options);
  }

  generateCatchall(options: UsernameGeneratorOptions) {
    return this.catchall.generate(options);
  }

  generateForwarded(options: UsernameGeneratorOptions) {
    if (!options.forwardedService) {
      return null;
    }

    const stored = this.toStoredOptions(options);
    switch (options.forwardedService) {
      case Forwarders.AddyIo.id:
        return this.addyIo.generate(stored.forwarders.addyIo);
      case Forwarders.DuckDuckGo.id:
        return this.duckDuckGo.generate(stored.forwarders.duckDuckGo);
      case Forwarders.Fastmail.id:
        return this.fastmail.generate(stored.forwarders.fastmail);
      case Forwarders.FirefoxRelay.id:
        return this.firefoxRelay.generate(stored.forwarders.firefoxRelay);
      case Forwarders.ForwardEmail.id:
        return this.forwardEmail.generate(stored.forwarders.forwardEmail);
      case Forwarders.SimpleLogin.id:
        return this.simpleLogin.generate(stored.forwarders.simpleLogin);
    }
  }

  getOptions() {
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((account) =>
        zip(
          this.navigation.options$(account.id),
          this.navigation.defaults$(account.id),
          this.catchall.options$(account.id),
          this.catchall.defaults$(account.id),
          this.effUsername.options$(account.id),
          this.effUsername.defaults$(account.id),
          this.subaddress.options$(account.id),
          this.subaddress.defaults$(account.id),
          this.addyIo.options$(account.id),
          this.addyIo.defaults$(account.id),
          this.duckDuckGo.options$(account.id),
          this.duckDuckGo.defaults$(account.id),
          this.fastmail.options$(account.id),
          this.fastmail.defaults$(account.id),
          this.firefoxRelay.options$(account.id),
          this.firefoxRelay.defaults$(account.id),
          this.forwardEmail.options$(account.id),
          this.forwardEmail.defaults$(account.id),
          this.simpleLogin.options$(account.id),
          this.simpleLogin.defaults$(account.id),
        ),
      ),
      map(
        ([
          generatorOptions,
          generatorDefaults,
          catchallOptions,
          catchallDefaults,
          effUsernameOptions,
          effUsernameDefaults,
          subaddressOptions,
          subaddressDefaults,
          addyIoOptions,
          addyIoDefaults,
          duckDuckGoOptions,
          duckDuckGoDefaults,
          fastmailOptions,
          fastmailDefaults,
          firefoxRelayOptions,
          firefoxRelayDefaults,
          forwardEmailOptions,
          forwardEmailDefaults,
          simpleLoginOptions,
          simpleLoginDefaults,
        ]) =>
          this.toUsernameOptions({
            generator: generatorOptions ?? generatorDefaults,
            algorithms: {
              catchall: catchallOptions ?? catchallDefaults,
              effUsername: effUsernameOptions ?? effUsernameDefaults,
              subaddress: subaddressOptions ?? subaddressDefaults,
            },
            forwarders: {
              addyIo: addyIoOptions ?? addyIoDefaults,
              duckDuckGo: duckDuckGoOptions ?? duckDuckGoDefaults,
              fastmail: fastmailOptions ?? fastmailDefaults,
              firefoxRelay: firefoxRelayOptions ?? firefoxRelayDefaults,
              forwardEmail: forwardEmailOptions ?? forwardEmailDefaults,
              simpleLogin: simpleLoginOptions ?? simpleLoginDefaults,
            },
          }),
      ),
    );

    return firstValueFrom(options$);
  }

  async saveOptions(options: UsernameGeneratorOptions) {
    const stored = this.toStoredOptions(options);
    const userId = await firstValueFrom(this.accountService.activeAccount$.pipe(map((a) => a.id)));

    // generator settings needs to preserve whether password or passphrase is selected,
    // so `navigationOptions` is mutated.
    let navigationOptions = await firstValueFrom(this.navigation.options$(userId));
    navigationOptions = Object.assign(navigationOptions, stored.generator);
    await this.navigation.saveOptions(userId, navigationOptions);

    // overwrite all other settings with latest values
    await Promise.all([
      this.catchall.saveOptions(userId, stored.algorithms.catchall),
      this.effUsername.saveOptions(userId, stored.algorithms.effUsername),
      this.subaddress.saveOptions(userId, stored.algorithms.subaddress),
      this.addyIo.saveOptions(userId, stored.forwarders.addyIo),
      this.duckDuckGo.saveOptions(userId, stored.forwarders.duckDuckGo),
      this.fastmail.saveOptions(userId, stored.forwarders.fastmail),
      this.firefoxRelay.saveOptions(userId, stored.forwarders.firefoxRelay),
      this.forwardEmail.saveOptions(userId, stored.forwarders.forwardEmail),
      this.simpleLogin.saveOptions(userId, stored.forwarders.simpleLogin),
    ]);
  }

  private toStoredOptions(options: UsernameGeneratorOptions) {
    const forwarders = {
      addyIo: {
        baseUrl: options.forwardedAnonAddyBaseUrl,
        token: options.forwardedAnonAddyApiToken,
        domain: options.forwardedAnonAddyDomain,
        website: options.website,
      },
      duckDuckGo: {
        token: options.forwardedDuckDuckGoToken,
        website: options.website,
      },
      fastmail: {
        token: options.forwardedFastmailApiToken,
        website: options.website,
      },
      firefoxRelay: {
        token: options.forwardedFirefoxApiToken,
        website: options.website,
      },
      forwardEmail: {
        token: options.forwardedForwardEmailApiToken,
        domain: options.forwardedForwardEmailDomain,
        website: options.website,
      },
      simpleLogin: {
        token: options.forwardedSimpleLoginApiKey,
        baseUrl: options.forwardedSimpleLoginBaseUrl,
        website: options.website,
      },
    };

    const generator = {
      username: options.type,
      forwarder: options.forwardedService,
    };

    const algorithms = {
      effUsername: {
        wordCapitalize: options.wordCapitalize,
        wordIncludeNumber: options.wordIncludeNumber,
        website: options.website,
      },
      subaddress: {
        subaddressType: options.subaddressType,
        subaddressEmail: options.subaddressEmail,
        website: options.website,
      },
      catchall: {
        catchallType: options.catchallType,
        catchallDomain: options.catchallDomain,
        website: options.website,
      },
    };

    return { generator, algorithms, forwarders } as MappedOptions;
  }

  private toUsernameOptions(options: MappedOptions) {
    return {
      type: options.generator.username,
      wordCapitalize: options.algorithms.effUsername.wordCapitalize,
      wordIncludeNumber: options.algorithms.effUsername.wordIncludeNumber,
      subaddressType: options.algorithms.subaddress.subaddressType,
      subaddressEmail: options.algorithms.subaddress.subaddressEmail,
      catchallType: options.algorithms.catchall.catchallType,
      catchallDomain: options.algorithms.catchall.catchallDomain,
      forwardedService: options.generator.forwarder,
      forwardedAnonAddyApiToken: options.forwarders.addyIo.token,
      forwardedAnonAddyDomain: options.forwarders.addyIo.domain,
      forwardedAnonAddyBaseUrl: options.forwarders.addyIo.baseUrl,
      forwardedDuckDuckGoToken: options.forwarders.duckDuckGo.token,
      forwardedFirefoxApiToken: options.forwarders.firefoxRelay.token,
      forwardedFastmailApiToken: options.forwarders.fastmail.token,
      forwardedForwardEmailApiToken: options.forwarders.forwardEmail.token,
      forwardedForwardEmailDomain: options.forwarders.forwardEmail.domain,
      forwardedSimpleLoginApiKey: options.forwarders.simpleLogin.token,
      forwardedSimpleLoginBaseUrl: options.forwarders.simpleLogin.baseUrl,
    } as UsernameGeneratorOptions;
  }
}
