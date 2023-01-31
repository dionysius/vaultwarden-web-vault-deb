import { Pipe, PipeTransform } from "@angular/core";

import { GroupView } from "../../../../app/organizations/core";

@Pipe({
  name: "groupNameFromId",
  pure: true,
})
export class GetGroupNameFromIdPipe implements PipeTransform {
  transform(value: string, groups: GroupView[]) {
    return groups.find((o) => o.id === value)?.name;
  }
}
