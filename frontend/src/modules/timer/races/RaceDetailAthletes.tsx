"use client";

import { useQuery } from "@tanstack/react-query";
import { map } from "rambda";
import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { AthleteType } from "../types";

const serializeRole = (athlete: AthleteType) => ({
  label: athlete.name,
  value: athlete.id,
});

export default function UserDetailRoles() {
  const athletes = useQuery({
    queryKey: ["athletes"],
    queryFn: async () => {
      return (await httpClient.get("/api/timer/athletes")).data;
    },
  });

  const form = useFormContext();

  return (
    <FormField
      name="athletes"
      control={form.control}
      render={({ field }) => {
        return (
          <MultiSelect
            options={
              athletes.isFetched
                ? map<AthleteType[], { label: string; value: string }>(serializeRole)(
                    athletes.data.items,
                  )
                : []
            }
            value={map<AthleteType[], string>((role) => role.id)(field.value)}
            onChange={(event) => {
              field.onChange(
                athletes.data.items.filter((athlete: AthleteType) => event.includes(athlete.id)),
              );
            }}
            placeholder={i18n.t("raceDetail.selectRaceAthletes")}
            searchPlaceholder={i18n.t("raceDetail.searchAthletesPlaceholder")}
            isLoading={athletes.isLoading}
            clearAllMessage={i18n.t("multiSelect.clearAllMessage")}
          />
        );
      }}
    />
  );
}
