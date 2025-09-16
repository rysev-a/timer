"use client";

import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideProps, SquareTerminal, UserCircleIcon } from "lucide-react";
import { type ForwardRefExoticComponent, type RefAttributes, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import i18n from "@/core/i18n";
import { isUserRoles } from "@/package";

export interface NavMenuSectionConfig {
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  isActive: boolean;
  enabled?: boolean;
  items: NavMenuItemConfig[];
}

export interface NavMenuItemConfig {
  title: string;
  isActive?: boolean;
  enabled?: boolean;
  url: string;
}

export function NavMain() {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const items = useMemo(
    (): NavMenuSectionConfig[] => [
      {
        title: i18n.t("navMenu.auth"),
        url: "#",
        enabled: isUserRoles(["admin", "moderator"]),
        icon: UserCircleIcon,
        isActive: false,
        items: [
          {
            title: i18n.t("navMenu.users"),
            url: "/admin/users",
            enabled: isUserRoles(["admin", "moderator"]),
          },
          {
            title: i18n.t("navMenu.roles"),
            url: "/admin/roles",
            enabled: false,
          },
          {
            title: i18n.t("navMenu.permissions"),
            url: "/admin/permissions",
            enabled: false,
          },
        ],
      },
      {
        enabled: true,
        title: i18n.t("navMenu.timer"),
        url: "#",
        icon: SquareTerminal,
        isActive: false,
        items: [
          {
            enabled: true,
            title: i18n.t("navMenu.races"),
            url: "/races",
          },
          {
            enabled: true,
            title: i18n.t("navMenu.athletes"),
            url: "/athletes",
          },
        ],
      },
    ],
    [],
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Меню</SidebarGroupLabel>
      <SidebarMenu>
        {items
          .filter((item) => item.enabled)
          .map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      ?.filter((item) => item.enabled)
                      .map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} onClick={handleLinkClick}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
