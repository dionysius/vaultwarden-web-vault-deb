export abstract class LoginService {
  getEmail: () => string;
  getRememberEmail: () => boolean;
  setEmail: (value: string) => void;
  setRememberEmail: (value: boolean) => void;
  clearValues: () => void;
}
