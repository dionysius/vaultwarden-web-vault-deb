import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs";

import { VerticalStepperComponent } from "../vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-trial",
  templateUrl: "trial-initiation.component.html",
})
export class TrialInitiationComponent implements OnInit {
  email = "";
  org = "teams";
  orgInfoSubLabel = "";
  @ViewChild("stepper", { static: true }) verticalStepper: VerticalStepperComponent;

  orgInfoFormGroup = this.formBuilder.group({
    name: ["", [Validators.required]],
    additionalStorage: [0, [Validators.min(0), Validators.max(99)]],
    additionalSeats: [0, [Validators.min(0), Validators.max(100000)]],
    businessName: [""],
    plan: [],
    product: [],
  });

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private titleCasePipe: TitleCasePipe
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(first()).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }
      if (qParams.org) {
        this.org = qParams.org;
      }
    });
  }

  stepSelectionChange(event: StepperSelectionEvent) {
    // Set org info sub label
    if (event.selectedIndex === 1 && this.orgInfoFormGroup.controls.name.value === "") {
      this.orgInfoSubLabel =
        "Enter your " + this.titleCasePipe.transform(this.org) + " organization information";
    } else if (event.previouslySelectedIndex === 1) {
      this.orgInfoSubLabel = this.orgInfoFormGroup.controls.name.value;
    }
  }

  createdAccount(email: string) {
    this.email = email;
    this.verticalStepper.next();
  }
}
