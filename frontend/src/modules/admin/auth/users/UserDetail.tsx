import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { RoleType, UserType } from "../../types";
import { usersTestConfig } from "../tests/adminAuth.e2e.config";
import UserDetailRoles from "./UserDetailRoles";

const UpdateUserFormSchema = z.object({
  email: z.string(),
  isEnabled: z.boolean(),
  isActive: z.boolean(),
  roles: z.array(z.object({ id: z.string(), name: z.string() })),
});

export default function UserDetail({ user }: { user: UserType }) {
  const queryClient = useQueryClient();

  const userUpdateQuery = useMutation({
    mutationFn: async (data: UserType) =>
      await httpClient.patch(`/api/auth/users/${data.id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: user.email,
      isEnabled: user.is_enabled,
      isActive: user.is_active,
      roles: user.roles,
    },
  });

  const submit = useCallback(
    async (values: z.infer<typeof UpdateUserFormSchema>) => {
      try {
        await userUpdateQuery.mutateAsync({
          id: user.id,
          email: values.email,
          is_enabled: values.isEnabled,
          is_active: values.isActive,
          roles: values.roles as RoleType[],
        });
        toast.success(i18n.t("userDetail.updateUserSuccess"));
      } catch {
        toast.error(i18n.t("userDetail.updateUserError"));
      }
    },
    [userUpdateQuery, user.id],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof UpdateUserFormSchema>) => {
      await submit(values);
      return await navigate({ to: "/admin/users", search: { page: 1 } });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              data-testid={usersTestConfig.editUserInputEmail}
              {...form.register("email")}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-start gap-3">
              <FormField
                name="isEnabled"
                control={form.control}
                render={({ field }) => {
                  return (
                    <>
                      <Checkbox
                        id="is-enabled"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return field.onChange(checked);
                        }}
                      />
                      <div className="grid gap-2">
                        <Label htmlFor="is-enabled">{i18n.t("userDetail.isUserEnabled")}</Label>
                        <p className="text-muted-foreground text-sm">
                          {i18n.t("userDetail.setIsUserEnabled")}
                        </p>
                      </div>
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-start gap-3">
              <FormField
                name="isActive"
                control={form.control}
                render={({ field }) => {
                  return (
                    <>
                      <Checkbox
                        id="is-active"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return field.onChange(checked);
                        }}
                      />
                      <div className="grid gap-2">
                        <Label htmlFor="is-active">{i18n.t("userDetail.isUserActive")}</Label>
                        <p className="text-muted-foreground text-sm">
                          {i18n.t("userDetail.setIsUserActive")}
                        </p>
                      </div>
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <UserDetailRoles />
          </div>
          <div className={"space-x-5"}>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={usersTestConfig.editUserSaveButton}
            >
              {i18n.t("buttons.save")}
            </Button>
            <Button type="submit" data-testid={usersTestConfig.editUserSaveAndEditButton}>
              {i18n.t("buttons.saveAndEdit")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
