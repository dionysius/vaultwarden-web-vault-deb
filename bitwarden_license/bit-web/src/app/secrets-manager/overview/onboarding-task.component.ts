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

  handleClick(ev: MouseEvent) {
    /**
     * If the main `ng-content` is clicked, we don't want to trigger the task's click handler.
     */
    ev.stopPropagation();
  }
}
