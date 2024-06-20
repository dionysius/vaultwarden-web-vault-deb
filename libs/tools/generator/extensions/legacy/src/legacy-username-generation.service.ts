import { zip, firstValueFrom, map, concatMap, combineLatest } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import {
  ApiOptions,
  EmailDomainOptions,
  EmailPrefixOptions,
  RequestOptions,
  SelfHostedApiOptions,
  NoPolicy,
  GeneratorService,
  CatchallGenerationOptions,
  EffUsernameGenerationOptions,
  Forwarders,
  SubaddressGenerationOptions,
} from "@bitwarden/generator-core";
import { GeneratorNavigationService, GeneratorNavigation } from "@bitwarden/generator-navigation";

import { UsernameGeneratorOptions } from "./username-generation-options";
import { UsernameGenerationServiceAbstraction } from "./username-generation.service.abstraction";

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

  getOptions$() {
    // look upon my works, ye mighty, and despair!
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((account) =>
        combineLatest([
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
        ]),
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

    return options$;
  }

  getOptions() {
    return firstValueFrom(this.getOptions$());
  }

  async saveOptions(options: UsernameGeneratorOptions) {
    const stored = this.toStoredOptions(options);
    const activeAccount = await firstValueFrom(this.accountService.activeAccount$);

    // generator settings needs to preserve whether password or passphrase is selected,
    // so `navigationOptions` is mutated.
    const navigationOptions$ = zip(
      this.navigation.options$(activeAccount.id),
      this.navigation.defaults$(activeAccount.id),
    ).pipe(map(([options, defaults]) => options ?? defaults));
    let navigationOptions = await firstValueFrom(navigationOptions$);
    navigationOptions = Object.assign(navigationOptions, stored.generator);
    await this.navigation.saveOptions(activeAccount.id, navigationOptions);

    // overwrite all other settings with latest values
    await Promise.all([
      this.catchall.saveOptions(activeAccount.id, stored.algorithms.catchall),
      this.effUsername.saveOptions(activeAccount.id, stored.algorithms.effUsername),
      this.subaddress.saveOptions(activeAccount.id, stored.algorithms.subaddress),
      this.addyIo.saveOptions(activeAccount.id, stored.forwarders.addyIo),
      this.duckDuckGo.saveOptions(activeAccount.id, stored.forwarders.duckDuckGo),
      this.fastmail.saveOptions(activeAccount.id, stored.forwarders.fastmail),
      this.firefoxRelay.saveOptions(activeAccount.id, stored.forwarders.firefoxRelay),
      this.forwardEmail.saveOptions(activeAccount.id, stored.forwarders.forwardEmail),
      this.simpleLogin.saveOptions(activeAccount.id, stored.forwarders.simpleLogin),
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
