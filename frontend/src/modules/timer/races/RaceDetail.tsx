import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { AthleteType, RaceType } from "../types";
import RaceDetailAthletes from "./RaceDetailAthletes";

const UpdateRaceFormSchema = z.object({
  name: z.string(),
  athletes: z.array(z.object({ id: z.string(), name: z.string() })),
});

export default function RaceDetail({ race }: { race: RaceType }) {
  const queryClient = useQueryClient();

  const updateQuery = useMutation({
    mutationFn: async (data: RaceType) =>
      await httpClient.patch(`/api/timer/races/${data.id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["races"] }),
  });

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: race.name,
      athletes: race.athletes,
    },
  });

  const submit = useCallback(
    async (values: z.infer<typeof UpdateRaceFormSchema>) => {
      try {
        await updateQuery.mutateAsync({
          id: race.id,
          name: values.name,
          athletes: values.athletes as AthleteType[],
        });
        toast.success(i18n.t("userDetail.updateRaceSuccess"));
      } catch {
        toast.error(i18n.t("userDetail.updateRaceError"));
      }
    },
    [updateQuery, race.id],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof UpdateRaceFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/races" });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Название"
              required
              {...form.register("name")}
            />
          </div>

          <div className="grid gap-2">
            <RaceDetailAthletes />
          </div>
          <div className={"space-x-5"}>
            <Button type="button" onClick={form.handleSubmit(submitAndNavigate)}>
              {i18n.t("buttons.save")}
            </Button>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
