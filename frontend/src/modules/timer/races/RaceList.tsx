import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, PencilIcon, Play, Trash2 } from "lucide-react";
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

import type { RaceType } from "../types";

export default function RaceList() {
  const queryClient = useQueryClient();

  const racesQuery = useQuery({
    queryFn: async () => (await httpClient.get("/api/timer/races")).data,
    queryKey: ["races"],
  });

  const removeQuery = useMutation({
    mutationFn: async (id: string) => await httpClient.delete(`/api/races/${id}`),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["races"] });
    },
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<RaceType>[] = useMemo(
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
            <Link to={"/races/$id"} params={{ id: userId }}>
              {userId.slice(0, 8)}
            </Link>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {i18n.t("raceList.tableHeaderName")}
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">
            <Link to={"/races/$id"} params={{ id: row.getValue("id") as string }}>
              {row.getValue("name")}
            </Link>
          </div>
        ),
      },

      {
        id: "actions",
        enableHiding: false,
        header: () => i18n.t("userList.actions"),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className={"space-x-2"}>
              <Link to="/races/$id" params={{ id: item.id }}>
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <PencilIcon />
                </Button>
              </Link>

              <Link to="/races/$id/results" params={{ id: item.id }}>
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <Play />
                </Button>
              </Link>

              <Button
                onClick={() => {
                  removeQuery
                    .mutateAsync(item.id)
                    .then(() => {
                      toast.success(i18n.t("raceList.successRemove"));
                    })
                    .catch(() => {
                      toast.error(i18n.t("raceList.errorRemove"));
                    });
                }}
                size="icon"
                className="cursor-pointer"
                variant="secondary"
              >
                <Trash2 color="red" />
              </Button>
            </div>
          );
        },
      },
    ],
    [removeQuery],
  );

  const table = useReactTable({
    data: racesQuery?.data?.items || [],
    manualPagination: true,
    rowCount: racesQuery?.data?.total || 0,

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
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={i18n.t("raceList.filterByName")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table
          className={cn("opacity-100 transition-opacity duration-300", {
            "opacity-20": racesQuery.isFetching,
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
