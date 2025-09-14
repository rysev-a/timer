"use client";

import { useQuery } from "@tanstack/react-query";
import { map } from "rambda";
import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { RoleType } from "@/modules/admin/types";

const serializeRole = (role: RoleType) => ({
  label: role.label,
  value: role.id,
});

export default function UserDetailRoles() {
  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      return (await httpClient.get("/api/auth/roles")).data;
    },
  });

  const form = useFormContext();

  return (
    <FormField
      name="roles"
      control={form.control}
      render={({ field }) => (
        <MultiSelect
          options={
            roles.isFetched
              ? map<RoleType[], { label: string; value: string }>(serializeRole)(roles.data.items)
              : []
          }
          value={map<RoleType[], string>((role) => role.id)(field.value)}
          onChange={(event) => {
            field.onChange(roles.data.items.filter((role: RoleType) => event.includes(role.id)));
          }}
          placeholder={i18n.t("userDetail.selectUserRoles")}
          searchPlaceholder={i18n.t("userDetail.searchRolesPlaceholder")}
          isLoading={roles.isLoading}
          clearAllMessage={i18n.t("multiSelect.clearAllMessage")}
        />
      )}
    />
  );
}
