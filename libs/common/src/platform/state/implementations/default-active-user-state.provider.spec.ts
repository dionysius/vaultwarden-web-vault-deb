import { mock } from "jest-mock-extended";

import { mockAccountServiceWith, trackEmissions } from "../../../../spec";
import { AuthenticationStatus } from "../../../auth/enums/authentication-status";
import { UserId } from "../../../types/guid";
import { StorageServiceProvider } from "../../services/storage-service.provider";
import { StateEventRegistrarService } from "../state-event-registrar.service";

import { DefaultActiveUserStateProvider } from "./default-active-user-state.provider";

describe("DefaultActiveUserStateProvider", () => {
  const storageServiceProvider = mock<StorageServiceProvider>();
  const stateEventRegistrarService = mock<StateEventRegistrarService>();
  const userId = "userId" as UserId;
  const accountInfo = {
    id: userId,
    name: "name",
    email: "email",
    status: AuthenticationStatus.Locked,
  };
  const accountService = mockAccountServiceWith(userId, accountInfo);
  let sut: DefaultActiveUserStateProvider;

  beforeEach(() => {
    sut = new DefaultActiveUserStateProvider(
      accountService,
      storageServiceProvider,
      stateEventRegistrarService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should track the active User id from account service", () => {
    const emissions = trackEmissions(sut.activeUserId$);

    accountService.activeAccountSubject.next(undefined);
    accountService.activeAccountSubject.next(accountInfo);

    expect(emissions).toEqual([userId, undefined, userId]);
  });
});
