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
import type { RoleType } from "../../types";
import { rolesTestConfig } from "../tests/adminAuth.e2e.config";

const CreateRoleFormSchema = z.object({
  name: z.string(),
  label: z.string(),
});

export default function RoleCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      label: "",
    },
  });

  const createRoleQuery = useMutation({
    mutationFn: (data: Partial<Omit<RoleType, "id">>) => {
      return httpClient.post("/api/auth/roles/", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof CreateRoleFormSchema>) => {
      return createRoleQuery
        .mutateAsync(values)
        .then((response): AxiosResponse<RoleType> => {
          toast.success(i18n.t("roleCreate.createRoleSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response.data.detail) {
            toast.error(i18n.t("roleCreate.createRoleError"), {
              description: response.data.detail,
            });
          } else {
            toast.error(i18n.t("roleCreatecreateRoleError."));
          }
          throw new Error("Can't create role");
        });
    },
    [createRoleQuery],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof CreateRoleFormSchema>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/admin/roles/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof CreateRoleFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/admin/roles", search: { page: 1 } });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{i18n.t("roleCreate.roleNameLabel")}</Label>
            <Input
              id="name"
              type="name"
              placeholder="role name"
              required
              data-testid={rolesTestConfig.newRoleNameInput}
              {...form.register("name")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">{i18n.t("roleCreate.roleLabelLabel")}</Label>
            <Input
              id="label"
              type="label"
              placeholder="role label"
              required
              data-testid={rolesTestConfig.newRoleLabelInput}
              {...form.register("label")}
            />
          </div>

          <div className={"space-x-5"}>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={rolesTestConfig.newRoleSubmitButton}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
