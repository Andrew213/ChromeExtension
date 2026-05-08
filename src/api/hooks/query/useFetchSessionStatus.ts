import { AuthGetStatus } from "@/api/requests/Auth";
import AuthService from "@/api/services/AuthService";
import { useQuery } from "@tanstack/react-query";

export function useFetchSessionStatus(sessionId?: string, enabled = false) {
  return useQuery({
    queryKey: [AuthGetStatus.QUERY_KEY, sessionId],
    queryFn: () => AuthService.getSessionStatus(sessionId!),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: enabled ? 1500 : false,
  });
}
