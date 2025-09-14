import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export const usersQueryOptions = (deployUrl = "", searchQuery = "") =>
  queryOptions({
    queryKey: ["users", searchQuery],
    queryFn: () =>
      axios
        .get(`${deployUrl}/api/auth/users${searchQuery}`)
        .then((r) => r.data)
        .catch(() => {
          throw new Error("Failed to fetch users");
        }),
  });

export const usersQueryOptions2 = (deployUrl = "", searchQuery = "") =>
  queryOptions({
    queryKey: ["users", searchQuery],
    queryFn: () =>
      axios
        .get(`${deployUrl}/api/auth/users${searchQuery}`)
        .then((r) => r.data)
        .catch(() => {
          throw new Error("Failed to fetch users");
        }),
  });
