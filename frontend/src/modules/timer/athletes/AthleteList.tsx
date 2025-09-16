import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/api";
import { Table } from "@/components/ui/table";

export default function AthleteList() {
  const athletes = useQuery({
    queryFn: async () => (await httpClient.get("/api/timer/athletes")).data,
    queryKey: ["athletes"],
  });

  return <Table></Table>;
}
