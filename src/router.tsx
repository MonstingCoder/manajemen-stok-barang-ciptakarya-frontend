import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { getSession } from "./auth";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { InventoryPage } from "./pages/InventoryPage";
import { TagsPage } from "./pages/TagsPage";
import { UsersPage } from "./pages/UsersPage";
import { AccountPage } from "./pages/AccountPage";
import { TagItemsPage } from "./pages/TagItemsPage";

const rootRoute = createRootRoute({
  component: Outlet,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (getSession()) throw redirect({ to: "/app/items" });
  },
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: () => {
    if (!getSession()) throw redirect({ to: "/login" });
  },
  component: AppShell,
});

const inventoryRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/items",
  component: InventoryPage,
});

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: InventoryPage,
});

const tagsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tags",
  component: TagsPage,
});

const accountRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/account",
  component: AccountPage,
});

const tagItemsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/tags/$tagId/items",
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : "",
  }),
  component: TagItemsPage,
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users",
  beforeLoad: () => {
    if (getSession()?.role !== "admin") throw redirect({ to: "/app/items" });
  },
  component: UsersPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  appRoute.addChildren([
    appIndexRoute,
    inventoryRoute,
    tagsRoute,
    accountRoute,
    tagItemsRoute,
    usersRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
