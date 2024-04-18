import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { mock } from "jest-mock-extended";
import { of } from "rxjs";

import { SYSTEM_THEME_OBSERVABLE } from "../../../../../../../libs/angular/src/services/injection-tokens";
import { IntegrationType } from "../../../../../../../libs/common/src/enums";
import { ThemeType } from "../../../../../../../libs/common/src/platform/enums";
import { ThemeStateService } from "../../../../../../../libs/common/src/platform/theming/theme-state.service";
import { IntegrationCardComponent } from "../integration-card/integration-card.component";
import { Integration } from "../models/integration";

import { IntegrationGridComponent } from "./integration-grid.component";

describe("IntegrationGridComponent", () => {
  let component: IntegrationGridComponent;
  let fixture: ComponentFixture<IntegrationGridComponent>;
  const integrations: Integration[] = [
    {
      name: "Integration 1",
      image: "test-image1.png",
      linkText: "Get started with integration 1",
      linkURL: "https://example.com/1",
      type: IntegrationType.Integration,
    },
    {
      name: "SDK 2",
      image: "test-image2.png",
      linkText: "View SDK 2",
      linkURL: "https://example.com/2",
      type: IntegrationType.SDK,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegrationGridComponent, IntegrationCardComponent],
      providers: [
        {
          provide: ThemeStateService,
          useValue: mock<ThemeStateService>(),
        },
        {
          provide: SYSTEM_THEME_OBSERVABLE,
          useValue: of(ThemeType.Light),
        },
      ],
    });

    fixture = TestBed.createComponent(IntegrationGridComponent);
    component = fixture.componentInstance;
    component.integrations = integrations;
    fixture.detectChanges();
  });

  it("lists all integrations", () => {
    expect(component.integrations).toEqual(integrations);

    const cards = fixture.debugElement.queryAll(By.directive(IntegrationCardComponent));

    expect(cards.length).toBe(integrations.length);
  });

  it("assigns the correct attributes to IntegrationCardComponent", () => {
    expect(component.integrations).toEqual(integrations);

    const card = fixture.debugElement.queryAll(By.directive(IntegrationCardComponent))[1];

    expect(card.componentInstance.name).toBe("SDK 2");
    expect(card.componentInstance.image).toBe("test-image2.png");
    expect(card.componentInstance.linkText).toBe("View SDK 2");
    expect(card.componentInstance.linkURL).toBe("https://example.com/2");
  });

  it("assigns `externalURL` for SDKs", () => {
    const card = fixture.debugElement.queryAll(By.directive(IntegrationCardComponent));

    expect(card[0].componentInstance.externalURL).toBe(false);
    expect(card[1].componentInstance.externalURL).toBe(true);
  });
});
