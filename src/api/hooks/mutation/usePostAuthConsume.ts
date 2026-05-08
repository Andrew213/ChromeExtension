import { AuthPostConsume } from "@/api/requests/Auth";
import AuthService from "@/api/services/AuthService";
import { useMutation } from "@tanstack/react-query";

export function usePostAuthConsume() {
  return useMutation({
    mutationKey: [AuthPostConsume.QUERY_KEY],
    mutationFn: (sessionId: string) => AuthService.postAuthConsume(sessionId),
  });
}
