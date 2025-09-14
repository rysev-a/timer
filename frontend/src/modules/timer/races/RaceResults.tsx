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
import type { AthleteType, RaceType } from "@/modules/timer/types";

export default function RaceResults({ race }: { race: RaceType }) {
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
                <TableCell>Результаты</TableCell>
                <TableCell className={"space-x-2"}>
                  <Button variant={"secondary"}>
                    <Play color="red" />
                  </Button>
                  <Button variant={"secondary"}>
                    <Timer color="green" />
                  </Button>

                  <Button variant={"secondary"}>
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
