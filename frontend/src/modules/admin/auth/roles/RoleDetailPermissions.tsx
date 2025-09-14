import { useQuery } from "@tanstack/react-query";
import { filter, map } from "rambda";
import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import { rolesTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import type { PermissionType } from "@/modules/admin/types";

export default function RoleDetailPermissions() {
  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => (await httpClient.get("/api/auth/permissions")).data,
  });

  const form = useFormContext();

  return (
    <div className="grid gap-2">
      <Label>{i18n.t("roleDetail.rolePermissions")}</Label>

      <FormField
        control={form.control}
        name={"permissions"}
        render={({ field }) => {
          return (
            <MultiSelect
              triggerDataId={rolesTestConfig.rolePermissionsMultiselect}
              placeholder={"Select role permissions"}
              value={map<PermissionType[], string>((permission) => permission.id)(field.value)}
              onChange={(e) => {
                field.onChange(
                  filter((permission: PermissionType) => e.includes(permission.id))(
                    permissionsQuery?.data?.items,
                  ),
                );
              }}
              options={
                permissionsQuery.isFetched
                  ? map<PermissionType[], { label: string; value: string }>(
                      (permission: PermissionType) => {
                        return {
                          label: permission.label,
                          value: permission.id,
                        };
                      },
                    )(permissionsQuery?.data?.items)
                  : []
              }
            />
          );
        }}
      />
    </div>
  );
}
