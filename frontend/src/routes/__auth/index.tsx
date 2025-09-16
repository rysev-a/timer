import { createFileRoute } from "@tanstack/react-router";
import RaceList from "@/modules/timer/races/RaceList";

export const Route = createFileRoute("/__auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="m-10">
      <h1 className="text-4xl">Таймер для Нины</h1>
      <RaceList />
    </div>
  );
}
