import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ToastrModule } from "ngx-toastr";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  AvatarModule,
  BadgeModule,
  ButtonModule,
  CalloutModule,
  FormFieldModule,
  IconButtonModule,
  IconModule,
  MenuModule,
  TableModule,
  TabsModule,
} from "@bitwarden/components";

// Register the locales for the application
import "./locales";

/**
 * This NgModule should contain the most basic shared directives, pipes, and components. They
 * should be widely used by other modules to be considered for adding to this module. If in doubt
 * do not add to this module.
 *
 * See: https://angular.io/guide/module-types#shared-ngmodules
 */
@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    InfiniteScrollModule,
    JslibModule,
    ReactiveFormsModule,
    RouterModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    ToastrModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
    FormFieldModule,
    IconModule,
    TabsModule,
    TableModule,
    AvatarModule,
    IconButtonModule,
  ],
  exports: [
    CommonModule,
    AsyncActionsModule,
    DragDropModule,
    FormsModule,
    InfiniteScrollModule,
    JslibModule,
    ReactiveFormsModule,
    RouterModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    ToastrModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
    FormFieldModule,
    IconModule,
    TabsModule,
    TableModule,
    AvatarModule,
    IconButtonModule,
  ],
  providers: [DatePipe],
  bootstrap: [],
})
export class SharedModule {}
