import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, type UseNavigateResult } from "@tanstack/react-router";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, PencilIcon, Trash2 } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TablePagination from "@/components/common/table/table-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import { cn } from "@/lib/utils";
import { isUserRoles } from "@/package";
import type { UserType } from "../../types";
import { usersTestConfig } from "../tests/adminAuth.e2e.config";

export default function UserList({
  page,
  navigate,
}: {
  page: number;
  navigate: UseNavigateResult<"/admin/users">;
}) {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: 10,
  });

  useEffect(() => {
    navigate({
      search: () => {
        return { page: pagination.pageIndex + 1 };
      },
    });
  }, [pagination.pageIndex, navigate]);

  const urlParams = new URLSearchParams({
    currentPage: String(pagination.pageIndex + 1),
    pageSize: String(pagination.pageSize),
  }).toString();

  const usersQuery = useQuery({
    queryFn: async () => (await httpClient.get(`/api/auth/users?${urlParams}`)).data,
    queryKey: ["users", urlParams],
  });

  const userRemoveQuery = useMutation({
    mutationFn: async (id: string) => await httpClient.delete(`/api/auth/users/${id}`),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<UserType>[] = useMemo(
    () => [
      {
        id: "select",
        maxSize: 10,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        maxSize: 30,
        cell: ({ row }) => {
          const userId = row.getValue("id") as string;

          return (
            <Link to={"/admin/users/$id"} params={{ id: userId }}>
              {userId.slice(0, 8)}
            </Link>
          );
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Email
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">
            <Link
              to={"/admin/users/$id"}
              params={{ id: row.getValue("id") as string }}
              data-testid={usersTestConfig.editUserButton}
            >
              {row.getValue("email")}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: () => {
          return i18n.t("userList.userActive");
        },
        cell: ({ row }) => {
          return <Checkbox disabled checked={row.getValue("is_active")} />;
        },
      },
      {
        accessorKey: "is_enabled",
        header: () => {
          return i18n.t("userList.userEnabled");
        },
        cell: ({ row }) => {
          return <Checkbox disabled checked={row.getValue("is_enabled")} />;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => i18n.t("userList.actions"),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className={"space-x-2"}>
              <Link to="/admin/users/$id" params={{ id: item.id }}>
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <PencilIcon />
                </Button>
              </Link>
              {isUserRoles(["admin"]) && (
                <Button
                  data-testid={usersTestConfig.deleteUserButton}
                  onClick={() => {
                    userRemoveQuery
                      .mutateAsync(item.id)
                      .then(() => {
                        toast.success(i18n.t("userList.successRemove"));
                      })
                      .catch(() => {
                        toast.error(i18n.t("userList.errorRemove"));
                      });
                  }}
                  size="icon"
                  className="cursor-pointer"
                  variant="secondary"
                >
                  <Trash2 color="red" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [userRemoveQuery],
  );

  const table = useReactTable({
    data: usersQuery?.data?.items || [],
    manualPagination: true,
    rowCount: usersQuery?.data?.total || 0,

    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },

    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageIndex: 1,
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={i18n.t("userList.filterByEmail")}
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table
          data-testid={usersTestConfig.usersTable}
          className={cn("opacity-100 transition-opacity duration-300", {
            "opacity-20": usersQuery.isFetching,
          })}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody data-testid={usersTestConfig.usersTableBody}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  data-testid={usersTestConfig.userTableItem}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <TablePagination table={table} />
      </div>

      <Link to={"/admin/users/new"}>
        <Button className={"cursor-pointer"}> {i18n.t("userList.create")}</Button>
      </Link>
    </div>
  );
}
