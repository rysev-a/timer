import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { AthleteType } from "../types";

const AthleteDetailFormSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export default function AthleteDetail({ athlete }: { athlete: AthleteType }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const athleteUpdateQuery = useMutation({
    mutationFn: async (data: AthleteType) =>
      await httpClient.patch(`/api/timer/athletes/${data.id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["athletes"],
      }),
  });

  const form = useForm({
    defaultValues: {
      id: athlete.id,
      name: athlete.name,
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof AthleteDetailFormSchema>) => {
      return athleteUpdateQuery
        .mutateAsync({
          id: values.id,
          name: values.name,
        })
        .then((response): AxiosResponse<AthleteType> => {
          toast.success(i18n.t("athleteDetail.athleteUpdatedSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response?.data?.detail === "Athlete already exists") {
            form.setError("name", { message: i18n.t("athleteDetail.athleteNameAlreadyExists") });
            toast.error(i18n.t("athleteDetail.athleteUpdateFailed"), {
              description: i18n.t("athleteDetail.athleteAlreadyExistsDescription", {
                name: values.name,
              }),
            });
          } else {
            toast.error(i18n.t("athleteDetail.athleteUpdateFailed"));
          }
          throw new Error(i18n.t("athleteDetail.athleteUpdateFailed"));
        });
    },
    [athleteUpdateQuery, form],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof AthleteDetailFormSchema>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/athletes/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof AthleteDetailFormSchema>) => {
      await submit(values);
      return await navigate({
        to: "/athletes",
      });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{i18n.t("athleteDetail.nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={i18n.t("athleteDetail.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="cursor-pointer" disabled={athleteUpdateQuery.isPending}>
            {i18n.t("athleteDetail.saveAndContinueEditing")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(submitAndNavigate)}
            className="cursor-pointer"
            disabled={athleteUpdateQuery.isPending}
          >
            {i18n.t("athleteDetail.saveAndReturnToList")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
