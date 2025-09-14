import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
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
import type { RaceType } from "../types";

const CreateRaceFormSchema = z.object({
  name: z.string(),
});

export default function RaceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  const createQuery = useMutation({
    mutationFn: (data: Partial<Omit<RaceType, "id">>) => {
      return httpClient.post("/api/timer/races/", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["races"] });
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof CreateRaceFormSchema>) => {
      return createQuery
        .mutateAsync({
          name: values.name,
        })
        .then((response): AxiosResponse<RaceType> => {
          toast.success(i18n.t("userCreate.createRaceSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response.data.detail === "Race with input already exists") {
            toast.error(i18n.t("userCreate.createRaceError"), {
              description: i18n.t("userCreate.emailExistError", { name: values.name }),
            });
          } else {
            toast.error(i18n.t("userCreate.createRaceError"));
          }

          throw new Error("Can't create user");
        });
    },
    [createQuery],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof CreateRaceFormSchema>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/races/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof CreateRaceFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/races" });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{i18n.t("raceCreate.nameLabel")}</Label>
            <Input
              id="name"
              type="text"
              required
              {...form.register("name")}
            />
          </div>

          <div className={"space-x-5"}>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
