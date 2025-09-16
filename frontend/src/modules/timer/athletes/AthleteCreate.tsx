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

const AthleteCreateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function AthleteCreate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const athleteCreateQuery = useMutation({
    mutationFn: async (data: Partial<Omit<AthleteType, "id">>) =>
      await httpClient.post("/api/timer/athletes", data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["athletes"],
      }),
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof AthleteCreateFormSchema>) => {
      return athleteCreateQuery
        .mutateAsync({
          name: values.name,
        })
        .then((response): AxiosResponse<AthleteType> => {
          toast.success(i18n.t("athleteCreate.athleteCreatedSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response?.data?.detail === "Athlete already exists") {
            form.setError("name", { message: i18n.t("athleteCreate.athleteAlreadyExists") });
            toast.error(i18n.t("athleteCreate.athleteCreateFailed"), {
              description: i18n.t("athleteCreate.athleteAlreadyExistsDescription", { name: values.name }),
            });
          } else {
            toast.error(i18n.t("athleteCreate.athleteCreateFailed"));
          }
          throw new Error(i18n.t("athleteCreate.cantCreateAthlete"));
        });
    },
    [athleteCreateQuery, form],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof AthleteCreateFormSchema>) => {
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
    async (values: z.infer<typeof AthleteCreateFormSchema>) => {
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
              <FormLabel>{i18n.t("athleteCreate.nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={i18n.t("athleteCreate.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="cursor-pointer" disabled={athleteCreateQuery.isPending}>
            {i18n.t("athleteCreate.createAndEdit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={form.handleSubmit(submitAndNavigate)}
            className="cursor-pointer"
            disabled={athleteCreateQuery.isPending}
          >
            {i18n.t("athleteCreate.createAndReturn")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
