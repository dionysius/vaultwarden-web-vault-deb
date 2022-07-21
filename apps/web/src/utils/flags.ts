export type Flags = {
  showTrial?: boolean;
  scim?: boolean;
};

export type FlagName = keyof Flags;

export function flagEnabled(flag: FlagName): boolean {
  return flags()[flag] == null || flags()[flag];
}

function flags(): Flags {
  const envFlags = process.env.FLAGS as string | Flags;

  if (typeof envFlags === "string") {
    return JSON.parse(envFlags) as Flags;
  } else {
    return envFlags as Flags;
  }
}
