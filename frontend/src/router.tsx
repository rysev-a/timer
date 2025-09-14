import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { routeTree } from "./routeTree.gen";

export function createRouter(    ) {
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    context: { queryClient },
    routeTree,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
