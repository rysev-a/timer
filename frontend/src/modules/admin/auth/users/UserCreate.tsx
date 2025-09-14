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
import type { UserType } from "../../types";
import { usersTestConfig } from "../tests/adminAuth.e2e.config";

const CreateUserFormSchema = z.object({
  email: z.string(),
  role: z.string().nullish(),
});

export default function UserCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      email: "",
      role: null,
    },
  });

  const createUserQuery = useMutation({
    mutationFn: (data: Partial<Omit<UserType, "id">>) => {
      return httpClient.post("/api/auth/users/", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof CreateUserFormSchema>) => {
      return createUserQuery
        .mutateAsync({
          email: values.email,
        })
        .then((response): AxiosResponse<UserType> => {
          toast.success(i18n.t("userCreate.createUserSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response.data.detail === "User with input already exists") {
            toast.error(i18n.t("userCreate.createUserError"), {
              description: i18n.t("userCreate.emailExistError", { email: values.email }),
            });
          } else {
            toast.error(i18n.t("userCreate.createUserError"));
          }

          throw new Error("Can't create user");
        });
    },
    [createUserQuery],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof CreateUserFormSchema>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/admin/users/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof CreateUserFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/admin/users", search: { page: 1 } });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{i18n.t("userCreate.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.con"
              required
              data-testid={usersTestConfig.newUserInputEmail}
              {...form.register("email")}
            />
          </div>

          <div className={"space-x-5"}>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={usersTestConfig.newUserSubmitButton}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
