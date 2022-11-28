import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ButtonComponent, ButtonModule } from "../button";
import { InputModule } from "../input/input.module";

import { BitFormFieldControl } from "./form-field-control";
import { BitFormFieldComponent } from "./form-field.component";
import { FormFieldModule } from "./form-field.module";
import { BitPasswordInputToggleDirective } from "./password-input-toggle.directive";

@Component({
  selector: "test-form-field",
  template: `
    <form>
      <bit-form-field>
        <bit-label>Password</bit-label>
        <input bitInput type="password" />
        <button type="button" bitButton bitSuffix bitPasswordInputToggle></button>
      </bit-form-field>
    </form>
  `,
})
class TestFormFieldComponent {}

describe("PasswordInputToggle", () => {
  let fixture: ComponentFixture<TestFormFieldComponent>;
  let button: ButtonComponent;
  let input: BitFormFieldControl;
  let toggle: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldModule, ButtonModule, InputModule],
      declarations: [TestFormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormFieldComponent);
    fixture.detectChanges();

    toggle = fixture.debugElement.query(By.directive(BitPasswordInputToggleDirective));
    const buttonEl = fixture.debugElement.query(By.directive(ButtonComponent));
    button = buttonEl.componentInstance;
    const formFieldEl = fixture.debugElement.query(By.directive(BitFormFieldComponent));
    const formField: BitFormFieldComponent = formFieldEl.componentInstance;
    input = formField.input;
  });

  describe("initial state", () => {
    it("has correct icon", () => {
      expect(button.icon).toBe("bwi-eye");
    });

    it("input is type password", () => {
      expect(input.type).toBe("password");
    });

    it("spellcheck is disabled", () => {
      expect(input.spellcheck).toBe(undefined);
    });
  });

  describe("when toggled", () => {
    beforeEach(() => {
      toggle.triggerEventHandler("click");
    });

    it("has correct icon", () => {
      expect(button.icon).toBe("bwi-eye-slash");
    });

    it("input is type text", () => {
      expect(input.type).toBe("text");
    });

    it("spellcheck is disabled", () => {
      expect(input.spellcheck).toBe(false);
    });
  });

  describe("when toggled twice", () => {
    beforeEach(() => {
      toggle.triggerEventHandler("click");
      toggle.triggerEventHandler("click");
    });

    it("has correct icon", () => {
      expect(button.icon).toBe("bwi-eye");
    });

    it("input is type password", () => {
      expect(input.type).toBe("password");
    });

    it("spellcheck is disabled", () => {
      expect(input.spellcheck).toBe(undefined);
    });
  });
});
