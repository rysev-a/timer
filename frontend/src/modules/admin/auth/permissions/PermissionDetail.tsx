import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import { permissionsTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import type { PermissionType } from "@/modules/admin/types";

const permissionDetailFormSchema = z.object({
  label: z.string(),
  name: z.string(),
  app: z.string(),
  action: z.string(),
});

export default function PermissionDetail({ permission }: { permission: PermissionType }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof permissionDetailFormSchema>>({
    defaultValues: {
      label: permission.label,
      name: permission.name,
      app: permission.app,
      action: permission.action,
    },
  });

  const navigate = useNavigate();

  const updatePermissionQuery = useMutation({
    mutationFn: (values: PermissionType) => {
      return httpClient.patch(`/api/auth/permissions/${values.id}`, values);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  const submit = useCallback(
    (values: z.infer<typeof permissionDetailFormSchema>) => {
      return updatePermissionQuery.mutateAsync({
        id: permission.id,
        ...values,
      });
    },
    [updatePermissionQuery, permission.id],
  );

  const submitAndNavigate = useCallback(
    (values: z.infer<typeof permissionDetailFormSchema>) => {
      submit(values).then(() => {
        return navigate({ to: "/admin/permissions", search: { page: 1 } });
      });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Permission label</Label>
            <Input
              id="label"
              type="text"
              placeholder="Создание пользователя"
              required
              data-testid={permissionsTestConfig.editPermissionLabelInput}
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
              data-testid={permissionsTestConfig.editPermissionNameInput}
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
              data-testid={permissionsTestConfig.editPermissionAppInput}
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
              data-testid={permissionsTestConfig.editPermissionActionInput}
              {...form.register("action")}
            />
          </div>

          <div className={"space-x-5"}>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={permissionsTestConfig.editPermissionSubmitButton}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
