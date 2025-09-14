import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PencilIcon, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
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
import { rolesTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import type { RoleType } from "@/modules/admin/types";

export default function RoleList() {
  const queryClient = useQueryClient();

  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await httpClient.get("/api/auth/roles")).data,
  });

  const queryRemove = useMutation({
    mutationFn: (id: string) => {
      return httpClient.delete(`/api/auth/roles/${id}`);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const columns = useMemo(() => {
    return [
      {
        id: "id",
        accessorKey: "id",
        size: 50,
        header: () => <span>ID</span>,
        cell: (item) => item.getValue().slice(0, 8),
      },
      {
        id: "label",
        accessorKey: "label",
        header: () => <span>{i18n.t("roleList.label")}</span>,
        cell: (item) => item.getValue(),
      },
      {
        id: "actions",
        accessorKey: "id",
        header: () => <span>{i18n.t("roleList.actions")}</span>,
        cell: (item) => {
          const roleId = item.getValue();

          return (
            <div className={"space-x-2"}>
              <Link
                to="/admin/roles/$id"
                params={{ id: roleId }}
                data-testid={rolesTestConfig.roleTableItemEdit}
              >
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <PencilIcon />
                </Button>
              </Link>
              <Button
                data-testid={rolesTestConfig.roleTableItemDelete}
                size="icon"
                className="cursor-pointer"
                variant="secondary"
                onClick={() => {
                  queryRemove.mutateAsync(roleId).catch(() => {
                    toast.error("Can't remove role");
                  });
                }}
              >
                <Trash2 color={"red"} />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [queryRemove]);

  const table = useReactTable({
    data: roles.isFetched ? roles.data.items : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      className={cn("opacity-100 transition-opacity duration-300", {
        "opacity-20": roles.isFetching,
      })}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: `${header.getSize()}px` }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          return (
            <TableRow key={row.id} data-testid={rolesTestConfig.roleTableItem}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter className={"my-5"}>
        <TableRow>
          <TableCell colSpan={table.getAllColumns().length}>
            <Link to={"/admin/roles/new"}>
              <Button>{i18n.t("roleList.create")}</Button>
            </Link>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
