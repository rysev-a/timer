import { createFileRoute } from "@tanstack/react-router";
import RaceCreate from "@/modules/timer/races/RaceCreate";

export const Route = createFileRoute("/__auth/races/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RaceCreate />;
}
