import {
  CreateCredentialParams,
  CreateCredentialResult,
  AssertCredentialParams,
  AssertCredentialResult,
} from "@bitwarden/common/vault/abstractions/fido2/fido2-client.service.abstraction";

export enum MessageType {
  CredentialCreationRequest,
  CredentialCreationResponse,
  CredentialGetRequest,
  CredentialGetResponse,
  AbortRequest,
  AbortResponse,
  ErrorResponse,
}

export type CredentialCreationRequest = {
  type: MessageType.CredentialCreationRequest;
  data: CreateCredentialParams;
};

export type CredentialCreationResponse = {
  type: MessageType.CredentialCreationResponse;
  result?: CreateCredentialResult;
};

export type CredentialGetRequest = {
  type: MessageType.CredentialGetRequest;
  data: AssertCredentialParams;
};

export type CredentialGetResponse = {
  type: MessageType.CredentialGetResponse;
  result?: AssertCredentialResult;
};

export type AbortRequest = {
  type: MessageType.AbortRequest;
  abortedRequestId: string;
};

export type ErrorResponse = {
  type: MessageType.ErrorResponse;
  error: string;
};

export type AbortResponse = {
  type: MessageType.AbortResponse;
  abortedRequestId: string;
};

export type Message =
  | CredentialCreationRequest
  | CredentialCreationResponse
  | CredentialGetRequest
  | CredentialGetResponse
  | AbortRequest
  | AbortResponse
  | ErrorResponse;
