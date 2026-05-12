import { UsersGetMe } from "@/api/requests/User";
import UsersService from "@/api/services/UsersService";
import { useQuery } from "@tanstack/react-query";

export function useGetMe(enabled = false) {
  return useQuery({
    queryKey: [UsersGetMe.QUERY_KEY],
    queryFn: () => UsersService.getMe(),
    enabled,
    retry: false,
  });
}
