import { AuthGetStatus } from "@/api/requests/Auth";
import AuthService from "@/api/services/AuthService";
import { useQuery } from "@tanstack/react-query";

export function useFetchSessionStatus(sessionId: string) {
  return useQuery({
    queryKey: [AuthGetStatus.QUERY_KEY],
    queryFn: () => AuthService.getSessionStatus(sessionId),
  });
}
