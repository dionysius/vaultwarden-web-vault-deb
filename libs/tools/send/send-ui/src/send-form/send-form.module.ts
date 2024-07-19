import { NgModule } from "@angular/core";

import { SendFormService } from "./abstractions/send-form.service";
import { SendFormComponent } from "./components/send-form.component";
import { DefaultSendFormService } from "./services/default-send-form.service";

@NgModule({
  imports: [SendFormComponent],
  providers: [
    {
      provide: SendFormService,
      useClass: DefaultSendFormService,
    },
  ],
  exports: [SendFormComponent],
})
export class SendFormModule {}
