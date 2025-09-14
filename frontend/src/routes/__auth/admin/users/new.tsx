import { createFileRoute } from "@tanstack/react-router";
import { setBreadCrumbs } from "@/components/common/breadcrumbs/app-breadcrumbs";
import UserCreate from "@/modules/admin/auth/users/UserCreate";

export const Route = createFileRoute("/__auth/admin/users/new")({
  component: RouteComponent,
  loader: () => {
    setBreadCrumbs([
      { label: "Пользователи", path: "/admin/users", isSeparator: false },
      { label: "UserCreateSeparator", path: "", isSeparator: true },
      { label: "Создание пользователя", path: "/admin/users/new", isSeparator: false },
    ]);
  },
});

function RouteComponent() {
  return <UserCreate />;
}
