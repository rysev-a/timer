import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilIcon, Trash2 } from "lucide-react";
import * as React from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import { cn } from "@/lib/utils";
import type { PermissionType } from "@/modules/admin/types";
import { permissionsTestConfig } from "../tests/adminAuth.e2e.config";

export default function PermissionList() {
  const columnHelper = createColumnHelper<PermissionType>();

  const queryClient = useQueryClient();

  const permissions = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => (await httpClient.get("/api/auth/permissions")).data,
  });

  const removePermissionQuery = useMutation({
    mutationFn: async (id: string) => await httpClient.delete(`/api/auth/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.id, {
        size: 50,
        id: "id",
        cell: (info) => info.getValue().slice(0, 8),
        header: () => <span>id</span>,
      }),

      columnHelper.accessor((row) => row.label, {
        id: "label",
        cell: (info) => info.getValue(),
        header: () => <span>{i18n.t("permissionList.label")}</span>,
      }),

      columnHelper.accessor((row) => row.id, {
        id: "actions",
        header: () => {
          i18n.t("permissionList.actions");
        },

        cell: (info) => {
          const id = info.getValue();

          return (
            <div className={"space-x-2"}>
              <Link
                to={"/admin/permissions/$id"}
                params={{ id }}
                data-testid={permissionsTestConfig.editPermissionTableItem}
              >
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <PencilIcon />
                </Button>
              </Link>

              <Button
                onClick={() => removePermissionQuery.mutate(id)}
                size={"icon"}
                className={"cursor-pointer"}
                variant={"secondary"}
              >
                <Trash2 color={"red"} />
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [columnHelper, removePermissionQuery]);

  const table = useReactTable({
    columns,
    data: permissions.isFetched ? permissions.data.items : [],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      className={cn("opacity-100 transition-opacity duration-300", {
        "opacity-20": permissions.isFetching,
      })}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                style={{ width: `${header.getSize()}px` }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-testid={permissionsTestConfig.permissionTableItem}>
            {row.getVisibleCells().map((cell) => {
              return (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className={"my-5"}>
        <TableRow>
          <TableCell colSpan={table.getAllColumns().length}>
            <Link to={"/admin/permissions/new"}>
              <Button>{i18n.t("permissionList.create")}</Button>
            </Link>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
