import { createFileRoute } from "@tanstack/react-router";
import ProjectCreate from "@/modules/serm/projects/ProjectCreate";

export const Route = createFileRoute("/__auth/projects/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProjectCreate />;
}
