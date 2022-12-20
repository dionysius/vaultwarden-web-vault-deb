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
  DialogModule,
  FormFieldModule,
  IconButtonModule,
  IconModule,
  MenuModule,
  LinkModule,
  NavigationModule,
  TableModule,
  TabsModule,
  ColorPasswordModule,
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
    ReactiveFormsModule,
    InfiniteScrollModule,
    RouterModule,
    ToastrModule,
    JslibModule,

    // Component library
    AsyncActionsModule,
    AvatarModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    DialogModule,
    FormFieldModule,
    IconButtonModule,
    IconModule,
    MenuModule,
    NavigationModule,
    TableModule,
    TabsModule,
    LinkModule,
    ColorPasswordModule,

    // Web specific
  ],
  exports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    RouterModule,
    ToastrModule,
    JslibModule,

    // Component library
    AsyncActionsModule,
    AvatarModule,
    BadgeModule,
    ButtonModule,
    CalloutModule,
    DialogModule,
    FormFieldModule,
    IconButtonModule,
    IconModule,
    MenuModule,
    NavigationModule,
    TableModule,
    TabsModule,
    LinkModule,
    ColorPasswordModule,

    // Web specific
  ],
  providers: [DatePipe],
  bootstrap: [],
})
export class SharedModule {}
