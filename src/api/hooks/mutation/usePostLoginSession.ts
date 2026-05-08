import { AuthPostLoginSession } from "@/api/requests/Auth";
import AuthService from "@/api/services/AuthService";
import { useMutation } from "@tanstack/react-query";

export function usePostLoginSession() {
  return useMutation({
    mutationKey: [AuthPostLoginSession.QUERY_KEY],
    mutationFn: () => AuthService.postCreateSession(),
  });
}
