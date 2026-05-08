import { request } from "@/api/axios";
import {
  AuthGetStatus,
  AuthPostConsume,
  AuthPostLoginSession,
} from "@/api/requests/Auth";

export default class AuthService {
  public static async postCreateSession() {
    try {
      const response = await request<AuthPostLoginSession.Response>({
        method: AuthPostLoginSession.METHOD,
        url: AuthPostLoginSession.URL,
      });

      return response;
    } catch (error) {
      console.error("❌ Error while AUTH post create session:", error);
      throw error;
    }
  }

  public static async getSessionStatus(id: string) {
    try {
      const response = await request<AuthGetStatus.Response>({
        method: AuthGetStatus.METHOD,
        url: AuthGetStatus.URL(id),
      });

      return response;
    } catch (error) {
      console.error("❌ Error while AUTH get status session:", error);
      throw error;
    }
  }

  public static async postAuthConsume(id: string) {
    try {
      const response = await request<AuthPostConsume.Response>({
        method: AuthPostConsume.METHOD,
        url: AuthPostConsume.URL(id),
      });

      return response;
    } catch (error) {
      console.error("❌ Error while AUTH post consume:", error);
      throw error;
    }
  }
}
