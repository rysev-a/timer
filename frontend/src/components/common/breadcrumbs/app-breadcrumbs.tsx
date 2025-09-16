import { Separator } from "@radix-ui/react-separator";
import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface BreadCrumbConfig {
  label: string;
  path: string;
  isSeparator: boolean;
  params?: object;
}

export const breadCrumbsStore = new Store<BreadCrumbConfig[]>([]);

export const setBreadCrumbs = (breadCrumbs: BreadCrumbConfig[]) => {
  breadCrumbsStore.setState(() => {
    return breadCrumbs;
  });
};

const createBreadCrumb = (label: string, path = "", params = {}): BreadCrumbConfig => ({
  label,
  path,
  params,
  isSeparator: false,
});

const createBreadCrumbSeparator = (label: string): BreadCrumbConfig => ({
  label,
  path: "",
  params: {},
  isSeparator: true,
});

const getBreadCrumbsConfig = (route) => {
  if (route.routeId === "/__auth/admin/users/") {
    return [createBreadCrumb("Пользователи", "/admin/users")];
  }

  if (route.routeId === "/__auth/admin/users/$id") {
    return [
      createBreadCrumb("Пользователи", "/admin/users"),
      createBreadCrumbSeparator("users separator"),
      createBreadCrumb("Редактирование пользователя", "/admin/users/$id", route.params),
    ];
  }

  if (route.routeId === "/__auth/admin/users/new") {
    return [
      createBreadCrumb("Пользователи", "/admin/users"),
      createBreadCrumbSeparator("users separator"),
      createBreadCrumb("Создание пользователя", "/admin/users/new"),
    ];
  }

  if (route.routeId === "/__auth/admin/roles/") {
    return [createBreadCrumb("Роли", "/admin/roles")];
  }

  if (route.routeId === "/__auth/admin/roles/new") {
    return [
      createBreadCrumb("Роли", "/admin/roles"),
      createBreadCrumbSeparator("roles separator"),
      createBreadCrumb("Создание роли", "/admin/roles/new"),
    ];
  }

  if (route.routeId === "/__auth/admin/roles/$id") {
    return [
      createBreadCrumb("Роли", "/admin/roles"),
      createBreadCrumbSeparator("roles separator"),
      createBreadCrumb("Редактирование роли", "/admin/roles/$id", route.params),
    ];
  }

  if (route.routeId === "/__auth/admin/permissions/") {
    return [createBreadCrumb("Права доступа", "/admin/permissions")];
  }

  if (route.routeId === "/__auth/admin/permissions/new") {
    return [
      createBreadCrumb("Права доступа", "/admin/permissions"),
      createBreadCrumbSeparator("permissions separator"),
      createBreadCrumb("Создание права доступа", "/admin/permissions/new"),
    ];
  }

  if (route.routeId === "/__auth/admin/permissions/$id") {
    return [
      createBreadCrumb("Права доступа", "/admin/permissions"),
      createBreadCrumbSeparator("permissions separator"),
      createBreadCrumb("Редактирование права доступа", "/admin/permissions/$id", route.params),
    ];
  }

  if (route.routeId === "/__auth/projects/") {
    return [createBreadCrumb("Проекты", "/projects")];
  }

  if (route.routeId === "/__auth/projects/new") {
    return [
      createBreadCrumb("Проекты", "/projects"),
      createBreadCrumbSeparator("projects separator"),
      createBreadCrumb("Создание проекта", "/projects/new"),
    ];
  }

  if (route.routeId === "/__auth/projects/$id") {
    return [
      createBreadCrumb("Проекты", "/projects"),
      createBreadCrumbSeparator("projects separator"),
      createBreadCrumb("Редактирование проекта", "/projects/$id", route.params),
    ];
  }

  return [];
};

export function AppBreadcrumbs() {
  const breadCrumbs = useStore(breadCrumbsStore, (state: BreadCrumbConfig[]) => state);

  const state = useRouterState();
  const route = state.matches[state.matches.length - 1];

  useEffect(() => {
    setBreadCrumbs(getBreadCrumbsConfig(route));
  }, [route]);

  return (
    <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 z-1">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to={"/"}>Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadCrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

            {breadCrumbs.map((breadCrumb) => {
              if (breadCrumb.isSeparator) {
                return <BreadcrumbSeparator key={breadCrumb.label} className="hidden md:block" />;
              }

              return (
                <BreadcrumbItem className="hidden md:block" key={breadCrumb.label}>
                  <BreadcrumbLink asChild>
                    <Link to={breadCrumb.path} params={breadCrumb.params}>
                      {breadCrumb.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
