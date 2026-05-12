import { UserT } from "@/api/types/UserType";

export namespace UsersGetMe {
  export const METHOD = "GET";
  export const URL = "/users/me";
  export const QUERY_KEY = "get users me";

  export type Response = UserT;
}
