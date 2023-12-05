import { GlobalStateProvider } from "../global-state.provider";
import { StateProvider } from "../state.provider";
import { ActiveUserStateProvider, SingleUserStateProvider } from "../user-state.provider";

export class DefaultStateProvider implements StateProvider {
  constructor(
    private readonly activeUserStateProvider: ActiveUserStateProvider,
    private readonly singleUserStateProvider: SingleUserStateProvider,
    private readonly globalStateProvider: GlobalStateProvider,
  ) {}

  getActive: InstanceType<typeof ActiveUserStateProvider>["get"] =
    this.activeUserStateProvider.get.bind(this.activeUserStateProvider);
  getUser: InstanceType<typeof SingleUserStateProvider>["get"] =
    this.singleUserStateProvider.get.bind(this.singleUserStateProvider);
  getGlobal: InstanceType<typeof GlobalStateProvider>["get"] = this.globalStateProvider.get.bind(
    this.globalStateProvider,
  );
}
