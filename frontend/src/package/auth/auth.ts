import { Derived, Store } from "@tanstack/store";
import type { Axios } from "axios";

export const AUTHORIZATION_KEY = "Authorization";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StartResetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  code: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ActivateRequest {
  code: string;
}

export interface Permission {
  name: string;
  app: string;
}

export interface Role {
  name: string;
  permissions: Permission[];
}

const defaultAccount = (): AccountData => ({
  user: {
    id: null,
    email: null,
    roles: [],
    is_enabled: false,
    is_active: false,
  },
  isAuthenticated: false,
  isLoaded: false,
});

export interface AccountUser {
  id: string | null;
  email: string | null;
  roles: Role[];
  is_enabled: boolean;
  is_active: boolean;
}

export interface AccountData {
  user: AccountUser;
  isLoaded: boolean;
  isAuthenticated: boolean;
}

export const accountStore = new Store<AccountData>(defaultAccount());

export const isAdmin = new Derived({
  fn: () => Boolean(accountStore.state.user?.roles.find((role) => role.name === "admin")),
  deps: [accountStore],
});

export const userRoles = new Derived({
  fn: (): string[] => accountStore.state.user?.roles.map((role) => role.name),
  deps: [accountStore],
});

export const isUserRoles = (roles: string[]) => {
  return Boolean(userRoles.state.find((role) => roles.includes(role)));
};

export class Auth {
  accountStore: Store<AccountData, (cb: AccountData) => AccountData>;
  httpClient: Axios;

  constructor(httpClient: Axios) {
    this.httpClient = httpClient;
    this.accountStore = accountStore;
  }

  initAuthData() {
    const token = localStorage.getItem("token");
    if (token) {
      this.httpClient.defaults.headers.common[AUTHORIZATION_KEY] = token;
    }
  }

  async load() {
    try {
      const { data } = await this.httpClient.get("/api/auth/account/me");
      accountStore.setState(() => {
        return {
          user: data,
          isAuthenticated: true,
          isLoaded: true,
        };
      });
    } catch {
      accountStore.setState((state) => {
        return {
          ...state,
          isLoaded: true,
        };
      });
    }
  }

  async login(values: LoginRequest) {
    const response = await this.httpClient.post("/api/auth/account/login", values);
    const { user, access_token } = response.data;
    if (user.is_active) {
      this._initUserData({ user, access_token });
    }
    return user;
  }

  logout() {
    accountStore.setState(() => ({ ...defaultAccount(), isLoaded: true }));
    this._clearAuthData();
  }

  startResetPassword(values: StartResetPasswordRequest) {
    return this.httpClient.post("/api/auth/account/start-reset-password", values);
  }

  async resetPassword(values: ResetPasswordRequest) {
    const response = await this.httpClient.post("/api/auth/account/reset-password", values);
    this._initUserData(response.data);
  }

  _initUserData({ user, access_token }: { user: AccountUser; access_token: string }) {
    this._setAuthData(access_token);
    accountStore.setState(() => {
      return {
        user,
        isAuthenticated: true,
        isLoaded: true,
      };
    });
  }

  _setAuthData(token: string) {
    localStorage.setItem("token", token);
    this.httpClient.defaults.headers.common[AUTHORIZATION_KEY] = token;
    cookieStore.set({ name: "token", value: token });
  }

  _clearAuthData() {
    localStorage.removeItem("token");
    delete this.httpClient.defaults.headers.common[AUTHORIZATION_KEY];
    cookieStore.delete("token");
  }
}
