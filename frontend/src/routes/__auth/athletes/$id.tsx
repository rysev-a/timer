import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { httpClient } from "@/core/api";
import AthleteDetail from "@/modules/timer/athletes/AthleteDetail";
import type { AthleteType } from "@/modules/timer/types";

export const Route = createFileRoute("/__auth/athletes/$id")({
  head: () => ({
    meta: [{ title: "Timer - Athlete Details" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const athlete = useQuery({
    queryFn: async () => (await httpClient.get<AthleteType>(`/api/timer/athletes/${id}`)).data,
    queryKey: ["athletes", id],
  });

  return athlete.isFetched ? <AthleteDetail athlete={athlete.data as AthleteType} /> : null;
}
