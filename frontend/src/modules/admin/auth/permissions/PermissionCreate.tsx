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
import type { PermissionType } from "../../types";
import { permissionsTestConfig } from "../tests/adminAuth.e2e.config";

export const permissionCreateForm = z.object({
  name: z.string().min(2).max(100),
  app: z.string().min(2).max(100),
  label: z.string().min(2).max(100),
  action: z.string().min(2).max(100),
});

export default function PermissionCreate() {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof permissionCreateForm>>({
    defaultValues: {
      name: "",
      app: "",
      label: "",
      action: "",
    },
  });

  const permissionQueryMutate = useMutation({
    mutationFn: async (data: z.infer<typeof permissionCreateForm>) => {
      return httpClient.post("/api/auth/permissions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof permissionCreateForm>) => {
      return permissionQueryMutate
        .mutateAsync(values)
        .then((response): AxiosResponse<PermissionType> => {
          toast.success("Success create permission!");
          return response;
        })
        .catch(({ response }) => {
          if (response.data.detail) {
            toast.error("Can't create permission", {
              description: response.data.detail,
            });
          } else {
            toast.error("Can't create permission");
          }
        });
    },
    [permissionQueryMutate],
  );

  const navigate = useNavigate();

  const submitAndNavigate = useCallback(
    (values: z.infer<typeof permissionCreateForm>) => {
      submit(values).then(() => {
        navigate({ to: "/admin/permissions" });
      });
    },
    [submit, navigate],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof permissionCreateForm>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/admin/permissions/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Permission label</Label>
            <Input
              id="label"
              type="text"
              placeholder="Создание пользователя"
              required
              data-testid={permissionsTestConfig.newPermissionLabelInput}
              {...form.register("label")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Permission name</Label>
            <Input
              id="name"
              type="text"
              placeholder="user create"
              required
              data-testid={permissionsTestConfig.newPermissionNameInput}
              {...form.register("name")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Permission application</Label>
            <Input
              id="app"
              type="text"
              placeholder="users"
              required
              data-testid={permissionsTestConfig.newPermissionAppInput}
              {...form.register("app")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Permission action</Label>
            <Input
              id="app"
              type="text"
              placeholder="create"
              required
              data-testid={permissionsTestConfig.newPermissionActionInput}
              {...form.register("action")}
            />
          </div>

          <div className={"space-x-5"}>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={permissionsTestConfig.newPermissionSubmitButton}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
