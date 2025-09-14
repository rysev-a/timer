import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setBreadCrumbs } from "@/components/common/breadcrumbs/app-breadcrumbs";
import UserList from "@/modules/admin/auth/users/UserList";

export type UserListUrlSearch = {
  page: number;
};

export const Route = createFileRoute("/__auth/admin/users/")({
  head: () => ({
    meta: [{ title: "SERM - Пользователи" }],
  }),
  validateSearch: (search: Record<string, unknown>): UserListUrlSearch => {
    return { page: Number(search?.page ?? 1) };
  },

  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { page } = Route.useSearch();
  return <UserList page={page} navigate={navigate} />;
}
