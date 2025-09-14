import { createFileRoute, useLoaderData, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, getHeaders } from "@tanstack/react-start/server";
import ProjectList from "@/modules/serm/projects/ProjectList";
import { projectsQueryOptions } from "@/modules/serm/serm-api";

export type ProjectListUrlSearch = {
  page: number;
  pageSize: number;
  name: string;
  description: string;
};

export const getToken = createServerFn({ method: "GET" }).handler(async () => {
  return getCookie("token");
});

export const Route = createFileRoute("/__auth/projects/")({
  validateSearch: (search: Record<string, unknown>): ProjectListUrlSearch => {
    return {
      page: Number(search?.page ?? 1),
      pageSize: Number(search?.pageSize ?? 10),
      name: (search?.name as string) || "",
      description: (search?.description as string) || "",
    };
  },
  component: RouteComponent,
  loaderDeps: ({ search: { page, pageSize, name, description } }) => ({
    page,
    pageSize,
    name,
    description,
  }),
  loader: async ({ deps, context }) => {
    const token = await getToken();

    if (!token) {
      return { items: [] };
    }

    const BACKEND_URL = process.env.BACKEND_URL;

    const queryParams = new URLSearchParams({
      pageSize: String(deps.pageSize),
      currentPage: String(deps.page),
      name: deps.name,
      description: deps.description,
    });

    return context.queryClient.fetchQuery(
      projectsQueryOptions(BACKEND_URL, queryParams.toString(), token),
    );
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page, pageSize, name, description } = Route.useSearch();
  const projects = useLoaderData({ from: "/__auth/projects/" });

  return (
    <ProjectList
      projects={projects}
      page={page}
      pageSize={pageSize}
      searchParams={{ name, description }}
      navigate={navigate}
    />
  );
}
