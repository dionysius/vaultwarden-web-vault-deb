import { Component, Input } from "@angular/core";

@Component({
  selector: "sm-onboarding-task",
  templateUrl: "./onboarding-task.component.html",
  host: {
    class: "tw-max-w-max",
  },
})
export class OnboardingTaskComponent {
  @Input()
  completed = false;

  @Input()
  icon = "bwi-info-circle";

  @Input()
  title: string;

  @Input()
  route: string | any[];
}
