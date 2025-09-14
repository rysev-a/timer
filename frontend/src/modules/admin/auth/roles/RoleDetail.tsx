import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import RoleDetailPermissions from "@/modules/admin/auth/roles/RoleDetailPermissions";
import type { PermissionType, RoleType } from "../../types";
import { rolesTestConfig } from "../tests/adminAuth.e2e.config";

const UpdateRoleFormSchema = z.object({
  name: z.string(),
  label: z.string(),
  permissions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      app: z.string(),
    }),
  ),
});

export default function RoleDetail({ role }: { role: RoleType }) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: role.name,
      label: role.label,
      permissions: role.permissions,
    },
  });

  const updateRoleQuery = useMutation({
    mutationFn: (data: Partial<RoleType>) => {
      return httpClient.patch(`/api/auth/roles/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      return queryClient.invalidateQueries({ queryKey: ["roles", role.id] });
    },
  });

  const submit = useCallback(
    async (values: z.infer<typeof UpdateRoleFormSchema>) => {
      try {
        await updateRoleQuery.mutateAsync({
          id: role.id,
          label: values.label,
          name: values.name,
          permissions: values.permissions as PermissionType[],
        });

        toast.success(i18n.t("roleDetail.updateRoleSuccess"));
      } catch {
        toast.error(i18n.t("roleDetail.updateRoleError"));
      }
    },
    [updateRoleQuery, role.id],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof UpdateRoleFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/admin/roles", search: { page: 1 } });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{i18n.t("roleDetail.roleNameLabel")}</Label>
            <Input
              id="name"
              type="text"
              placeholder="role name"
              required
              data-testid={rolesTestConfig.editRoleNameInput}
              {...form.register("name")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">{i18n.t("roleDetail.roleLabelLabel")}</Label>
            <Input
              id="label"
              type="label"
              placeholder="role label"
              required
              data-testid={rolesTestConfig.editRoleLabelInput}
              {...form.register("label")}
            />
          </div>

          <RoleDetailPermissions />
          <div className={"space-x-5"}>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={rolesTestConfig.editRoleSubmitButton}
            >
              {i18n.t("buttons.save")}
            </Button>
            <Button type="submit">{i18n.t("buttons.saveAndEdit")}</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
