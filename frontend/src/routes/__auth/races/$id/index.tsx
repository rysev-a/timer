import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { httpClient } from "@/core/api";
import RaceDetail from "@/modules/timer/races/RaceDetail";
import type { RaceType } from "@/modules/timer/types";

export const Route = createFileRoute("/__auth/races/$id/")({
  head: () => ({
    meta: [{ title: "Гонка" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const race = useQuery({
    queryFn: async () => (await httpClient.get<RaceType>(`/api/timer/races/${id}`)).data,
    queryKey: ["races", id],
  });

  return race.isFetched ? <RaceDetail race={race.data as RaceType} /> : null;
}
