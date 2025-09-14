import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { httpClient } from '@/core/api';
import RoleDetail from '@/modules/admin/auth/roles/RoleDetail';

export const Route = createFileRoute('/__auth/admin/roles/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const roleQuery = useQuery({
    queryKey: ['roles', id],
    queryFn: async () => (await httpClient.get(`/api/auth/roles/${id}`)).data,
  });

  return roleQuery.isFetched ? <RoleDetail role={roleQuery.data} /> : null;
}
