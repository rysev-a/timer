import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MonitorStop, Play, Square, SquareStop, StopCircle, Timer, Trash2 } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { httpClient } from "@/core/api";
import { cn } from "@/lib/utils";
import type { AthleteType, LapType, RaceType } from "@/modules/timer/types";

export default function RaceResults({ race }: { race: RaceType }) {
  const raceAthletes = useQuery({
    queryFn: async () => (await httpClient.get("/api/timer/races-athletes")).data,
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

  const stopRaceQuery = useMutation({
    mutationFn: (data: Partial<Omit<LapType, "id">>) => {
      return httpClient.post("/api/timer/laps/stop", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["laps"] });
    },
  });

  const stopRace = useCallback(
    ({ raceId, athleteId }) => {
      stopRaceQuery.mutateAsync({
        race_id: raceId,
        athlete_id: athleteId,
      });
    },
    [stopRaceQuery],
  );

  const run = useCallback(
    ({ raceId, athleteId }) => {
      createLapQuery.mutateAsync({
        count: 0,
        race_id: raceId,
        athlete_id: athleteId,
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss+03:00"),
      });
    },
    [createLapQuery],
  );

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
            const athleteLaps = (laps?.data?.items || []).filter((lap) => {
              return lap.race_id === race.id && lap.athlete_id === athlete.id;
            });

            const playIsDisabled = athleteLaps.length > 0;
            const continueDisabled = athleteLaps.length === 0;

            const startTime = athleteLaps.length > 0 ? new Date(athleteLaps[0].start_time) : null;

            return (
              <TableRow key={athlete.id}>
                <TableCell>{athlete.name}</TableCell>
                <TableCell>
                  {(laps?.data?.items || [])
                    .filter((lap) => {
                      return lap.race_id === race.id && lap.athlete_id === athlete.id;
                    })
                    .map((lap) => {
                      const diff =
                        new Date(lap.start_time).getTime() - (startTime as Date).getTime();
                      const seconds = diff / 1000;

                      return <span key={lap.id}>{seconds}</span>;
                    })}
                </TableCell>
                <TableCell className={"space-x-2"}>
                  <Button
                    disabled={playIsDisabled}
                    variant={"secondary"}
                    className={cn("cursor-pointer", {
                      "opacity-10": playIsDisabled,
                    })}
                    onClick={() => {
                      run({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <Play color="red" className={cn({ "opacity-10": playIsDisabled })} />
                  </Button>
                  <Button
                    variant={"secondary"}
                    className={"cursor-pointer"}
                    disabled={continueDisabled}
                    onClick={() => {
                      run({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <Timer color="green" />
                  </Button>

                  <Button
                    variant={"secondary"}
                    className={"cursor-pointer"}
                    onClick={() => {
                      stopRace({
                        raceId: race.id,
                        athleteId: athlete.id,
                      });
                    }}
                  >
                    <Square color="black" />
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
