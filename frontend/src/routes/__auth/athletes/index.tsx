import { createFileRoute } from "@tanstack/react-router";
import { AthleteList } from "@/modules/timer/athletes/AthleteList";

export const Route = createFileRoute("/__auth/athletes/")({
  head: () => ({
    meta: [{ title: "Timer - Athletes" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <AthleteList />;
}
