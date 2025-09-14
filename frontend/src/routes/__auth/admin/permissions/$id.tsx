import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { httpClient } from "@/core/api";
import PermissionDetail from "@/modules/admin/auth/permissions/PermissionDetail";

export const Route = createFileRoute("/__auth/admin/permissions/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const permission = useQuery({
    queryKey: ["permissions", id],
    queryFn: async () => (await httpClient.get(`/api/auth/permissions/${id}`)).data,
  });

  return permission.isFetched ? <PermissionDetail permission={permission.data} /> : null;
}
