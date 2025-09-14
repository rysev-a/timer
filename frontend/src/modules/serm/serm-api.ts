import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export const projectsQueryOptions = (deployUrl = "", searchQuery = "", token = "") => {
  return queryOptions({
    queryKey: ["projects", searchQuery],
    queryFn: () =>
      axios
        .get(`${deployUrl}/api/serm/projects?${searchQuery}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((r) => r.data)
        .catch(() => {
          throw new Error("Failed to fetch projects");
        }),
  });
};
