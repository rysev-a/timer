// src/routes/__root.tsx
/// <reference types="vite/client" />

import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import DevPanel from "@/components/common/dev/DevPanel";
import { Toaster } from "@/components/ui/sonner";
import auth from "@/core/auth";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SERM сервис" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: () => null,
});

function RootComponent() {
  useEffect(() => {
    auth.initAuthData();
  }, []);

  return (
    <RootDocument>
      <Toaster />
      <DevPanel />
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={"ru"}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
