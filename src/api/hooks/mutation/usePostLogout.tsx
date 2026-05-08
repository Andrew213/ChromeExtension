import { AuthPostLogout } from "@/api/requests/Auth";
import AuthService from "@/api/services/AuthService";
import { useMutation } from "@tanstack/react-query";

export function usePostAuthLogout() {
  return useMutation({
    mutationKey: [AuthPostLogout.QUERY_KEY],
    mutationFn: () => AuthService.postAuthLogout(),
  });
}
