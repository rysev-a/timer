import { Play, StopCircle, Timer, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AthleteType, LapType, RaceType } from "@/modules/timer/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/api";
import { useCallback } from "react";
import { format } from "date-fns";

export default function RaceResults({ race }: { race: RaceType }) {
  const raceAthletes = useQuery({
    queryFn: async () =>
      (await httpClient.get("/api/timer/races-athletes")).data,
    queryKey: ["races-athletes"],
  });

  const queryClient = useQueryClient();
  const laps = useQuery({
    queryFn: async () => (await httpClient.get("/api/timer/laps")).data,
    queryKey: ["laps"],
  });

  const createLapQuery = useMutation({
    mutationFn: (data: Partial<Omit<LapType, "id">>) => {
      return httpClient.post("/api/timer/laps/", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["laps"] });
    },
  });

  const continueRaceQuery = useMutation({
    mutationFn: (data: Partial<Omit<LapType, "id">>) => {
      return httpClient.post("/api/timer/laps/continue", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["laps"] });
    },
  });

  const stopRaceQuery = useMutation({
    mutationFn: (data: Partial<Omit<LapType, "id">>) => {
      return httpClient.post("/api/timer/laps/stop", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["laps"] });
    },
  });

  const continueRace = useCallback(({ raceId, athleteId }) => {
    continueRaceQuery.mutateAsync({
      race_id: raceId,
      athlete_id: athleteId,
    });
  }, []);

  const stopRace = useCallback(({ raceId, athleteId }) => {
    stopRaceQuery.mutateAsync({
      race_id: raceId,
      athlete_id: athleteId,
    });
  }, []);

  const run = useCallback(({ raceId, athleteId }) => {
    createLapQuery.mutateAsync({
      count: 0,
      race_id: raceId,
      athlete_id: athleteId,
      start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss+03:00"),
    });
  }, []);

  return (
    <div>
      <h2>{race.name}</h2>
      <Table className={"mt-10"}>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Результаты</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {race.athletes.map((athlete: AthleteType) => {
            return (
              <TableRow key={athlete.id}>
                <TableCell>{athlete.name}</TableCell>
                <TableCell>
                  {(laps?.data?.items || [])
                    .filter((lap) => {
                      return (
                        lap.race_id === race.id && lap.athlete_id === athlete.id
                      );
                    })
                    .map((lap) => {
                      return (
                        <div key={lap.id}>
                          {lap.start_time.slice(11, 19)} -{" "}
                          {lap.end_time ? lap.end_time.slice(11, 19) : ""}
                        </div>
                      );
                    })}
                </TableCell>
                <TableCell className={"space-x-2"}>
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      run({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <Play color="red" />
                  </Button>
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      continueRace({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <Timer color="green" />
                  </Button>

                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      stopRace({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <StopCircle color="black" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
