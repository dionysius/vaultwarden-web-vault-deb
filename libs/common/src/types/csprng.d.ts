import { Opaque } from "type-fest";

type CsprngArray = Opaque<ArrayBuffer, "CSPRNG">;

type CsprngString = Opaque<string, "CSPRNG">;
