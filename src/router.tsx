import { createHashHistory, createRouter } from "@tanstack/react-router";
import { isPagesSpa, routerBasepath } from "@/lib/public-url";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    // Hash history on Pages so nested routes survive refresh on static hosting.
    ...(isPagesSpa ? { history: createHashHistory() } : { basepath: routerBasepath() }),
    scrollRestoration: true,
    defaultPreload: "intent",
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
