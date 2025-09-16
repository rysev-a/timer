import { createFileRoute } from "@tanstack/react-router";
import AthleteCreate from "@/modules/timer/athletes/AthleteCreate";

export const Route = createFileRoute("/__auth/athletes/new")({
  head: () => ({
    meta: [{ title: "Timer - New Athlete" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <AthleteCreate />;
}
