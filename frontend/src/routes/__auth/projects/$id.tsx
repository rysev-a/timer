import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { httpClient } from "@/core/api";
import ProjectDetail from "@/modules/serm/projects/ProjectDetail";
import type { ProjectType } from "@/modules/serm/types";

export const Route = createFileRoute("/__auth/projects/$id")({
  head: () => ({
    meta: [{ title: "SERM - Проект" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const project = useQuery({
    queryFn: async () => (await httpClient.get<ProjectType>(`/api/serm/projects/${id}`)).data,
    queryKey: ["projects", id],
  });

  return project.isFetched ? <ProjectDetail project={project.data as ProjectType} /> : null;
}
