import { createFileRoute } from "@tanstack/react-router";
import PermissionList from "@/modules/admin/auth/permissions/PermissionList";

export const Route = createFileRoute("/__auth/admin/permissions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PermissionList />;
}
