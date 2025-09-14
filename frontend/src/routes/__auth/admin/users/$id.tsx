import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { httpClient } from "@/core/api";
import UserDetail from "@/modules/admin/auth/users/UserDetail";
import type { UserType } from "@/modules/admin/types";

export const Route = createFileRoute("/__auth/admin/users/$id")({
  head: () => ({
    meta: [{ title: "SERM - Пользователь" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const user = useQuery({
    queryFn: async () => (await httpClient.get<UserType>(`/api/auth/users/${id}`)).data,
    queryKey: ["users", id],
  });

  return user.isFetched ? <UserDetail user={user.data as UserType} /> : null;
}
