export type AccountStatusResponse = {
  id: string;
  email: string;
  status: "locked" | "unlocked";
  active: boolean;
};
