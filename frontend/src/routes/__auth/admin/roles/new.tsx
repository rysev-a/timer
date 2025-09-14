import { createFileRoute } from "@tanstack/react-router";
import RoleCreate from "@/modules/admin/auth/roles/RoleCreate";

export const Route = createFileRoute("/__auth/admin/roles/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoleCreate />;
}
