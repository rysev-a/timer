import PermissionCreate from "@/modules/admin/auth/permissions/PermissionCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__auth/admin/permissions/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PermissionCreate />;
}
