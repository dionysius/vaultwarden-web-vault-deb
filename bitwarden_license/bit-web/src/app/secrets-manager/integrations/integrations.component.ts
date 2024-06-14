import { Component } from "@angular/core";

import { IntegrationType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { Integration } from "./models/integration";

@Component({
  selector: "sm-integrations",
  templateUrl: "./integrations.component.html",
})
export class IntegrationsComponent {
  private integrationsAndSdks: Integration[] = [];

  constructor(i18nService: I18nService) {
    this.integrationsAndSdks = [
      {
        name: "Rust",
        linkText: i18nService.t("rustSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk",
        image: "../../../../../../../images/secrets-manager/sdks/rust.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/sdks/rust-white.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "GitHub Actions",
        linkText: i18nService.t("setUpGithubActions"),
        linkURL: "https://bitwarden.com/help/github-actions-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/github.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/integrations/github-white.svg",
        type: IntegrationType.Integration,
      },
      {
        name: "GitLab CI/CD",
        linkText: i18nService.t("setUpGitlabCICD"),
        linkURL: "https://bitwarden.com/help/gitlab-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/gitlab.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/integrations/gitlab-white.svg",
        type: IntegrationType.Integration,
      },
      {
        name: "Ansible",
        linkText: i18nService.t("setUpAnsible"),
        linkURL: "https://bitwarden.com/help/ansible-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/ansible.svg",
        type: IntegrationType.Integration,
      },
      {
        name: "C#",
        linkText: i18nService.t("cSharpSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/csharp",
        image: "../../../../../../../images/secrets-manager/sdks/c-sharp.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "C++",
        linkText: i18nService.t("cPlusPlusSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/cpp",
        image: "../../../../../../../images/secrets-manager/sdks/c-plus-plus.png",
        type: IntegrationType.SDK,
      },
      {
        name: "Go",
        linkText: i18nService.t("goSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/go",
        image: "../../../../../../../images/secrets-manager/sdks/go.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "Java",
        linkText: i18nService.t("javaSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/java",
        image: "../../../../../../../images/secrets-manager/sdks/java.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/sdks/java-white.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "JS WebAssembly",
        linkText: i18nService.t("jsWebAssemblySDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/js",
        image: "../../../../../../../images/secrets-manager/sdks/wasm.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "php",
        linkText: i18nService.t("phpSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/php",
        image: "../../../../../../../images/secrets-manager/sdks/php.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "Python",
        linkText: i18nService.t("pythonSDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/python",
        image: "../../../../../../../images/secrets-manager/sdks/python.svg",
        type: IntegrationType.SDK,
      },
      {
        name: "Ruby",
        linkText: i18nService.t("rubySDKRepo"),
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/ruby",
        image: "../../../../../../../images/secrets-manager/sdks/ruby.png",
        type: IntegrationType.SDK,
      },
      {
        name: "Kubernetes Operator",
        linkText: i18nService.t("setUpKubernetes"),
        linkURL: "https://bitwarden.com/help/secrets-manager-kubernetes-operator/",
        image: "../../../../../../../images/secrets-manager/integrations/kubernetes.svg",
        type: IntegrationType.Integration,
        newBadgeExpiration: "2024-8-12",
      },
    ];
  }

  /** Filter out content for the integrations sections */
  get integrations(): Integration[] {
    return this.integrationsAndSdks.filter(
      (integration) => integration.type === IntegrationType.Integration,
    );
  }

  /** Filter out content for the SDKs section */
  get sdks(): Integration[] {
    return this.integrationsAndSdks.filter(
      (integration) => integration.type === IntegrationType.SDK,
    );
  }
}
