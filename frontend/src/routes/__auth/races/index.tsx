import { createFileRoute, useNavigate } from "@tanstack/react-router";
import RaceList from "@/modules/timer/races/RaceList";

export const Route = createFileRoute("/__auth/races/")({
  head: () => ({
    meta: [{ title: "Гонки" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <RaceList />;
}
