import { createFileRoute } from "@tanstack/react-router";
import RoleList from "@/modules/admin/auth/roles/RoleList";

export type RoleListUrlSearch = {
  page: number;
};

export const Route = createFileRoute("/__auth/admin/roles/")({
  validateSearch: (search: Record<string, unknown>): RoleListUrlSearch => {
    return { page: Number(search?.page ?? 1) };
  },

  component: RouteComponent,
});

function RouteComponent() {
  return <RoleList />;
}
