import { UserT } from "@/api/types/UserType";

export namespace AuthPostLoginSession {
  export const METHOD = "POST";
  export const URL = "/auth/login-session";
  export const QUERY_KEY = "post login-session";

  export type Response = {
    sessionId: string;
    telegramUrl: string;
    expiresAt: string;
  };
}

export enum LoginSessionStatus {
  Pending = "pending", // ссылка создана, пользователь ещё не нажал Start
  Confirmed = "confirmed", // бот подтвердил, user найден/создан
  Consumed = "consumed", // extension забрал access/refresh token
  Expired = "expired", // ссылка протухла
}

export namespace AuthGetStatus {
  export const METHOD = "GET";
  export const URL = (id: string) => `/auth/login-session/${id}/status`;
  export const QUERY_KEY = "get login-session status";

  export type Response = {
    status: LoginSessionStatus;
  };
}

export namespace AuthPostConsume {
  export const METHOD = "POST";
  export const URL = (id: string) => `/auth/login-session/${id}/consume`;
  export const QUERY_KEY = "post login consume";

  export type Response = {
    accessToken: string;
    user: UserT;
  };
}
