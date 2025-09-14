import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { NavLogo } from "./nav-logo";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
