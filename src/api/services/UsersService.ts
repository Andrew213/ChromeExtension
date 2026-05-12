import { request } from "@/api/axios";
import { UsersGetMe } from "@/api/requests/User";

export default class UsersService {
  public static async getMe() {
    try {
      const response = await request<UsersGetMe.Response>({
        method: UsersGetMe.METHOD,
        url: UsersGetMe.URL,
      });

      return response;
    } catch (error) {
      console.error("Error while USERS get me:", error);
      throw error;
    }
  }
}
