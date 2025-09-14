import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import { AppBreadcrumbs, setBreadCrumbs } from "@/components/common/breadcrumbs/app-breadcrumbs";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import auth from "@/core/auth";

const AuthComponent = () => {
  const navigate = useNavigate();
  const { isLoaded, isAuthenticated } = useStore(auth.accountStore, (state) => state);

  useEffect(() => {
    auth.initAuthData();
    auth.load();
  }, []);

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      navigate({ to: "/auth/login" });
    }
  }, [isLoaded, isAuthenticated, navigate]);

  if (isLoaded && isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppBreadcrumbs />
          <div className={"flex flex-1 flex-col gap-4 p-4 mt-5"}>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return null;
};

export const Route = createFileRoute("/__auth")({
  component: AuthComponent,
});
