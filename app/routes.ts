import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("recipes", "routes/recipes.tsx", [
    index("routes/recipes._index.tsx"),
    route("new", "routes/recipes.new.tsx"),
    route(":id", "routes/recipes.$id.tsx"),
    route(":id/edit", "routes/recipes.$id.edit.tsx"),
    route(":id/steps/new", "routes/recipes.$id.steps.new.tsx"),
    route(":id/steps/:stepId/edit", "routes/recipes.$id.steps.$stepId.edit.tsx"),
  ]),
] satisfies RouteConfig;
